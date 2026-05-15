-- Reserva de estoque "flutuante" para pedidos
-- Objetivo:
-- 1) impedir venda duplicada enquanto pedido está em andamento;
-- 2) manter baixa definitiva de estoque apenas na entrega;
-- 3) liberar reserva no cancelamento.

alter table public.product_variants
  add column if not exists reserved_quantity integer not null default 0 check (reserved_quantity >= 0);

alter table public.orders
  add column if not exists stock_reserved_at timestamptz;

create or replace function public.reserve_order_inventory(p_order_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  order_row public.orders%rowtype;
  item_row record;
  updated_rows integer;
begin
  select *
  into order_row
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Pedido não encontrado para reserva.';
  end if;

  if order_row.status not in ('pending', 'approved', 'paid') then
    raise exception 'Este status de pedido não permite reserva de estoque.';
  end if;

  if order_row.stock_reserved_at is not null then
    return;
  end if;

  for item_row in
    select oi.variant_id, sum(oi.quantity)::integer as required_qty
    from public.order_items oi
    where oi.order_id = p_order_id
    group by oi.variant_id
  loop
    update public.product_variants pv
    set reserved_quantity = pv.reserved_quantity + item_row.required_qty,
        updated_at = now()
    where pv.id = item_row.variant_id
      and pv.is_available = true
      and (pv.stock_quantity - pv.reserved_quantity) >= item_row.required_qty;

    get diagnostics updated_rows = row_count;
    if updated_rows = 0 then
      raise exception 'Um ou mais itens não possuem estoque suficiente no momento.';
    end if;
  end loop;

  if not exists (select 1 from public.order_items where order_id = p_order_id) then
    raise exception 'Este pedido não possui itens para reserva.';
  end if;

  update public.orders
  set stock_reserved_at = now(),
      updated_at = now()
  where id = p_order_id;
end;
$$;

create or replace function public.apply_order_inventory_transition(
  p_order_id uuid,
  p_next_status text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  order_row public.orders%rowtype;
  item_row record;
  updated_rows integer;
begin
  select *
  into order_row
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Pedido não encontrado para atualização de estoque.';
  end if;

  if p_next_status not in ('pending', 'approved', 'paid', 'delivered', 'cancelled') then
    raise exception 'Status inválido para atualização de estoque.';
  end if;

  if order_row.status = p_next_status then
    return;
  end if;

  if p_next_status in ('pending', 'approved', 'paid') and order_row.stock_reserved_at is null then
    perform public.reserve_order_inventory(p_order_id);
    return;
  end if;

  if p_next_status = 'delivered' then
    for item_row in
      select oi.variant_id, sum(oi.quantity)::integer as required_qty
      from public.order_items oi
      where oi.order_id = p_order_id
      group by oi.variant_id
    loop
      if order_row.stock_reserved_at is not null then
        update public.product_variants pv
        set stock_quantity = pv.stock_quantity - item_row.required_qty,
            reserved_quantity = pv.reserved_quantity - item_row.required_qty,
            updated_at = now()
        where pv.id = item_row.variant_id
          and pv.stock_quantity >= item_row.required_qty
          and pv.reserved_quantity >= item_row.required_qty;
      else
        update public.product_variants pv
        set stock_quantity = pv.stock_quantity - item_row.required_qty,
            updated_at = now()
        where pv.id = item_row.variant_id
          and pv.stock_quantity >= item_row.required_qty;
      end if;

      get diagnostics updated_rows = row_count;
      if updated_rows = 0 then
        raise exception 'Não foi possível finalizar: estoque insuficiente para um dos itens.';
      end if;
    end loop;

    update public.orders
    set stock_reserved_at = null,
        updated_at = now()
    where id = p_order_id;

    return;
  end if;

  if p_next_status = 'cancelled' and order_row.stock_reserved_at is not null then
    for item_row in
      select oi.variant_id, sum(oi.quantity)::integer as required_qty
      from public.order_items oi
      where oi.order_id = p_order_id
      group by oi.variant_id
    loop
      update public.product_variants pv
      set reserved_quantity = pv.reserved_quantity - item_row.required_qty,
          updated_at = now()
      where pv.id = item_row.variant_id
        and pv.reserved_quantity >= item_row.required_qty;

      get diagnostics updated_rows = row_count;
      if updated_rows = 0 then
        raise exception 'Não foi possível liberar a reserva de um dos itens.';
      end if;
    end loop;

    update public.orders
    set stock_reserved_at = null,
        updated_at = now()
    where id = p_order_id;
  end if;
end;
$$;

revoke all on function public.reserve_order_inventory(uuid) from public;
grant execute on function public.reserve_order_inventory(uuid) to authenticated, service_role;

revoke all on function public.apply_order_inventory_transition(uuid, text) from public;
grant execute on function public.apply_order_inventory_transition(uuid, text) to authenticated, service_role;

create index if not exists idx_product_variants_reserved on public.product_variants(reserved_quantity);
