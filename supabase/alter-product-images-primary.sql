-- =========================================================
-- Imagem principal por produto/cor
-- =========================================================

alter table public.product_images
  add column if not exists is_primary boolean not null default false;

-- Garante uma principal inicial quando ainda não existe nenhuma por produto/cor
with ranked as (
  select
    id,
    row_number() over (
      partition by product_id, coalesce(color_id, '00000000-0000-0000-0000-000000000000'::uuid)
      order by sort_order asc, created_at asc
    ) as rn
  from public.product_images
)
update public.product_images pi
set is_primary = true
from ranked r
where pi.id = r.id
  and r.rn = 1
  and not exists (
    select 1
    from public.product_images p2
    where p2.product_id = pi.product_id
      and coalesce(p2.color_id, '00000000-0000-0000-0000-000000000000'::uuid)
        = coalesce(pi.color_id, '00000000-0000-0000-0000-000000000000'::uuid)
      and p2.is_primary = true
  );
