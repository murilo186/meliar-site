# Roadmap de Segurança (Pré-Aplicação)

## Contexto
Antes de aplicar o pacote completo de hardening de segurança, existe risco de retrabalho por causa de:
1. Código com sinais de overengineering em alguns fluxos.
2. Lógica duplicada em pontos de admin e catálogo.
3. Resquícios/fallbacks mockados e regras antigas espalhadas.

## Decisão
Aplicar **primeiro uma limpeza técnica curta e focada** (stabilization pass), depois executar o hardening.

A ordem recomendada é:
1. Limpeza de arquitetura e fluxos críticos.
2. Auditoria de segurança + correções P0/P1.
3. Validação final e relatório.

---

## Fase 0 — Limpeza mínima antes da segurança

### Objetivo
Reduzir ruído e inconsistência para que as correções de segurança sejam aplicadas uma vez, sem retrabalho.

### Escopo (sem overengineering)
1. Remover/neutralizar fallbacks mockados não usados em produção.
2. Consolidar funções duplicadas de catálogo/estoque/status em um único caminho por domínio.
3. Padronizar validação de entrada nos pontos principais (sem refatoração gigante ainda).
4. Revisar fluxos admin mais sensíveis (produto, estoque, vendas) para reduzir ambiguidade de ação.

### Critério de pronto da Fase 0
1. Um caminho principal por fluxo crítico (sem duplicidade concorrente).
2. Sem dependência de mock para comportamento de produção.
3. Código mais previsível para inserir rate limit, headers e CSRF.

---

## Fase 1 — Segurança P0 (imediata)
1. Rate limit em APIs públicas e sensíveis (checkout, busca, auth).
2. Security headers no `next.config.ts` (CSP, X-Frame-Options, etc.).
3. Hardening em endpoints de escrita (checagem de origem/CSRF para APIs mutáveis).

## Fase 2 — Segurança P1
1. Validação server-side padronizada com Zod em APIs e Server Actions críticas.
2. Revisão de sessão/autorização por rota (auth/admin).
3. Revisão de uso de service role (somente server-side, já com política clara).

## Fase 3 — Segurança P2
1. Revisão RLS por tabela/política no Supabase.
2. Higienização de `public/` para remover artefatos desnecessários.
3. Relatório final: `SECURITY_REPORT.md` com severidade e ações.

---

## Observação importante
A limpeza prévia é para **simplificar** e **reduzir risco**, não para reescrever o sistema.
Se a limpeza crescer além de 1 sprint curto, interromper e seguir para P0 de segurança.
