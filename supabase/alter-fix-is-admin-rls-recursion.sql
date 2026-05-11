-- =========================================================
-- Corrigir recursao de RLS em profiles/public.is_admin()
-- =========================================================
-- Sintoma: queries autenticadas falham com "stack depth limit exceeded"
-- ao avaliar policies que chamam public.is_admin().
--
-- Causa: public.is_admin() consultava public.profiles diretamente, e as
-- policies de public.profiles tambem chamam public.is_admin(), gerando loop.
--
-- Solucao: mover a consulta para uma funcao SECURITY DEFINER em schema
-- privado (bypass de RLS nessa checagem) e manter public.is_admin() como wrapper.

create schema if not exists private;
revoke all on schema private from public;

create or replace function private.is_admin(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
      and p.role = 'admin'
  );
$$;

revoke all on function private.is_admin(uuid) from public;
grant execute on function private.is_admin(uuid) to authenticated, service_role;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select private.is_admin(auth.uid());
$$;
