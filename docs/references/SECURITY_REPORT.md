# SECURITY_REPORT.md

Data: 2026-05-11
Branch: finalizacao-etapa-limpeza-inicial

## Resumo executivo

Correções aplicadas nesta etapa:

- Crítico: 1 item mitigado.
- Alto: 3 itens mitigados.
- Médio: 4 itens mitigados.
- Baixo: 3 itens mitigados.

O foco aplicado foi a sequência segura definida nos documentos de finalização: limpeza estrutural curta, remoção de sensível, hardening P0, validação P1 e relatório final.

## Correções aplicadas

### Crítico

1. Arquivo sensível local removido
- Arquivo: `password.md`
- Problema: arquivo com valor sensível em texto puro estava presente no workspace e poderia ser commitado acidentalmente.
- Correção: arquivo removido sem leitura do conteúdo. `password.md` já está listado no `.gitignore`.
- Ação manual necessária: rotacionar/revogar a credencial que estava nesse arquivo, porque remoção local não invalida segredo já exposto.

### Alto

1. Rate limit em APIs públicas críticas
- Arquivos: `app/api/catalog/search/route.ts`, `app/api/checkout/validate/route.ts`, `app/api/checkout/whatsapp/route.ts`, `lib/rate-limit.ts`
- Problema: endpoints públicos consultavam/validavam dados sem limite por IP.
- Correção: rate limit in-memory por IP/rota.
- Limites: busca 30/min, validação checkout 10/min, checkout WhatsApp 5/min.
- Observação: proteção é adequada como P0 inicial, mas não é limite global confiável em serverless distribuído. Para produção com tráfego maior, usar Redis/Upstash ou provider equivalente.

2. Proteção explícita de rotas autenticadas
- Arquivos: `middleware.ts`, `lib/supabase/middleware.ts`
- Problema: middleware apenas renovava sessão, sem política explícita por escopo.
- Correção: `updateSession()` agora retorna `{ response, user }`; `/admin/*` e `/perfil/*` redirecionam para `/login` sem usuário.
- Observação: autorização de perfil admin permanece reforçada em `app/admin/layout.tsx` e nas Server Actions via `requireAdmin()`.

3. Server Actions admin protegidas
- Arquivos: `app/admin/produtos/actions.ts`, `app/admin/estoque/actions.ts`, `app/admin/vendas/actions.ts`
- Problema: arquivo único grande dificultava auditoria e aplicação consistente de `requireAdmin()`.
- Correção: ações separadas por domínio; ações exportadas passam por `await requireAdmin()` antes de executar lógica sensível.

### Médio

1. Headers HTTP de segurança
- Arquivo: `next.config.ts`
- Problema: ausência de headers de hardening.
- Correção: adicionados `X-DNS-Prefetch-Control`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` e `Content-Security-Policy`.

2. Validação Zod nas APIs públicas
- Arquivos: `app/api/catalog/search/route.ts`, `app/api/checkout/validate/route.ts`, `app/api/checkout/whatsapp/route.ts`, `package.json`, `pnpm-lock.yaml`
- Problema: payloads e query params aceitavam entrada bruta.
- Correção: adicionados schemas Zod para busca e itens de carrinho.

3. Checagem de origem em APIs mutáveis
- Arquivos: `app/api/checkout/validate/route.ts`, `app/api/checkout/whatsapp/route.ts`, `lib/http/request-origin.ts`
- Problema: rotas POST não validavam `Origin`/`Host`.
- Correção: requests com origem diferente do host são recusados com 403.

4. Remoção de fallbacks mockados em regras de catálogo
- Arquivos: `lib/catalog/get-products-db.ts`, `components/*`, `lib/orders/*`, `lib/admin/sales-orders.ts`
- Problema: produto sem imagem/tamanho recebia fallback de mock ou tamanho hardcoded, mascarando dados incompletos.
- Correção: catálogo retorna imagens/tamanhos reais; UI mostra placeholder visual controlado quando imagem não existe.

### Baixo

1. Remoção do catálogo local legado
- Arquivos removidos: `data/products.ts`, `data/categories.ts`, `lib/catalog/get-products.ts`, `scripts/import-catalog-from-data.mjs`
- Correção: tipos/helpers migrados para `lib/catalog/types.ts`, `lib/catalog/product-ui-helpers.ts` e `lib/catalog/category-data.ts`.

2. Remoção de assets mock expostos
- Diretório removido: `public/mock/`
- Correção: imagens mock não ficam mais publicamente acessíveis.

3. Extração de lógica de auth do header/cards de produto
- Arquivo novo: `lib/hooks/use-auth-state.ts`
- Correção: `Header`, `ProductCard` e `ProductDetailView` consomem hook compartilhado para estado de autenticação/admin.

## Auditoria Supabase e RLS

Resultado local:

- `SUPABASE_SERVICE_ROLE_KEY` aparece somente em `lib/supabase/env.ts` e é consumida via `createSupabaseServiceClient()` em código server-side (`lib/` e rotas/actions server).
- Não foi encontrado `createSupabaseServiceClient()` em componentes client-side.
- `supabase/schema.sql` habilita RLS nas tabelas principais: `profiles`, `user_favorites`, `categories`, `products`, `colors`, `sizes`, `product_variants`, `product_images`, `inventory_movements`, `orders`, `order_items`.
- `supabase/schema.sql` contém policies para leitura pública de catálogo, acesso próprio de cliente e acesso admin.

Ação manual recomendada:

- Validar no painel Supabase se as migrations locais refletem o banco remoto atual.
- Rodar advisors/security checks do Supabase antes de produção.
- Verificar a view `public.new_arrivals_products`; se o projeto usa Postgres 15+, considerar `security_invoker = true` se ela for acessível por roles públicas.

## Itens não aplicados propositalmente

- Não foram alteradas regras de RLS no banco remoto nesta etapa.
- Não foi trocado o rate limit in-memory por Redis/Upstash para evitar dependência externa além de `zod`.
- Componentes de autenticação e perfil ainda usam o client público do Supabase no browser, o que é esperado para fluxos de Auth com anon key. A auditoria crítica era garantir ausência de service role no client-side.

## Verificação executada

- `pnpm lint`: passou.
- `pnpm exec tsc --noEmit`: passou após o build gerar `.next/types`.
- `pnpm build`: passou.

## Próximas ações manuais

1. Rotacionar qualquer segredo que estava em `password.md`.
2. Validar headers em ambiente dev/prod via Network ou `curl -I`.
3. Testar manualmente: login/logout, catálogo, PDP, carrinho, checkout WhatsApp, admin produtos/estoque/vendas.
4. Rodar auditoria Supabase no projeto remoto e comparar com `supabase/schema.sql`.
