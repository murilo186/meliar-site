# Finalização do Projeto — Segurança e Pré-Produção (Meliar)

Data: 2026-05-11
Status: análise realizada, sem aplicação nesta etapa

## 1) Resumo executivo
O projeto está funcional em loja + admin, mas ainda há pontos de consistência e segurança que devem ser fechados antes de produção.

Principais riscos atuais:
1. Falta de headers de segurança HTTP no `next.config.ts`.
2. Ausência de rate limit em endpoints públicos críticos (`checkout` e `search`).
3. Documentação de plano fragmentada e parcialmente desatualizada.
4. Inconsistência de naming/identidade em arquivos legados (`Melier` vs `Meliar`).
5. Arquivo sensível indevido no repositório (`password.md` com valor em texto puro).

---

## 2) Diagnóstico do código (o que precisamos antes de produção)

### 2.1 Limpeza e consistência (sem overengineering)
1. Consolidar o plano oficial em `docs/` e marcar os antigos como legados.
2. Definir nomenclatura oficial da marca no código e docs: `Meliar`.
3. Remover/arquivar artefatos antigos de fase protótipo:
   - `project.MD`
   - `references.MD`
   - `skills.MD`
4. Revisar fallbacks de mock para garantir que só sejam usados como fallback visual controlado (não regra de negócio).

### 2.2 Inconsistências de documentação encontradas
1. `AGENTS.md`, `CODEX_PROMPT.md` e `ROADMAP.md` descrevem escopo inicial sem admin/supabase, mas o projeto já evoluiu para auth + admin + pedidos.
2. Há múltiplos planos paralelos com sobreposição:
   - `docs/proximos-passos-funcionais.md`
   - `docs/admin-backoffice-planning.md`
   - `docs/featured-products-swiper-task.md`
   - `docs/whatsapp-orders-flow.md`
   - `docs/admin-usabilidade-mobile.md`
   - `docs/security-roadmap-pre-aplicacao.md`
3. `SECURITY_CHECKUP_PROMPT.md` existe e está **não versionado** (risco de perder contexto se não for commitado).

### 2.3 Inconsistência de naming (marca)
1. UI e textos de loja usam majoritariamente `Meliar`.
2. Arquivos legados e metadados ainda usam `Melier` (ex.: `project.MD`, `skills.MD`, `references.MD`, `package.json` name/tokens `melier-*`).
3. Recomendação prática:
   - Marca exibida ao cliente: manter `Meliar`.
   - Tokens técnicos CSS/nomes internos: manter como está por ora para evitar quebra grande, e planejar renomeação gradual futura.

---

## 3) Pontos de segurança para finalização (priorizados)

## P0 — Bloqueadores de produção
1. **Headers de segurança ausentes**
   - Arquivo: `next.config.ts`
   - Ação: adicionar `CSP`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `X-DNS-Prefetch-Control`.

2. **Rate limit ausente em APIs públicas**
   - Arquivos:
     - `app/api/checkout/whatsapp/route.ts`
     - `app/api/checkout/validate/route.ts`
     - `app/api/catalog/search/route.ts`
   - Ação: implementar rate limit por IP/rota com resposta `429`.

3. **Arquivo sensível commitável no repo**
   - Arquivo: `password.md`
   - Ação: remover do versionamento, invalidar/rotacionar credencial associada e bloquear padrão no `.gitignore`.

## P1 — Alto impacto de robustez
1. **Validação server-side padronizada**
   - Hoje há validação manual em vários pontos.
   - Ação: padronizar payloads com Zod nas APIs e Server Actions críticas.

2. **Hardening de APIs mutáveis (CSRF/origin check)**
   - Ação: validar `Origin`/`Host` em rotas POST sensíveis de API.

3. **Política de proteção de rotas no middleware**
   - Arquivo: `middleware.ts`
   - Hoje: apenas `updateSession`.
   - Ação: garantir estratégia clara por escopo de rota (pública, auth, admin).

## P2 — Fechamento de segurança
1. **Auditoria de RLS por tabela/política**
   - Verificar `SELECT/INSERT/UPDATE/DELETE` nas tabelas sensíveis.

2. **Higiene de arquivos públicos**
   - Revisar itens em `public/` que não devem estar expostos (ex.: artefatos internos não utilizados).

3. **Relatório final de segurança**
   - Gerar `SECURITY_REPORT.md` com severidade, evidências e correções.

---

## 4) Evidências de análise (arquivos-chave)
1. `next.config.ts` sem headers de segurança customizados.
2. `middleware.ts` focado só em sessão (sem política de proteção por rota).
3. APIs públicas sem rate limit explícito:
   - `app/api/checkout/whatsapp/route.ts`
   - `app/api/checkout/validate/route.ts`
   - `app/api/catalog/search/route.ts`
4. `lib/supabase/env.ts` usa `service role` no server-side (correto), mas exige revisão completa de uso por endpoint.
5. `password.md` presente com valor sensível em texto puro.

---

## 5) Sequência recomendada de execução
1. **Fase A (rápida, 1 ciclo curto):** limpeza documental + remoção de sensíveis + alinhamento naming oficial.
2. **Fase B (P0 segurança):** headers + rate limit + bloqueios básicos.
3. **Fase C (P1):** Zod + CSRF/origin checks + revisão middleware.
4. **Fase D (P2):** auditoria RLS + `SECURITY_REPORT.md` final.

---

## 6) Critério de pronto para produção (segurança)
1. Sem credenciais/senhas em arquivos versionados.
2. Endpoints públicos críticos com rate limit ativo.
3. Security headers ativos e validados.
4. Entradas críticas validadas server-side com schema.
5. RLS auditada e documentada no relatório final.
