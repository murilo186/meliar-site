-- =========================================================
-- Métricas otimizadas para Admin (contagens em 1 round-trip)
-- =========================================================
-- Rodar após schema.sql

create or replace function public.admin_orders_counters()
returns table(
  total bigint,
  pending bigint,
  approved bigint,
  paid bigint,
  delivered bigint,
  cancelled bigint
)
language sql
stable
as $$
  select
    count(*)::bigint as total,
    count(*) filter (where o.status = 'pending')::bigint as pending,
    count(*) filter (where o.status = 'approved')::bigint as approved,
    count(*) filter (where o.status = 'paid')::bigint as paid,
    count(*) filter (where o.status = 'delivered')::bigint as delivered,
    count(*) filter (where o.status = 'cancelled')::bigint as cancelled
  from public.orders o;
$$;

create or replace function public.admin_stock_counters(
  p_search text default null,
  p_only_low boolean default false,
  p_only_zero boolean default false,
  p_only_inactive boolean default false
)
returns table(
  total bigint,
  zero_count bigint,
  low_count bigint
)
language sql
stable
as $$
  with filtered as (
    select
      v.stock_quantity
    from public.product_variants v
    left join public.products p on p.id = v.product_id
    left join public.colors c on c.id = v.color_id
    left join public.sizes s on s.id = v.size_id
    where
      (not p_only_zero or v.stock_quantity = 0)
      and (not p_only_low or (v.stock_quantity > 0 and v.stock_quantity <= 3))
      and (not p_only_inactive or v.is_available = false)
      and (
        p_search is null
        or btrim(p_search) = ''
        or v.sku ilike ('%' || p_search || '%')
        or coalesce(p.name, '') ilike ('%' || p_search || '%')
        or coalesce(c.name, '') ilike ('%' || p_search || '%')
        or coalesce(s.name, '') ilike ('%' || p_search || '%')
      )
  )
  select
    count(*)::bigint as total,
    count(*) filter (where stock_quantity = 0)::bigint as zero_count,
    count(*) filter (where stock_quantity > 0 and stock_quantity <= 3)::bigint as low_count
  from filtered;
$$;
