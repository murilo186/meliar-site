-- =========================================================
-- Ajustes opcionais para fluxo de pedidos via WhatsApp
-- Data: 2026-05-08
-- =========================================================
-- Este script não é obrigatório para o fluxo já implementado
-- no app (que grava via service_role no backend), mas melhora
-- rastreabilidade e padroniza número de pedido no banco.

begin;

-- 1) Número legível de pedido (determinístico)
alter table public.orders
  add column if not exists order_number text;

update public.orders
set order_number = '#' || upper(left(replace(id::text, '-', ''), 8))
where order_number is null;

create unique index if not exists idx_orders_order_number_unique
  on public.orders(order_number)
  where order_number is not null;

create or replace function public.fill_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null then
    new.order_number := '#' || upper(left(replace(new.id::text, '-', ''), 8));
  end if;

  return new;
end;
$$;

drop trigger if exists trg_orders_fill_order_number on public.orders;
create trigger trg_orders_fill_order_number
before insert on public.orders
for each row
execute function public.fill_order_number();

commit;
