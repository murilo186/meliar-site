create extension if not exists pgcrypto;

-- =========================================================
-- ORDEM DE EXECUÇÃO (SQL Editor - Supabase)
-- =========================================================
-- 1) Executar ESTE arquivo inteiro em ambiente de dev/staging primeiro.
-- 2) Validar que as tabelas foram criadas:
--    - profiles, categories, products, colors, sizes,
--      product_variants, product_images, inventory_movements, orders, order_items.
-- 3) Criar/promover pelo menos 1 usuário admin:
--    update public.profiles p
--    set role = 'admin', updated_at = now()
--    from auth.users u
--    where u.id = p.id and u.email = 'seu-email@dominio.com';
-- 4) Testar políticas RLS com usuário comum:
--    - consegue ler catálogo público
--    - NÃO consegue inserir/editar catálogo
-- 5) Testar políticas RLS com usuário admin:
--    - consegue CRUD de catálogo e operações administrativas
-- 6) Executar setup de Storage (bucket + policies) em script separado
--    para upload/list/read de imagens por admin.
-- 7) Só depois disso migrar telas para leitura/escrita no banco.
--
-- PRODUÇÃO:
-- 8) Repetir em produção em janela controlada.
-- 9) Rodar sanity check pós-deploy:
--    - login comum
--    - login admin
--    - /admin protegido
--    - home/PLP/PDP carregando sem regressão.

-- =========================================================
-- Helpers
-- =========================================================
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- Profiles / Auth
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  phone text,
  role text not null default 'customer' check (role in ('admin', 'operational', 'customer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, role)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'first_name', ''),
    nullif(new.raw_user_meta_data->>'last_name', ''),
    nullif(new.raw_user_meta_data->>'phone', ''),
    'customer'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =========================================================
-- Catalog
-- =========================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at
before update on public.categories
for each row
execute function public.set_updated_at();

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  name text not null,
  slug text not null unique,
  description text,
  composition text,
  price_cents integer not null check (price_cents > 0),
  is_visible boolean not null default true,
  is_hot boolean not null default false,
  show_in_new_arrivals_manual boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at
before update on public.products
for each row
execute function public.set_updated_at();

create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  product_slug text not null references public.products(slug) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_slug)
);

create table if not exists public.colors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  hex_code text check (hex_code is null or hex_code ~* '^#[0-9A-F]{6}$'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_colors_updated_at on public.colors;
create trigger trg_colors_updated_at
before update on public.colors
for each row
execute function public.set_updated_at();

create table if not exists public.sizes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_sizes_updated_at on public.sizes;
create trigger trg_sizes_updated_at
before update on public.sizes
for each row
execute function public.set_updated_at();

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color_id uuid not null references public.colors(id) on delete restrict,
  size_id uuid not null references public.sizes(id) on delete restrict,
  sku text not null unique,
  price_cents integer check (price_cents is null or price_cents > 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, color_id, size_id)
);

drop trigger if exists trg_product_variants_updated_at on public.product_variants;
create trigger trg_product_variants_updated_at
before update on public.product_variants
for each row
execute function public.set_updated_at();

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  color_id uuid references public.colors(id) on delete set null,
  image_url text not null,
  storage_path text not null unique,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create or replace function public.ensure_max_three_images_per_product_color()
returns trigger
language plpgsql
as $$
declare
  image_count integer;
begin
  select count(*) into image_count
  from public.product_images
  where product_id = new.product_id
    and coalesce(color_id, '00000000-0000-0000-0000-000000000000'::uuid)
      = coalesce(new.color_id, '00000000-0000-0000-0000-000000000000'::uuid);

  if image_count >= 3 then
    raise exception 'Cada produto pode ter no máximo 3 imagens por cor';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_product_images_max_three_by_color on public.product_images;
create trigger trg_product_images_max_three_by_color
before insert on public.product_images
for each row
execute function public.ensure_max_three_images_per_product_color();

-- =========================================================
-- Inventory / Orders
-- =========================================================
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  movement_type text not null check (
    movement_type in ('in', 'out', 'adjustment', 'reserved', 'released', 'sale', 'return', 'manual')
  ),
  quantity_delta integer not null check (quantity_delta <> 0),
  reason text,
  order_id uuid,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create or replace function public.apply_inventory_movement()
returns trigger
language plpgsql
as $$
declare
  current_stock integer;
begin
  select stock_quantity
  into current_stock
  from public.product_variants
  where id = new.variant_id
  for update;

  if current_stock is null then
    raise exception 'Variante não encontrada';
  end if;

  if current_stock + new.quantity_delta < 0 then
    raise exception 'Estoque insuficiente para este movimento';
  end if;

  update public.product_variants
  set stock_quantity = stock_quantity + new.quantity_delta,
      updated_at = now()
  where id = new.variant_id;

  return new;
end;
$$;

drop trigger if exists trg_apply_inventory_movement on public.inventory_movements;
create trigger trg_apply_inventory_movement
before insert on public.inventory_movements
for each row
execute function public.apply_inventory_movement();

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) on delete set null,
  channel text not null default 'whatsapp' check (channel in ('whatsapp', 'manual')),
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'paid', 'cancelled', 'delivered')
  ),
  customer_name text,
  customer_phone text,
  customer_email text,
  notes text,
  subtotal_cents integer not null default 0 check (subtotal_cents >= 0),
  total_cents integer not null default 0 check (total_cents >= 0),
  approved_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid not null references public.product_variants(id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_cents integer not null check (unit_price_cents > 0),
  subtotal_cents integer not null check (subtotal_cents > 0),
  created_at timestamptz not null default now()
);

-- Link inventory movement -> order with FK only after orders exists
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'inventory_movements_order_id_fkey'
  ) then
    alter table public.inventory_movements
      add constraint inventory_movements_order_id_fkey
      foreign key (order_id) references public.orders(id) on delete set null;
  end if;
end $$;

create or replace function public.ensure_order_item_subtotal()
returns trigger
language plpgsql
as $$
begin
  if new.subtotal_cents <> new.quantity * new.unit_price_cents then
    raise exception 'subtotal_cents deve ser quantity * unit_price_cents';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_order_item_subtotal on public.order_items;
create trigger trg_order_item_subtotal
before insert or update on public.order_items
for each row
execute function public.ensure_order_item_subtotal();

-- =========================================================
-- Indexes
-- =========================================================
create index if not exists idx_categories_parent on public.categories(parent_id);
create index if not exists idx_categories_active_sort on public.categories(is_active, sort_order, name);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_visible_created on public.products(is_visible, created_at desc);
create index if not exists idx_products_new_arrivals on public.products(created_at desc);
create index if not exists idx_user_favorites_user_created on public.user_favorites(user_id, created_at desc);
create index if not exists idx_product_variants_product on public.product_variants(product_id);
create index if not exists idx_product_variants_color on public.product_variants(color_id);
create index if not exists idx_product_variants_size on public.product_variants(size_id);
create index if not exists idx_product_variants_stock on public.product_variants(stock_quantity, is_available);
create index if not exists idx_product_images_product on public.product_images(product_id);
create index if not exists idx_product_images_product_color on public.product_images(product_id, color_id, sort_order);
create index if not exists idx_inventory_movements_variant_created on public.inventory_movements(variant_id, created_at desc);
create index if not exists idx_orders_status_created on public.orders(status, created_at desc);
create index if not exists idx_orders_customer on public.orders(customer_id, created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- =========================================================
-- Views
-- =========================================================
create or replace view public.new_arrivals_products as
select p.*
from public.products p
where p.is_visible = true
  and (
    p.is_hot = true
    or p.show_in_new_arrivals_manual = true
    or p.created_at >= now() - interval '14 days'
  )
order by p.created_at desc;

-- =========================================================
-- RLS
-- =========================================================
alter table public.profiles enable row level security;
alter table public.user_favorites enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.colors enable row level security;
alter table public.sizes enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_images enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Profiles
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.is_admin());

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check (auth.uid() = id or public.is_admin());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles
for update
to authenticated
using (auth.uid() = id or public.is_admin())
with check (
  case
    when public.is_admin() then true
    else auth.uid() = id and role = 'customer'
  end
);

-- Favorites
drop policy if exists user_favorites_select_own on public.user_favorites;
create policy user_favorites_select_own
on public.user_favorites
for select
to authenticated
using (auth.uid() = user_id or public.is_admin());

drop policy if exists user_favorites_insert_own on public.user_favorites;
create policy user_favorites_insert_own
on public.user_favorites
for insert
to authenticated
with check (auth.uid() = user_id or public.is_admin());

drop policy if exists user_favorites_delete_own on public.user_favorites;
create policy user_favorites_delete_own
on public.user_favorites
for delete
to authenticated
using (auth.uid() = user_id or public.is_admin());

-- Public catalog read
drop policy if exists categories_public_read on public.categories;
create policy categories_public_read
on public.categories
for select
to anon, authenticated
using (is_active = true);

drop policy if exists products_public_read on public.products;
create policy products_public_read
on public.products
for select
to anon, authenticated
using (is_visible = true);

drop policy if exists colors_public_read on public.colors;
create policy colors_public_read
on public.colors
for select
to anon, authenticated
using (is_active = true);

drop policy if exists sizes_public_read on public.sizes;
create policy sizes_public_read
on public.sizes
for select
to anon, authenticated
using (is_active = true);

drop policy if exists variants_public_read on public.product_variants;
create policy variants_public_read
on public.product_variants
for select
to anon, authenticated
using (is_available = true);

drop policy if exists product_images_public_read on public.product_images;
create policy product_images_public_read
on public.product_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.products p
    where p.id = product_images.product_id
      and p.is_visible = true
  )
);

-- Admin full access on catalog + ops
drop policy if exists categories_admin_all on public.categories;
create policy categories_admin_all
on public.categories
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists products_admin_all on public.products;
create policy products_admin_all
on public.products
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists colors_admin_all on public.colors;
create policy colors_admin_all
on public.colors
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists sizes_admin_all on public.sizes;
create policy sizes_admin_all
on public.sizes
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists variants_admin_all on public.product_variants;
create policy variants_admin_all
on public.product_variants
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists product_images_admin_all on public.product_images;
create policy product_images_admin_all
on public.product_images
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists inventory_movements_admin_all on public.inventory_movements;
create policy inventory_movements_admin_all
on public.inventory_movements
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists orders_admin_all on public.orders;
create policy orders_admin_all
on public.orders
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists order_items_admin_all on public.order_items;
create policy order_items_admin_all
on public.order_items
for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- Customer order visibility (future checkout flow)
drop policy if exists orders_customer_read_own on public.orders;
create policy orders_customer_read_own
on public.orders
for select
to authenticated
using (customer_id = auth.uid() or public.is_admin());

drop policy if exists order_items_customer_read_own on public.order_items;
create policy order_items_customer_read_own
on public.order_items
for select
to authenticated
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_items.order_id
      and (o.customer_id = auth.uid() or public.is_admin())
  )
);
