-- =========================================================
-- Ajustes incrementais para Admin de Produtos
-- =========================================================
-- Rodar após schema.sql

alter table public.products
  add column if not exists old_price_cents integer check (old_price_cents is null or old_price_cents > 0);

alter table public.products
  add column if not exists description text;

insert into public.sizes (name, slug, sort_order, is_active)
values ('Único', 'unico', 35, true)
on conflict (slug) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;
