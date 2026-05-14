# 🔐 Security Checkup — meliar-site

## Stack identificado
- **Framework:** Next.js 14+ (App Router)
- **Backend/DB:** Supabase (PostgreSQL + Auth + RLS)
- **Linguagem:** TypeScript
- **Deploy:** Vercel
- **Middleware:** `middleware.ts` com `updateSession` do Supabase

---

## Instruções para o Codex

Você é um auditor de segurança sênior. Faça uma análise completa de segurança neste repositório Next.js + Supabase. Para cada item abaixo, **leia os arquivos relevantes**, **identifique vulnerabilidades**, e **implemente as correções** diretamente no código. Ao final, gere um relatório `SECURITY_REPORT.md` com tudo que foi encontrado e corrigido.

---

## 1. 🛡️ SQL Injection

**Arquivos a auditar:** `lib/`, `app/api/`, qualquer arquivo com queries ao Supabase.

- Verifique se há queries construídas com concatenação de string ou template literals com input do usuário (ex: `.from('tabela').select('*').eq('campo', ${userInput})`).
- Garanta que **todo input do usuário** passa pelos métodos parametrizados do Supabase client — nunca interpolado diretamente em `.rpc()` ou queries brutas.
- Procure por uso de `supabase.rpc()` com parâmetros não sanitizados.
- **Correção esperada:** Refatorar para sempre usar parâmetros nomeados ou o query builder do Supabase.

---

## 2. 🔒 Row Level Security (RLS) — Supabase

**Arquivos a auditar:** `supabase/`, migrations, `lib/supabase/`.

- Verifique se RLS está habilitado em **todas as tabelas** do Supabase (especialmente as que lidam com dados de usuários).
- Procure por chamadas usando `supabase` com a **service_role key** no lado do cliente (client-side) — isso bypassa RLS completamente.
- Confirme que a `SUPABASE_SERVICE_ROLE_KEY` é usada **somente em Server Actions, API Routes e scripts server-side**.
- Verifique se existe política de RLS para `SELECT`, `INSERT`, `UPDATE` e `DELETE` em todas as tabelas sensíveis.
- **Correção esperada:** Adicionar `supabase.auth.getUser()` nos Server Components para validar sessão antes de qualquer operação.

---

## 3. 🧨 XSS (Cross-Site Scripting)

**Arquivos a auditar:** `components/`, `app/`, qualquer uso de `dangerouslySetInnerHTML`.

- Procure por **todo uso de `dangerouslySetInnerHTML`** — se existir, verifique se o conteúdo vem de fonte confiável e está sendo sanitizado com DOMPurify ou similar.
- Verifique renderização de dados vindos do banco (ex: conteúdo de usuário exibido sem escape).
- Procure por uso de `innerHTML` em `useEffect` ou scripts de terceiros injetados dinamicamente.
- Verifique se há campos de formulário que exibem o próprio input do usuário de volta na tela.
- **Correção esperada:** Remover `dangerouslySetInnerHTML` ou adicionar sanitização. React escapa por padrão, mas verificar exceções.

---

## 4. 🚦 Rate Limiting

**Arquivos a auditar:** `app/api/`, `middleware.ts`, `next.config.ts`.

- Verifique se há **rate limiting** nas rotas de API (`app/api/**`), especialmente:
  - Rotas de autenticação (login, cadastro, reset de senha)
  - Rotas de envio de formulário (contato, newsletter)
  - Qualquer endpoint público que consulta o banco
- Se não houver rate limiting, **implementar** usando `@upstash/ratelimit` + Redis (Upstash) ou usando middleware com in-memory store para projetos menores.
- Exemplo de implementação esperada no `middleware.ts`:

```ts
// Exemplo de rate limit por IP para rotas de API
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 req por 10s
});
```

- **Correção esperada:** Adicionar rate limit nas rotas públicas e de auth. Retornar HTTP 429 com mensagem clara quando excedido.

---

## 5. 🔑 Autenticação e Sessão

**Arquivos a auditar:** `middleware.ts`, `lib/supabase/`, `app/api/auth/`.

- Verifique se o `middleware.ts` protege **todas as rotas autenticadas** — não apenas a home.
- Confirme que o `updateSession` do Supabase está renovando o token corretamente.
- Verifique se há rotas de API que assumem autenticação sem verificar: sempre deve existir `const { data: { user } } = await supabase.auth.getUser()` no início de toda Server Action e API Route protegida.
- Procure por uso de `getSession()` em vez de `getUser()` no server-side — `getSession()` não valida o token JWT no servidor, use sempre `getUser()`.
- **Correção esperada:** Substituir todo `getSession()` por `getUser()` no lado do servidor.

---

## 6. 📋 Validação de Input / Formulários

**Arquivos a auditar:** `components/`, `app/`, Server Actions.

- Verifique se **todos os inputs de formulário** são validados no servidor (não só no cliente com Zod ou similar).
- Procure por Server Actions que recebem `FormData` sem validação.
- Verifique se campos numéricos aceitam strings, campos de email aceitam qualquer string, etc.
- **Correção esperada:** Garantir validação server-side com Zod em todos os pontos de entrada de dados.

---

## 7. 🔐 Variáveis de Ambiente e Secrets

**Arquivos a auditar:** `.env.example`, `next.config.ts`, qualquer arquivo de configuração.

- Verifique se há **nenhuma chave real** commitada (API keys, senhas, tokens).
- Confirme que variáveis com prefixo `NEXT_PUBLIC_` não expõem secrets (chaves de serviço, service_role, etc.).
- A `SUPABASE_SERVICE_ROLE_KEY` **nunca deve ter** prefixo `NEXT_PUBLIC_`.
- Procure por `.env` ou `.env.local` no histórico de commits com `git log --all -- .env`.
- **Correção esperada:** Se encontrar secrets expostos, revogar e rotacionar as chaves imediatamente.

---

## 8. 🌐 Headers de Segurança HTTP

**Arquivo a auditar:** `next.config.ts`.

- Verifique se os seguintes headers estão configurados:

```ts
// next.config.ts
const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" }, // Clickjacking
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Content-Security-Policy",
    value: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co;"
  },
];
```

- **Correção esperada:** Adicionar todos os headers ausentes no `next.config.ts`.

---

## 9. 🔄 CSRF (Cross-Site Request Forgery)

**Arquivos a auditar:** `app/api/`, Server Actions.

- Next.js Server Actions têm proteção CSRF nativa — verifique se está sendo usada corretamente.
- Rotas de API (`app/api/`) que modificam dados devem verificar o `Origin` header ou usar tokens CSRF.
- Procure por formulários que fazem POST para rotas de API externas sem proteção.

---

## 10. 📁 Exposição de Arquivos e Paths

**Arquivos a auditar:** `public/`, `next.config.ts`.

- Verifique se arquivos sensíveis não estão na pasta `public/` (uploads de usuários, backups, configs).
- Procure por path traversal em rotas dinâmicas: `app/[id]/`, `app/[slug]/` — o parâmetro está sendo validado antes de consultar o banco?
- Verifique se rotas de API que retornam arquivos fazem checagem de autorização.

---

## 📝 Output esperado

Ao final da auditoria, crie o arquivo `SECURITY_REPORT.md` na raiz do projeto com:

1. **Resumo executivo** — quantos problemas encontrados por severidade (Crítico / Alto / Médio / Baixo)
2. **Lista detalhada** de cada vulnerabilidade encontrada com: arquivo afetado, linha, descrição, código vulnerável e código corrigido
3. **Lista de correções aplicadas**
4. **Recomendações adicionais** que precisam de ação manual (ex: configurações no painel do Supabase, Vercel)

**Prioridade de correção:**
- 🔴 Crítico: Implementar imediatamente (SQL injection, service_role exposta, ausência de RLS)
- 🟠 Alto: Rate limiting em auth, getUser() vs getSession()
- 🟡 Médio: Headers HTTP, validação de input
- 🟢 Baixo: Melhorias de CSP, permissões

---

*Stack: Next.js App Router + Supabase + TypeScript + Vercel*
