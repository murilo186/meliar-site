# Cybersecurity hardening branch

Data: 2026-05-14
Branch: `cyberseguranca-hardening`

## Escopo aplicado

Esta branch aplica os protocolos de seguranca definidos nos documentos de finalizacao e security checkup, mantendo o foco em pre-producao:

1. Headers HTTP e CSP mais restritivos.
2. Rate limit nas APIs publicas criticas ja existentes.
3. Validacao Zod nas APIs de checkout e busca.
4. Origin check nas APIs mutaveis.
5. Protecao explicita de rotas autenticadas e admin via middleware.
6. Upload admin de imagens com validacao de tipo, limite de tamanho, limite de pixels e conversao server-side para WebP.
7. Padronizacao de Storage para imagens de produto em `products/<slug>/<cor>/*.webp`.
8. Higienizacao de assets publicos, com imagens migradas para Supabase Storage.

## Ajustes feitos nesta branch

1. `next.config.ts`
   - CSP ganhou `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, `frame-src 'none'`.
   - `unsafe-eval` ficou restrito a desenvolvimento.
   - `upgrade-insecure-requests` fica ativo em producao.

2. `app/admin/produtos/actions.ts`
   - Upload aceita apenas `image/jpeg`, `image/png` e `image/webp`.
   - Cada arquivo fica limitado a 6 MB.
   - O processamento usa `sharp` com limite de 24 MP.
   - Saida e sempre WebP, redimensionada para no maximo 1600x2200 sem ampliar imagem pequena.

3. `app/admin/produtos/[id]/page.tsx`
   - Campo de upload foi limitado no cliente para JPG, PNG e WebP.

## Itens que ainda exigem validacao manual

1. Rotacionar qualquer segredo que tenha sido exposto fora do fluxo atual.
2. Validar policies reais do Supabase remoto contra `supabase/schema.sql` e `supabase/storage-policies.sql`.
3. Rodar advisors/security checks no painel Supabase antes do deploy de producao.
4. Validar headers em ambiente Vercel com `curl -I`.

## Referencias locais

1. `docs/references/finalizacao-do-projeto-seguranca.md`
2. `docs/references/security-roadmap-pre-aplicacao.md`
3. `docs/references/SECURITY_REPORT.md`
