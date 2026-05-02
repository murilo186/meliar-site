# ROADMAP.md — Meliar Site

## Objetivo

Organizar a implementação do site da Meliar em etapas pequenas, evitando que o projeto cresça antes da hora.

A primeira versão deve entregar um site público em Next.js com catálogo, página de produto, carrinho local e finalização pelo WhatsApp.

## Premissas

- O projeto começa sem backend separado.
- O catálogo começa manual em arquivo TypeScript.
- As imagens começam locais em `public/images`.
- O carrinho começa local no navegador.
- A venda será finalizada pelo WhatsApp.
- O painel administrativo será feito depois.
- Supabase será considerado em uma fase futura.
- Checkout online, gateway de pagamento e frete automático ficam fora do escopo atual.

## Fase 0 — Base técnica

### Objetivo

Criar ou migrar o projeto para uma base limpa em Next.js.

### Tarefas

- [x] Migrar de Vite/React para Next.js com App Router ou recriar o projeto Next preservando assets úteis.
- [x] Configurar TypeScript.
- [x] Configurar Tailwind CSS.
- [x] Definir estrutura de pastas.
- [x] Criar `AGENTS.md`.
- [x] Criar `ROADMAP.md`.
- [ ] Criar `.env.example`.
- [x] Garantir `.env.local` no `.gitignore`.
- [x] Configurar scripts com pnpm.
- [x] Validar `pnpm lint`.
- [x] Validar `pnpm build`.

### Critério de conclusão

Projeto Next.js rodando localmente, com estrutura organizada e build funcionando.

### Status atual

Concluído.

A base do projeto já foi migrada para Next.js com App Router, Tailwind e TypeScript, preservando a home aprovada.

### Próxima etapa

Próxima implementação: Fase 4 — PLP / Catálogo.

## Fase 1 — Estrutura visual base

### Objetivo

Criar a base visual compartilhada do site.

### Tarefas

- [ ] Criar layout raiz.
- [ ] Criar header desktop.
- [ ] Criar header mobile.
- [ ] Criar footer.
- [ ] Criar componente `Container`.
- [ ] Criar componente `Button`.
- [ ] Criar configurações públicas da loja em `config/store.ts`.
- [ ] Definir tokens básicos de cor, espaçamento e tipografia.

### Critério de conclusão

Todas as páginas públicas conseguem usar o mesmo layout base.

## Fase 2 — Home inicial

### Objetivo

Construir uma home enxuta, bonita e adequada para uma loja com poucos produtos.

### Estrutura da home

- [ ] Hero principal com imagem desktop.
- [ ] Hero adaptado para mobile.
- [ ] CTA para catálogo.
- [ ] CTA para WhatsApp, se fizer sentido.
- [ ] Seção de categorias/atalhos.
- [ ] Seção “Novidades” ou “Peças selecionadas”.
- [ ] Seção “Como comprar”.
- [ ] Seção curta “Sobre a Meliar”.
- [ ] Preview manual do Instagram.
- [ ] Footer completo.

### Não fazer agora

- [ ] Não criar “mais vendidos”.
- [ ] Não criar depoimentos falsos.
- [ ] Não criar várias seções de produto sem conteúdo real.

### Critério de conclusão

Home visualmente apresentável em mobile e desktop, sem parecer vazia mesmo com poucos produtos.

## Fase 3 — Dados manuais de catálogo

### Objetivo

Criar a camada temporária de dados que será usada pela PLP, PDP e carrinho.

### Tarefas

- [ ] Criar `types/product.ts`.
- [ ] Criar `types/cart.ts`.
- [ ] Criar `data/products.ts`.
- [ ] Criar `data/categories.ts`.
- [ ] Criar `lib/catalog/get-products.ts`.
- [ ] Criar `lib/catalog/get-product-by-slug.ts`.
- [ ] Criar `lib/utils/format-currency.ts`.
- [ ] Criar imagens em `public/images/products`.

### Modelo mínimo de produto

```ts
Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  basePrice: number;
  published: boolean;
  images: string[];
  variants: ProductVariant[];
}
```

### Critério de conclusão

Produtos mockados aparecem corretamente na home e podem ser reaproveitados na PLP/PDP.

## Fase 4 — PLP / Catálogo

### Objetivo

Criar a página de listagem de produtos.

### Rota

```txt
/catalogo
```

### Tarefas

- [x] Criar página `/catalogo`.
- [x] Criar `ProductCard`.
- [x] Criar `ProductGrid`.
- [x] Exibir apenas produtos publicados.
- [x] Criar filtro simples por categoria.
- [ ] Criar filtro simples por tamanho, se não atrasar.
- [x] Criar estado vazio elegante.
- [ ] Criar link do card para `/produto/[slug]`.
- [x] Garantir responsividade.

### Status atual

Concluído na base atual.

A PLP já foi implementada com:
- rota principal `/produtos` funcionando como página de novidades com todos os produtos;
- rotas de categoria como `/vestidos`, `/conjuntos`, `/partes-de-cima` e `/partes-de-baixo`;
- rotas de subcategoria como `/partes-de-cima/croppeds`, `/partes-de-baixo/calcas` e `/partes-de-baixo/saias`;
- breadcrumb no padrão de navegação da listagem;
- header e menu mobile ligados às rotas reais de categoria;
- home com categorias circulares apontando para subcategorias;
- visual da listagem replicado para as páginas de catálogo atuais.

### Próximo passo

Próxima etapa: Fase 5 — PDP / Página de produto.

Próxima implementação recomendada:
- criar rota `/produto/[slug]`;
- definir o clique final dos cards para a PDP;
- montar galeria, infos do produto e estrutura base da página de produto.

### Critério de conclusão

O usuário consegue navegar pelo catálogo e abrir uma página de produto.

## Fase 5 — PDP / Página de produto

### Objetivo

Criar a página individual de produto.

### Rota

```txt
/produto/[slug]
```

### Tarefas

- [x] Criar rota dinâmica de produto.
- [x] Buscar produto pelo slug.
- [x] Criar `ProductGallery`.
- [x] Criar `ProductInfo`.
- [x] Criar `VariantSelector`.
- [x] Permitir seleção de cor.
- [x] Permitir seleção de tamanho.
- [ ] Permitir escolha de quantidade.
- [x] Exibir preço.
- [x] Exibir descrição.
- [ ] Exibir informações simples de compra via WhatsApp.
- [x] Criar botão “Adicionar à sacola”.

### Status atual

Em andamento avançado.

A `v3.0` já consolidou:
- rota `/produto/[slug]` ligada ao clique dos cards;
- novo modelo de produto com galeria e variantes por cor;
- home e PLP apontando para a PDP real;
- seletor de cor e seletor de tamanho na PDP;
- galeria mobile com swipe e indicadores;
- galeria desktop com miniaturas laterais e avanço por clique;
- sacola preparada para receber seleção de cor e tamanho;
- ajustes de header para evitar glitch em páginas curtas.

### Próximo passo

Próxima implementação recomendada para a `v0.4`:
- finalizar a rota `/carrinho`;
- persistir a sacola no navegador;
- gerar a mensagem estruturada de checkout no WhatsApp;
- revisar microcopy e acabamento visual final da PDP/PLP;
- substituir os dados inferidos do catálogo pelos dados vindos do `.txt` quando ele existir.

### Critério de conclusão

O usuário consegue escolher uma variante e adicionar o produto ao carrinho.

## Fase 6 — Carrinho local

### Objetivo

Criar a sacola/carrinho sem backend.

### Rota

```txt
/carrinho
```

### Tarefas

- [ ] Criar estado global do carrinho.
- [ ] Persistir carrinho no `localStorage`, se fizer sentido.
- [ ] Criar `CartItem`.
- [ ] Criar `CartSummary`.
- [ ] Permitir aumentar quantidade.
- [ ] Permitir reduzir quantidade.
- [ ] Permitir remover item.
- [ ] Calcular subtotal por item.
- [ ] Calcular total do pedido.
- [ ] Criar estado de carrinho vazio.

### Critério de conclusão

O usuário consegue montar uma sacola completa antes de finalizar pelo WhatsApp.

## Fase 7 — Finalização pelo WhatsApp

### Objetivo

Gerar uma mensagem estruturada com os itens do carrinho.

### Tarefas

- [ ] Criar `lib/whatsapp/build-whatsapp-message.ts`.
- [ ] Criar `lib/whatsapp/build-whatsapp-url.ts`.
- [ ] Criar `WhatsAppCheckoutButton`.
- [ ] Incluir nome dos produtos.
- [ ] Incluir cor.
- [ ] Incluir tamanho.
- [ ] Incluir quantidade.
- [ ] Incluir valor unitário.
- [ ] Incluir subtotal.
- [ ] Incluir total.
- [ ] Abrir WhatsApp em nova aba.

### Critério de conclusão

O cliente consegue finalizar a sacola pelo WhatsApp com mensagem clara e completa.

## Fase 8 — Polimento e deploy

### Objetivo

Preparar a primeira versão pública.

### Tarefas

- [ ] Revisar mobile.
- [ ] Revisar desktop.
- [ ] Otimizar imagens.
- [ ] Revisar textos.
- [ ] Revisar links de WhatsApp e Instagram.
- [ ] Criar metadata básica.
- [ ] Criar favicon.
- [ ] Criar README.
- [ ] Validar `pnpm lint`.
- [ ] Validar `pnpm build`.
- [ ] Deploy na Vercel.

### Critério de conclusão

Site publicado com home, catálogo, PDP, carrinho e WhatsApp checkout funcionando.

## Fase 9 — Pós-primeira versão

### Objetivo

Preparar evolução sem reescrever o site.

### Possibilidades futuras

- [ ] Conectar produtos ao Supabase.
- [ ] Subir imagens no Supabase Storage.
- [ ] Criar login administrativo.
- [ ] Criar painel de produtos.
- [ ] Criar painel de variantes.
- [ ] Criar controle de estoque.
- [ ] Criar registro manual de vendas.
- [ ] Criar relatórios básicos.
- [ ] Criar integração com Instagram API, se valer a pena.

## Ordem recomendada

1. Base Next.js.
2. Layout compartilhado.
3. Home.
4. Dados manuais.
5. PLP.
6. PDP.
7. Carrinho.
8. WhatsApp checkout.
9. Deploy.
10. Admin/Supabase somente depois.

## Regra de controle de escopo

Toda nova ideia deve responder:

1. Ajuda a primeira versão a ficar pronta?
2. É necessária antes da PLP, PDP e carrinho?
3. Pode ser feita sem backend agora?
4. Se não for essencial, deve ir para pós-MVP.
