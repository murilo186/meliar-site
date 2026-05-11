-- =========================================================
-- STORAGE SETUP (Supabase)
-- Bucket: product-images
-- =========================================================
-- ORDEM:
-- 1) Execute este script após o schema principal.
-- 2) Valide no painel Storage se o bucket "product-images" existe.
-- 3) Teste:
--    - leitura pública de imagens (site)
--    - upload/update/delete apenas com usuário admin logado

-- 1) Criar bucket (idempotente)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update
set public = excluded.public;

-- 2) Remover policies antigas com mesmo nome (idempotente)
drop policy if exists "product_images_public_read" on storage.objects;
drop policy if exists "product_images_admin_insert" on storage.objects;
drop policy if exists "product_images_admin_update" on storage.objects;
drop policy if exists "product_images_admin_delete" on storage.objects;

-- 3) Leitura pública das imagens do bucket
create policy "product_images_public_read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'product-images');

-- 4) Inserir apenas admin autenticado
create policy "product_images_admin_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and public.is_admin()
);

-- 5) Atualizar apenas admin autenticado
create policy "product_images_admin_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_admin()
)
with check (
  bucket_id = 'product-images'
  and public.is_admin()
);

-- 6) Deletar apenas admin autenticado
create policy "product_images_admin_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and public.is_admin()
);
