-- =========================================================
-- SEED BASE (idempotente)
-- =========================================================
-- Ordem:
-- 1) Rodar schema.sql
-- 2) Rodar storage-policies.sql
-- 3) Rodar este arquivo

begin;

-- ---------------------------------------------------------
-- 1) CATEGORIES (hierarquia)
-- ---------------------------------------------------------
insert into public.categories (name, slug, parent_id, is_active, sort_order)
values
  ('Vestidos', 'vestidos', null, true, 10),
  ('Partes de cima', 'partes-de-cima', null, true, 20),
  ('Partes de baixo', 'partes-de-baixo', null, true, 30),
  ('Conjuntos', 'conjuntos', null, true, 40)
on conflict (slug) do update
set
  name = excluded.name,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.categories (name, slug, parent_id, is_active, sort_order)
select
  'Croppeds',
  'croppeds',
  c.id,
  true,
  10
from public.categories c
where c.slug = 'partes-de-cima'
on conflict (slug) do update
set
  name = excluded.name,
  parent_id = excluded.parent_id,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

insert into public.categories (name, slug, parent_id, is_active, sort_order)
select
  x.name,
  x.slug,
  c.id,
  true,
  x.sort_order
from public.categories c
cross join (
  values
    ('Calças', 'calcas', 10),
    ('Saias', 'saias', 20)
) as x(name, slug, sort_order)
where c.slug = 'partes-de-baixo'
on conflict (slug) do update
set
  name = excluded.name,
  parent_id = excluded.parent_id,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order;

-- ---------------------------------------------------------
-- 2) COLORS
-- ---------------------------------------------------------
insert into public.colors (name, slug, hex_code, is_active)
values
  ('Animal print', 'animal-print', '#8F674B', true),
  ('Rosa claro', 'rosa-claro', '#F1B7C8', true),
  ('Off-white', 'off-white', '#F3EEE6', true),
  ('Preto', 'preto', '#1C1C1C', true),
  ('Rosa', 'rosa', '#E8A1B3', true),
  ('Nude', 'nude', '#DCB6A1', true),
  ('Branco', 'branco', '#F7F4EF', true),
  ('Vermelho', 'vermelho', '#C94157', true),
  ('Marrom', 'marrom', '#6A4534', true),
  ('Creme', 'creme', '#E6D8C4', true),
  ('Estampada', 'estampada', '#86705C', true),
  ('Verde', 'verde', '#73816A', true)
on conflict (slug) do update
set
  name = excluded.name,
  hex_code = excluded.hex_code,
  is_active = excluded.is_active;

insert into public.colors (name, slug, hex_code, is_active)
values ('Bege', 'bege', '#D8C3A5', true)
on conflict (slug) do update
set
  name = excluded.name,
  hex_code = excluded.hex_code,
  is_active = excluded.is_active;

-- ---------------------------------------------------------
-- 3) SIZES
-- ---------------------------------------------------------
insert into public.sizes (name, slug, sort_order, is_active)
values
  ('P', 'p', 10, true),
  ('M', 'm', 20, true),
  ('G', 'g', 30, true),
  ('36', '36', 40, true),
  ('38', '38', 50, true),
  ('40', '40', 60, true),
  ('42', '42', 70, true)
on conflict (slug) do update
set
  name = excluded.name,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

-- ---------------------------------------------------------
-- 4) PRODUCTS (amostra inicial)
-- ---------------------------------------------------------
insert into public.products (
  name, slug, category_id, description, composition, price_cents,
  is_visible, is_hot, show_in_new_arrivals_manual
)
select
  x.name,
  x.slug,
  c.id,
  x.description,
  x.composition,
  x.price_cents,
  true,
  x.is_hot,
  x.is_new_manual
from (
  values
    (
      'Vestido Oncinha',
      'vestido-oncinha',
      'vestidos',
      'Vestido curto com visual de impacto e proposta direta para produções noturnas ou eventos casuais.',
      'Tecido leve com toque macio e caimento fluido.',
      18990,
      true,
      false
    ),
    (
      'Cropped Babado',
      'cropped-babado',
      'croppeds',
      'Peça compacta com acabamento em babado, pensada para combinações leves e leitura mais romântica.',
      'Malha leve com toque confortável para uso diário.',
      9990,
      false,
      false
    ),
    (
      'Calça Cargo Creme',
      'calca-cargo-creme',
      'calcas',
      'Modelo cargo em tom creme, com leitura mais leve e bolsos que reforçam a proposta utilitária da peça.',
      'Sarja leve com estrutura confortável para uso diário.',
      15990,
      false,
      true
    ),
    (
      'Saia Flor Dourada',
      'saia-flor-dourada',
      'saias',
      'Saia com leitura marcante para combinações elegantes e compactas.',
      'Tecido estruturado com toque firme.',
      14990,
      true,
      true
    ),
    (
      'Conjunto Bege',
      'conjunto-bege',
      'conjuntos',
      'Conjunto versátil para composição rápida e visual alinhado.',
      'Tecido com toque macio e caimento confortável.',
      21990,
      true,
      true
    )
) as x(name, slug, category_slug, description, composition, price_cents, is_hot, is_new_manual)
join public.categories c
  on c.slug = x.category_slug
on conflict (slug) do update
set
  name = excluded.name,
  category_id = excluded.category_id,
  description = excluded.description,
  composition = excluded.composition,
  price_cents = excluded.price_cents,
  is_visible = excluded.is_visible,
  is_hot = excluded.is_hot,
  show_in_new_arrivals_manual = excluded.show_in_new_arrivals_manual;

-- ---------------------------------------------------------
-- 5) VARIANTS (amostra inicial)
-- ---------------------------------------------------------
insert into public.product_variants (
  product_id, color_id, size_id, sku, price_cents, stock_quantity, is_available
)
select
  p.id,
  co.id,
  s.id,
  x.sku,
  null,
  x.stock_qty,
  true
from (
  values
    ('vestido-oncinha', 'animal-print', 'p', 'MLR-VONC-ANI-P', 5),
    ('vestido-oncinha', 'animal-print', 'm', 'MLR-VONC-ANI-M', 8),
    ('vestido-oncinha', 'animal-print', 'g', 'MLR-VONC-ANI-G', 6),

    ('cropped-babado', 'rosa-claro', 'p', 'MLR-CRBAB-ROS-P', 12),
    ('cropped-babado', 'rosa-claro', 'm', 'MLR-CRBAB-ROS-M', 12),
    ('cropped-babado', 'rosa-claro', 'g', 'MLR-CRBAB-ROS-G', 10),

    ('calca-cargo-creme', 'creme', '36', 'MLR-CCRE-CRE-36', 7),
    ('calca-cargo-creme', 'creme', '38', 'MLR-CCRE-CRE-38', 9),
    ('calca-cargo-creme', 'creme', '40', 'MLR-CCRE-CRE-40', 8),
    ('calca-cargo-creme', 'creme', '42', 'MLR-CCRE-CRE-42', 6),

    ('saia-flor-dourada', 'preto', 'p', 'MLR-SFD-PRT-P', 6),
    ('saia-flor-dourada', 'preto', 'm', 'MLR-SFD-PRT-M', 7),
    ('saia-flor-dourada', 'preto', 'g', 'MLR-SFD-PRT-G', 5),

    ('conjunto-bege', 'bege', 'p', 'MLR-CBEG-BEG-P', 4),
    ('conjunto-bege', 'bege', 'm', 'MLR-CBEG-BEG-M', 5),
    ('conjunto-bege', 'bege', 'g', 'MLR-CBEG-BEG-G', 4)
) as x(product_slug, color_slug, size_slug, sku, stock_qty)
join public.products p on p.slug = x.product_slug
join public.colors co on co.slug = x.color_slug
join public.sizes s on s.slug = x.size_slug
on conflict (sku) do update
set
  product_id = excluded.product_id,
  color_id = excluded.color_id,
  size_id = excluded.size_id,
  stock_quantity = excluded.stock_quantity,
  is_available = excluded.is_available;

-- ---------------------------------------------------------
-- 6) PRODUCT IMAGES (amostra inicial, 3 por cor)
-- ---------------------------------------------------------
insert into public.product_images (product_id, color_id, image_url, storage_path, sort_order)
select
  p.id,
  co.id,
  x.image_url,
  x.storage_path,
  x.sort_order
from (
  values
    ('vestido-oncinha', 'animal-print', '/images/roupas/vestidos/vestido_oncinha/F7275995.webp', 'seed/vestido-oncinha/1.webp', 0),
    ('vestido-oncinha', 'animal-print', '/images/roupas/vestidos/vestido_oncinha/9F8927B2.webp', 'seed/vestido-oncinha/2.webp', 1),

    ('cropped-babado', 'rosa-claro', '/images/roupas/partes_de_cima/croppeds/cropped_babado/8473FFE0.webp', 'seed/cropped-babado/1.webp', 0),
    ('cropped-babado', 'rosa-claro', '/images/roupas/partes_de_cima/croppeds/cropped_babado/IMG_8611.webp', 'seed/cropped-babado/2.webp', 1),
    ('cropped-babado', 'rosa-claro', '/images/roupas/partes_de_cima/croppeds/cropped_babado/IMG_8905.webp', 'seed/cropped-babado/3.webp', 2),

    ('calca-cargo-creme', 'creme', '/images/roupas/partes_de_baixo/calcas/calca_cargocreme/12CBA691.webp', 'seed/calca-cargo-creme/1.webp', 0),
    ('calca-cargo-creme', 'creme', '/images/roupas/partes_de_baixo/calcas/calca_cargocreme/48EFE8A7.webp', 'seed/calca-cargo-creme/2.webp', 1),
    ('calca-cargo-creme', 'creme', '/images/roupas/partes_de_baixo/calcas/calca_cargocreme/AB19AD01.webp', 'seed/calca-cargo-creme/3.webp', 2)
) as x(product_slug, color_slug, image_url, storage_path, sort_order)
join public.products p on p.slug = x.product_slug
join public.colors co on co.slug = x.color_slug
on conflict (storage_path) do update
set
  image_url = excluded.image_url,
  sort_order = excluded.sort_order;

commit;

-- =========================================================
-- NOTA
-- =========================================================
-- Este seed cobre a base inicial e amostras.
-- Para migrar 100% do catálogo atual, repetir o padrão das seções
-- PRODUCTS / VARIANTS / PRODUCT_IMAGES para todos os slugs do data/products.ts.
