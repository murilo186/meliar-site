-- =========================================================
-- SEED DE PEDIDOS (idempotente) - vitrine/admin vendas
-- =========================================================
-- Pré-requisito:
-- 1) schema.sql aplicado
-- 2) seed-admin-base.sql aplicado (produtos/variantes base)
--
-- Este seed cria pedidos de exemplo em vários status para validar:
-- - /admin/vendas
-- - /admin/vendas/[id]
-- - /perfil e /perfil/pedidos/[id]

begin;

with variant_ref as (
  select
    pv.id as variant_id,
    p.slug as product_slug,
    c.slug as color_slug,
    s.slug as size_slug
  from public.product_variants pv
  join public.products p on p.id = pv.product_id
  join public.colors c on c.id = pv.color_id
  join public.sizes s on s.id = pv.size_id
),
orders_seed as (
  select *
  from (
    values
      ('a13de111-4d14-4f44-8e0f-08f59e0a0001'::uuid, 'whatsapp', 'pending',   'Mariana Souza',      '5581988881111', 'mariana.souza@email.com', 28980, 'Pedido iniciado via WhatsApp.'),
      ('b24ef222-4d14-4f44-8e0f-08f59e0a0002'::uuid, 'whatsapp', 'approved',  'Ana Carolina',       '5581999912345', 'ana.carolina@email.com', 30980, 'Cliente confirmou endereço e dados.'),
      ('c35fa333-4d14-4f44-8e0f-08f59e0a0003'::uuid, 'manual',   'paid',      'Bruna Ferreira',     '5581977002211', 'bruna.ferreira@email.com', 21990, null),
      ('d46ab444-4d14-4f44-8e0f-08f59e0a0004'::uuid, 'whatsapp', 'delivered', 'Camila Nunes',       '5581977554400', 'camila.nunes@email.com', 37980, 'Entrega finalizada com sucesso.'),
      ('e57bc555-4d14-4f44-8e0f-08f59e0a0005'::uuid, 'whatsapp', 'cancelled', 'Juliana Campos',     '5581966665522', 'juliana.campos@email.com', 9990,  'Cliente desistiu durante negociação.'),
      ('f68cd666-4d14-4f44-8e0f-08f59e0a0006'::uuid, 'whatsapp', 'pending',   'Paula Menezes',      '5581944447788', 'paula.menezes@email.com', 35970, null),
      ('a79de777-4d14-4f44-8e0f-08f59e0a0007'::uuid, 'manual',   'approved',  'Larissa Matos',      '5581977773311', 'larissa.matos@email.com', 36980, null),
      ('b80ef888-4d14-4f44-8e0f-08f59e0a0008'::uuid, 'whatsapp', 'paid',      'Fernanda Lima',      '5581982201144', 'fernanda.lima@email.com', 15990, null),
      ('c91fa999-4d14-4f44-8e0f-08f59e0a0009'::uuid, 'whatsapp', 'delivered', 'Rafaela Tavares',    '5581981122334', 'rafaela.tavares@email.com', 29970, null),
      ('d02abaaa-4d14-4f44-8e0f-08f59e0a0010'::uuid, 'whatsapp', 'pending',   'Patricia Alencar',   '5581979112244', 'patricia.alencar@email.com', 33980, 'Aguardando confirmação de frete.')
  ) as t(
    id,
    channel,
    status,
    customer_name,
    customer_phone,
    customer_email,
    total_cents,
    notes
  )
),
orders_upsert as (
  insert into public.orders (
    id,
    customer_id,
    channel,
    status,
    customer_name,
    customer_phone,
    customer_email,
    notes,
    subtotal_cents,
    total_cents,
    approved_at,
    cancelled_at,
    created_at,
    updated_at
  )
  select
    o.id,
    null,
    o.channel::text,
    o.status::text,
    o.customer_name,
    o.customer_phone,
    o.customer_email,
    o.notes,
    o.total_cents,
    o.total_cents,
    case when o.status in ('approved', 'paid', 'delivered') then now() - interval '1 day' else null end,
    case when o.status = 'cancelled' then now() - interval '12 hours' else null end,
    now() - (row_number() over (order by o.id)) * interval '4 hours',
    now()
  from orders_seed o
  on conflict (id) do update
  set
    channel = excluded.channel,
    status = excluded.status,
    customer_name = excluded.customer_name,
    customer_phone = excluded.customer_phone,
    customer_email = excluded.customer_email,
    notes = excluded.notes,
    subtotal_cents = excluded.subtotal_cents,
    total_cents = excluded.total_cents,
    approved_at = excluded.approved_at,
    cancelled_at = excluded.cancelled_at,
    updated_at = now()
  returning id
)
insert into public.order_items (
  id,
  order_id,
  variant_id,
  quantity,
  unit_price_cents,
  subtotal_cents,
  created_at
)
select
  item_id,
  order_id,
  vr.variant_id,
  quantity,
  unit_price_cents,
  quantity * unit_price_cents,
  now()
from (
  values
    -- Pedido 1 (pending)
    ('b23ee222-5e25-5a55-9f11-19f60f1b1001'::uuid, 'a13de111-4d14-4f44-8e0f-08f59e0a0001'::uuid, 'vestido-oncinha',   'animal-print', 'm', 1, 18990),
    ('b23ee222-5e25-5a55-9f11-19f60f1b1002'::uuid, 'a13de111-4d14-4f44-8e0f-08f59e0a0001'::uuid, 'cropped-babado',    'rosa-claro',  'p', 1,  9990),
    -- Pedido 2 (approved)
    ('b23ee222-5e25-5a55-9f11-19f60f1b1003'::uuid, 'b24ef222-4d14-4f44-8e0f-08f59e0a0002'::uuid, 'calca-cargo-creme', 'creme',       '38', 1, 15990),
    ('b23ee222-5e25-5a55-9f11-19f60f1b1004'::uuid, 'b24ef222-4d14-4f44-8e0f-08f59e0a0002'::uuid, 'saia-flor-dourada', 'preto',       'm', 1, 14990),
    -- Pedido 3 (paid)
    ('b23ee222-5e25-5a55-9f11-19f60f1b1005'::uuid, 'c35fa333-4d14-4f44-8e0f-08f59e0a0003'::uuid, 'conjunto-bege',     'bege',        'g', 1, 21990),
    -- Pedido 4 (delivered)
    ('b23ee222-5e25-5a55-9f11-19f60f1b1006'::uuid, 'd46ab444-4d14-4f44-8e0f-08f59e0a0004'::uuid, 'vestido-oncinha',   'animal-print', 'p', 2, 18990),
    -- Pedido 5 (cancelled)
    ('b23ee222-5e25-5a55-9f11-19f60f1b1007'::uuid, 'e57bc555-4d14-4f44-8e0f-08f59e0a0005'::uuid, 'cropped-babado',    'rosa-claro',  'g', 1,  9990),
    -- Pedido 6 (pending)
    ('b23ee222-5e25-5a55-9f11-19f60f1b1008'::uuid, 'f68cd666-4d14-4f44-8e0f-08f59e0a0006'::uuid, 'calca-cargo-creme', 'creme',       '40', 1, 15990),
    ('b23ee222-5e25-5a55-9f11-19f60f1b1009'::uuid, 'f68cd666-4d14-4f44-8e0f-08f59e0a0006'::uuid, 'cropped-babado',    'rosa-claro',  'm', 2,  9990),
    -- Pedido 7 (approved)
    ('b23ee222-5e25-5a55-9f11-19f60f1b1010'::uuid, 'a79de777-4d14-4f44-8e0f-08f59e0a0007'::uuid, 'saia-flor-dourada', 'preto',       'p', 1, 14990),
    ('b23ee222-5e25-5a55-9f11-19f60f1b1011'::uuid, 'a79de777-4d14-4f44-8e0f-08f59e0a0007'::uuid, 'conjunto-bege',     'bege',        'p', 1, 21990),
    -- Pedido 8 (paid)
    ('b23ee222-5e25-5a55-9f11-19f60f1b1012'::uuid, 'b80ef888-4d14-4f44-8e0f-08f59e0a0008'::uuid, 'calca-cargo-creme', 'creme',       '42', 1, 15990),
    -- Pedido 9 (delivered)
    ('b23ee222-5e25-5a55-9f11-19f60f1b1013'::uuid, 'c91fa999-4d14-4f44-8e0f-08f59e0a0009'::uuid, 'cropped-babado',    'rosa-claro',  'p', 3,  9990),
    -- Pedido 10 (pending)
    ('b23ee222-5e25-5a55-9f11-19f60f1b1014'::uuid, 'd02abaaa-4d14-4f44-8e0f-08f59e0a0010'::uuid, 'vestido-oncinha',   'animal-print', 'g', 1, 18990),
    ('b23ee222-5e25-5a55-9f11-19f60f1b1015'::uuid, 'd02abaaa-4d14-4f44-8e0f-08f59e0a0010'::uuid, 'saia-flor-dourada', 'preto',       'g', 1, 14990)
) as oi(
  item_id,
  order_id,
  product_slug,
  color_slug,
  size_slug,
  quantity,
  unit_price_cents
)
join variant_ref vr
  on vr.product_slug = oi.product_slug
 and vr.color_slug = oi.color_slug
 and vr.size_slug = oi.size_slug
on conflict (id) do update
set
  order_id = excluded.order_id,
  variant_id = excluded.variant_id,
  quantity = excluded.quantity,
  unit_price_cents = excluded.unit_price_cents,
  subtotal_cents = excluded.subtotal_cents;

commit;
