# Fase 1 — Segurança P0 (hardening pré-produção)

## Pré-requisitos obrigatórios antes desta sessão

Confirmar que a Fase 0 foi concluída:
- [ ] `lib/catalog/get-products.ts` e `data/` foram removidos
- [ ] `app/admin/actions.ts` foi quebrado por domínio
- [ ] `pnpm build` passou sem erros após a Fase 0

## Stack
Next.js 15 App Router + Supabase SSR + TypeScript + Vercel

---

## Tarefa 1 — Headers de segurança HTTP

**Arquivo:** `next.config.ts`

Adicionar headers de segurança em todas as rotas. O `next.config.ts` atual só tem `reactStrictMode: true`.

```ts
import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      `connect-src 'self' ${process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""} https://api.whatsapp.com`,
      "font-src 'self'",
      "frame-ancestors 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

**Após implementar:** rodar `pnpm build` e acessar o site em dev. Abrir DevTools → Network → qualquer request → verificar se os headers aparecem na resposta.

---

## Tarefa 2 — Rate limiting nas APIs públicas

**Arquivos alvo:**
- `app/api/catalog/search/route.ts`
- `app/api/checkout/whatsapp/route.ts`
- `app/api/checkout/validate/route.ts`

**Implementação sem dependência externa** (in-memory, suficiente para Vercel Edge):

Criar `lib/rate-limit.ts`:

```ts
type RateLimitEntry = { count: number; resetAt: number };
const store = new Map<string, RateLimitEntry>();

type RateLimitOptions = {
  limit: number;
  windowMs: number;
};

export function checkRateLimit(key: string, options: RateLimitOptions): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return true;
  }

  if (entry.count >= options.limit) return false;

  entry.count += 1;
  return true;
}

export function getRateLimitKey(request: Request, prefix: string): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  return `${prefix}:${ip}`;
}
```

**Aplicar em cada rota.** Exemplo para `app/api/catalog/search/route.ts`:

```ts
import { checkRateLimit, getRateLimitKey } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const key = getRateLimitKey(request, "search");
  const allowed = checkRateLimit(key, { limit: 30, windowMs: 60_000 });

  if (!allowed) {
    return NextResponse.json(
      { error: "Muitas requisições. Tente novamente em instantes." },
      { status: 429 }
    );
  }

  // lógica existente da rota abaixo, sem alterações
}
```

**Limites por rota:**
- `search`: 30 requisições por minuto por IP
- `checkout/validate`: 10 requisições por minuto por IP
- `checkout/whatsapp`: 5 requisições por minuto por IP

Não alterar a lógica existente de cada rota — apenas adicionar o bloco de rate limit no início do handler.

---

## Tarefa 3 — Proteção de rotas no middleware.ts

**Arquivo:** `middleware.ts`

O middleware atual apenas chama `updateSession`. Adicionar proteção explícita por escopo de rota.

```ts
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_ROUTES = ["/", "/catalogo", "/produto", "/carrinho", "/login", "/criar-conta", "/forgot-password", "/reset-password", "/politica-de-privacidade", "/trocas-e-devolucoes"];
const AUTH_ROUTES = ["/perfil"];
const ADMIN_ROUTES = ["/admin"];

function isPublicRoute(pathname: string) {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

function isAdminRoute(pathname: string) {
  return ADMIN_ROUTES.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string) {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  if (isAdminRoute(pathname) && !user) {
    return NextResponse.redirect(new URL("/login?redirectTo=" + encodeURIComponent(pathname), request.url));
  }

  if (isAuthRoute(pathname) && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

**Atenção:** verificar se `updateSession` em `lib/supabase/middleware.ts` retorna `{ response, user }` ou apenas `response`. Se a assinatura for diferente, adaptar sem quebrar o comportamento existente de renovação de sessão. Ler o arquivo antes de escrever:

```bash
cat lib/supabase/middleware.ts
```

Se `updateSession` não expõe o `user`, criar um cliente server dentro do middleware para verificar a sessão separadamente, como segunda chamada.

---

## Tarefa 4 — Validação Zod nas APIs públicas

**Arquivos alvo:** as mesmas 3 rotas de API.

Instalar Zod se não estiver no `package.json`:
```bash
pnpm add zod
```

Verificar se já está instalado antes:
```bash
cat package.json | grep zod
```

**Exemplo para `app/api/catalog/search/route.ts`:**

```ts
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().min(1).max(100).trim(),
  category: z.string().max(60).optional(),
  sort: z.enum(["featured", "price-asc", "price-desc", "name-asc", "name-desc"]).optional(),
});

export async function GET(request: Request) {
  // rate limit primeiro (Tarefa 2)

  const { searchParams } = new URL(request.url);
  const parsed = searchSchema.safeParse({
    q: searchParams.get("q"),
    category: searchParams.get("category"),
    sort: searchParams.get("sort"),
  });

  if (!parsed.success) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }

  const { q, category, sort } = parsed.data;
  // usar q, category, sort no lugar dos valores brutos
}
```

Para as rotas POST (`checkout/validate`, `checkout/whatsapp`), aplicar validação no body:

```ts
const body = await request.json().catch(() => null);
if (!body) return NextResponse.json({ error: "Body inválido." }, { status: 400 });

const parsed = checkoutSchema.safeParse(body);
if (!parsed.success) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
```

Criar schemas específicos para cada rota baseados nos campos que cada uma já espera. Ler cada rota antes de escrever o schema.

---

## Tarefa 5 — Verificação de admin nas Server Actions

**Arquivos:** `app/admin/produtos/actions.ts`, `app/admin/vendas/actions.ts`, `app/admin/estoque/actions.ts` (criados na Fase 0).

Confirmar que **toda** Server Action começa com `await requireAdmin()`:

```bash
grep -n "export async function" app/admin/produtos/actions.ts
grep -n "requireAdmin" app/admin/produtos/actions.ts
```

Para cada função que não tiver `requireAdmin()` como primeira chamada, adicionar. A função já existe em `lib/admin/require-admin.ts` — não recriar.

---

## Tarefa 6 — Auditoria de uso da service role

A `SUPABASE_SERVICE_ROLE_KEY` bypassa RLS completamente. Verificar que só é usada em contextos server-side:

```bash
grep -rn "createSupabaseServiceClient\|service_role\|SERVICE_ROLE" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```

Para cada ocorrência:
- Se estiver em `lib/`, `app/admin/`, `app/api/` — OK, são server-side
- Se estiver em `components/` com `"use client"` — erro crítico, substituir por `createSupabaseBrowserClient` ou mover a lógica para uma Server Action

---

## Critérios de aceite

- [ ] `pnpm build` sem erros
- [ ] Headers de segurança visíveis nas respostas HTTP (checar no DevTools)
- [ ] Rotas `/admin/*` redirecionam para `/login` sem sessão ativa
- [ ] `/api/catalog/search` retorna 429 após 30 requests em 1 minuto
- [ ] `/api/checkout/whatsapp` retorna 429 após 5 requests em 1 minuto
- [ ] Toda Server Action em `/admin` começa com `requireAdmin()`
- [ ] Nenhum `createSupabaseServiceClient` em componentes client-side
- [ ] Inputs das APIs validados com Zod antes de qualquer query

## O que NÃO fazer

- Não mudar lógica de negócio das rotas — apenas adicionar camadas de proteção no início
- Não instalar bibliotecas além de `zod` (se não estiver instalado)
- Não mexer em RLS no Supabase — isso é Fase 2
- Não refatorar componentes além do que foi feito na Fase 0
