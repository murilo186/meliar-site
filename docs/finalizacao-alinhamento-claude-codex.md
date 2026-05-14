# Finalização — Alinhamento Claude x Codex (sem quebrar o projeto)

Data: 2026-05-11
Objetivo: consolidar os planos `FASE0`, `FASE1` e a análise atual para executar com segurança antes de produção.

## 1) Pontos que Claude e Codex concordam (AMBOS)
1. Aplicar **limpeza estrutural curta** antes do hardening completo.
2. Prioridade P0 de segurança:
   - headers de segurança em `next.config.ts`;
   - rate limit nas APIs públicas críticas.
3. Padronizar validação server-side (Zod) nos principais pontos de entrada.
4. Revisar proteção de rotas/auth no middleware.
5. Revisar documentação fragmentada e consolidar plano oficial.
6. Remover/mitigar legado e inconsistências para reduzir retrabalho.

## 2) Pontos que Claude enfatizou (CLAUDE)
1. Remover sistema de catálogo local (`data/` + `lib/catalog/get-products.ts`) após migração total para DB.
2. Quebrar `app/admin/actions.ts` por domínio (produtos/estoque/vendas).
3. Extrair lógica do `header.tsx` para hooks.
4. Remover fallbacks hardcoded no catálogo (`/mock/product-shirt.svg`, tamanhos fallback).
5. Rate limit in-memory por IP nas 3 APIs públicas.

## 3) Pontos que Codex enfatizou (CODEX)
1. Risco documental/escopo: existem planos contraditórios (escopo inicial vs estado real com admin/supabase).
2. Inconsistência de marca (`Melier` vs `Meliar`) e necessidade de política de naming.
3. Ponto crítico de segurança operacional: `password.md` com dado sensível em texto puro.
4. Higienização de `public/` e ativos expostos desnecessários antes de produção.
5. Aplicar fases com limite de esforço para evitar overengineering.

## 4) Pontos com risco de quebra se aplicados "bruto"
1. **Deletar `lib/catalog/get-products.ts` imediatamente quebra utilitários ainda usados**.
   - Hoje o arquivo não serve só para dados locais; ele também expõe:
     - `ProductSort`, `parseProductSort`, `getDefaultVariant`, `getVariantBySlug`, `getProductPrimaryImage`.
   - Esses símbolos ainda são importados por várias páginas/componentes.
2. Deletar `data/` sem migrar totalmente os imports quebra build.
3. Split grande de `header.tsx` antes do hardening pode aumentar risco de regressão funcional sem ganho imediato de segurança.
4. Rate limit in-memory funciona como proteção inicial, mas em serverless distribuído não é limite global confiável.

## 5) Decisão de execução segura (recomendada)

### Fase A — Estabilização mínima (curta)
1. Criar `lib/catalog/types.ts` com `ProductSort` e `parseProductSort`.
2. Criar `lib/catalog/product-ui-helpers.ts` com helpers de variante/imagem (`getDefaultVariant`, etc.).
3. Migrar imports para esses novos módulos.
4. Só então remover dependência de `data/products.ts` no runtime principal.
5. Tratar `password.md` imediatamente (remover do repo + rotacionar segredo).

### Fase B — Segurança P0
1. Headers de segurança em `next.config.ts`.
2. Rate limit nas APIs:
   - `/api/catalog/search`
   - `/api/checkout/validate`
   - `/api/checkout/whatsapp`
3. Teste de regressão rápido (build + fluxos críticos de checkout/admin).

### Fase C — Segurança P1
1. Zod nas APIs e actions críticas.
2. Origin/host check para APIs mutáveis.
3. Ajuste de middleware por escopo de rota (pública/auth/admin).

### Fase D — Fechamento
1. Auditoria RLS por tabela/política.
2. Higiene de `public/`.
3. `SECURITY_REPORT.md` final.

## 6) Critério para "não quebrar"
1. Cada fase com PR/commit pequeno e testável.
2. `pnpm build` obrigatório a cada fase.
3. Smoke test manual mínimo:
   - login/logout;
   - navegação catálogo/PDP/carrinho;
   - checkout WhatsApp;
   - admin produto/estoque/vendas.
4. Evitar refatoração visual grande junto com hardening de segurança.

## 7) Ordem final aprovada para seguir
1. Estabilização mínima de código e naming.
2. Segurança P0.
3. Segurança P1.
4. Auditoria final + relatório.
