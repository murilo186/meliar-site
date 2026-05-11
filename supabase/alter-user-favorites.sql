create table if not exists public.user_favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  product_slug text not null references public.products(slug) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_slug)
);

create index if not exists idx_user_favorites_user_created
on public.user_favorites(user_id, created_at desc);

alter table public.user_favorites enable row level security;

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
