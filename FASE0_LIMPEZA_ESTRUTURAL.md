# Fase 0 — Limpeza Estrutural (pré-segurança)

## Contexto

O projeto Meliar está funcional com Next.js + Supabase (auth, catálogo, admin, pedidos, favoritos).
O objetivo desta sessão é **apenas limpeza estrutural** — sem novas features, sem refatoração de lógica de negócio.

A limpeza é necessária porque a sessão seguinte vai aplicar segurança (rate limit, headers, validação Zod, proteção de rotas). Código desorganizado força o agente a consumir contexto entendendo estrutura em vez de aplicar segurança.

---

## Tarefa 1 — Remover o sistema de catálogo local (data/)

O projeto tem dois sistemas de catálogo vivos ao mesmo tempo:
- `lib/catalog/get-products.ts` → lê de `data/products.ts` (arquivo local, fase de migração)
- `lib/catalog/get-products-db.ts` → lê do Supabase (sistema atual e correto)

**O sistema local é legado.** A tela de admin já existe, a cliente cadastra produtos direto no banco. O arquivo local foi um andaime que deve ser removido.

### Ações

**1.1 — Antes de deletar, verificar se alguma página ainda importa do sistema local:**

```bash
grep -r "get-products\"" --include="*.ts" --include="*.tsx" -rl . | grep -v node_modules
grep -r "from.*data/products" --include="*.ts" --include="*.tsx" -rl . | grep -v node_modules
```

**1.2 — Para cada arquivo que ainda importar do sistema local**, substituir pelo equivalente do sistema DB:

| Função local (remover) | Função DB (usar) |
|---|---|
| `getProducts()` | `getProductsFromDb()` |
| `getProductsByCategory()` | `getProductsByCategoryFromDb()` |
| `getProductsBySubcategory()` | `getProductsBySubcategoryFromDb()` |
| `getProductBySlug()` | `getProductBySlugFromDb()` |
| `getRelatedProducts()` | `getRelatedProductsFromDb()` |
| `getFeaturedProducts()` | usar `getProductsFromDb()` com `.slice()` |

**1.3 — Após migrar todos os imports, deletar:**
```bash
rm lib/catalog/get-products.ts
rm -rf data/
```

**1.4 — Remover o tipo `ProductSort` de `get-products.ts`** antes de deletar — ele é importado em `get-products-db.ts`. Mover a declaração de `ProductSort` e `parseProductSort` para `lib/catalog/catalog-filters.ts` (já existe) ou para um novo `lib/catalog/types.ts`. Atualizar todos os imports.

**1.5 — Verificar se `get-products-db.ts` ainda importa de `get-products.ts`:**
```ts
// Esta linha deve ser removida após mover ProductSort:
import type { ProductSort } from "@/lib/catalog/get-products";
```

---

## Tarefa 2 — Consolidar get-new-arrivals-products-db.ts

O arquivo `lib/catalog/get-new-arrivals-products-db.ts` é uma função separada que provavelmente chama `getProductsFromDb()` e filtra por `isNewArrival`. Verificar o conteúdo:

```bash
cat lib/catalog/get-new-arrivals-products-db.ts
```

Se for apenas um wrapper de filtro, **inlinar a lógica dentro de `get-products-db.ts`** como uma função exportada `getNewArrivalsFromDb()` e deletar o arquivo separado. Atualizar os imports nos componentes que o usam.

---

## Tarefa 3 — Quebrar app/admin/actions.ts (942 linhas)

Este arquivo tem Server Actions de domínios completamente diferentes misturados. O Codex vai consumir contexto imenso tentando entender o arquivo inteiro para aplicar `requireAdmin()` em cada ação.

**Verificar quais domínios existem no arquivo:**
```bash
grep "^export async function" app/admin/actions.ts
```

**Separar em arquivos por domínio**, mantendo `"use server"` no topo de cada um:

- `app/admin/produtos/actions.ts` — ações de criar, editar, deletar produto, upload de imagem, variantes
- `app/admin/estoque/actions.ts` — ações de ajuste de estoque (se ainda não existir)
- `app/admin/vendas/actions.ts` — já existe, verificar se tem duplicação com `app/admin/actions.ts`
- `app/admin/actions.ts` — manter apenas ações verdadeiramente globais do admin (se houver)

**Regra:** se `app/admin/actions.ts` ficar vazio após a separação, deletar.

Após separar, atualizar os imports em:
- `app/admin/produtos/[id]/page.tsx`
- `app/admin/produtos/editar/[slug]/page.tsx`
- `app/admin/produtos/page.tsx`
- `app/admin/estoque/page.tsx`
- Qualquer outro arquivo que importe de `app/admin/actions.ts`

```bash
grep -r "from.*admin/actions" --include="*.tsx" --include="*.ts" -rl . | grep -v node_modules
```

---

## Tarefa 4 — Extrair lógica do header.tsx (744 linhas)

O `components/layout/header.tsx` tem UI, lógica de auth e lógica de carrinho misturadas.

**Verificar a estrutura:**
```bash
grep -n "^function\|^const\|^export" components/layout/header.tsx | head -40
```

**Extrair para hooks dedicados:**

- Se houver lógica de auth (checar sessão, usuário logado, logout): extrair para `lib/hooks/use-auth-state.ts`
- Se houver lógica de estado do carrinho: já deve existir `components/cart/use-cart.ts` — garantir que o header apenas consuma o hook, sem lógica inline

O componente `header.tsx` deve ter apenas JSX e chamadas de hooks. Toda lógica vai para hooks ou `lib/`.

---

## Tarefa 5 — Remover fallback de imagem mock em get-products-db.ts

No mapeamento de produtos em `get-products-db.ts`, existe esta linha:

```ts
images: variantImages.length > 0 ? variantImages : ["/mock/product-shirt.svg"],
```

A pasta `public/mock/` será deletada na sessão de limpeza de arquivos. Este fallback deve ser removido. Se não há imagem, retornar array vazio — o componente de imagem deve lidar com ausência de imagem de forma elegante.

Verificar se há outros fallbacks similares no arquivo e remover todos.

---

## Tarefa 6 — Remover fallback de tamanhos hardcoded

No mesmo `get-products-db.ts`:

```ts
sizes: sizesList.length > 0 ? sizesList : ["P", "M", "G"],
```

Tamanhos hardcoded como fallback mascaram dados inconsistentes no banco. Remover o fallback — se o produto não tem tamanhos cadastrados, retornar array vazio. O componente deve lidar com isso.

---

## Tarefa 7 — Verificar components/cart/product-card.tsx

Este componente (158 linhas) provavelmente chama Supabase diretamente. Verificar:

```bash
grep -n "supabase\|createSupabase" components/cart/product-card.tsx
```

Se houver chamadas diretas ao Supabase no componente, extrair para uma função em `lib/` e chamar a função no componente. Componentes não devem instanciar clientes Supabase diretamente.

---

## Critérios de aceite

- [ ] `pnpm build` completa sem erros
- [ ] `pnpm lint` sem warnings
- [ ] Nenhum arquivo importa de `lib/catalog/get-products.ts` ou `data/`
- [ ] `lib/catalog/get-products.ts` e `data/` não existem mais
- [ ] `app/admin/actions.ts` tem no máximo 150 linhas (ou foi deletado)
- [ ] Nenhum componente instancia cliente Supabase diretamente
- [ ] Sem strings `"/mock/product-shirt.svg"` ou tamanhos `["P", "M", "G"]` hardcoded no código de produção

## O que NÃO fazer

- Não refatorar lógica de negócio (regras de pedido, cálculo de desconto, etc.)
- Não mudar a estrutura do banco ou RLS
- Não adicionar features
- Não mudar o visual ou comportamento percebido pelo usuário
- Não mexer em `lib/supabase/`, `lib/orders/`, `lib/admin/` além do que está explícito acima
