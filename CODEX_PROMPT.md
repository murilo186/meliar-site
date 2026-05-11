# Prompt para Codex — Implementação Meliar Site em Next.js

Você está trabalhando no repositório `murilo186/meliar-site`, projeto da loja de roupas Meliar.

## Contexto

A Meliar precisa de uma primeira versão pública do site, com foco em catálogo e finalização pelo WhatsApp.

O projeto não deve virar um e-commerce completo agora.

O escopo atual é:

- site público em Next.js;
- home;
- catálogo/PLP;
- página de produto/PDP;
- carrinho local;
- botão de finalizar pelo WhatsApp com mensagem estruturada.

O projeto ainda não terá:

- backend separado;
- Supabase;
- login;
- painel administrativo;
- pagamento online;
- gateway;
- checkout tradicional;
- Docker;
- CI/CD customizado.

## Observação importante sobre o estado atual

O projeto pode estar atualmente em Vite/React. Se estiver, faça uma migração controlada para Next.js ou proponha a recriação da base em Next.js preservando assets, estilos e componentes úteis.

Não misture padrões de Vite com Next.js.

## Stack desejada

Use:

- Next.js com App Router;
- TypeScript;
- Tailwind CSS;
- pnpm;
- organização por pastas;
- catálogo manual em `data/products.ts`;
- imagens locais em `public/images`;
- carrinho local no navegador;
- funções puras para WhatsApp.

## Estrutura desejada

Crie ou ajuste o projeto para seguir esta estrutura:

```txt
app/
  (site)/
    page.tsx
    catalogo/
      page.tsx
    produto/
      [slug]/
        page.tsx
    carrinho/
      page.tsx
  layout.tsx
  globals.css

components/
  layout/
  home/
  product/
  cart/
  ui/

config/
  store.ts

data/
  products.ts
  categories.ts

features/
  cart/

lib/
  catalog/
  whatsapp/
  utils/

types/
  product.ts
  cart.ts

public/
  images/
    hero/
    products/
    instagram/
```

## Diretrizes de implementação

1. Não coloque arrays de produtos diretamente nas páginas.
2. Crie funções como `getProducts()` e `getProductBySlug()` em `lib/catalog`.
3. Hoje essas funções devem ler de `data/products.ts`.
4. No futuro elas poderão ler do Supabase sem alterar as páginas.
5. Separe componentes visuais de regras de carrinho e WhatsApp.
6. Use TypeScript de forma consistente.
7. Não adicione dependências sem necessidade.
8. Não implemente backend agora.
9. Não implemente painel administrativo agora.
10. Não crie “mais vendidos” sem dados reais.

## Home

A home deve funcionar mesmo com poucos produtos.

Criar:

- header;
- hero com imagem desktop/mobile;
- CTA para catálogo;
- categorias ou atalhos principais;
- seção “Novidades” ou “Peças selecionadas”;
- seção “Como comprar”;
- texto curto sobre a Meliar;
- preview manual do Instagram;
- footer.

Evitar:

- seções falsas de mais vendidos;
- excesso de blocos vazios;
- aparência de loja gigante;
- checkout online.

## PLP

Criar `/catalogo` com:

- grid responsivo;
- cards de produto;
- filtro simples por categoria;
- link para a PDP;
- estado vazio.

## PDP

Criar `/produto/[slug]` com:

- galeria de imagens;
- nome;
- preço;
- descrição;
- seleção de cor;
- seleção de tamanho;
- quantidade;
- botão de adicionar à sacola;
- informações simples sobre compra via WhatsApp.

## Carrinho

Criar `/carrinho` com:

- lista de itens;
- alteração de quantidade;
- remoção de item;
- subtotal;
- total;
- botão de finalizar pelo WhatsApp.

O carrinho deve ser local. Pode usar Context API ou Zustand, mas escolha a solução mais simples e mantenível.

## WhatsApp

Criar funções:

```txt
lib/whatsapp/build-whatsapp-message.ts
lib/whatsapp/build-whatsapp-url.ts
```

A mensagem deve seguir o formato:

```txt
Olá, gostaria de fazer um pedido na Meliar:

1. Nome do Produto
- Cor: X
- Tamanho: Y
- Quantidade: Z
- Valor unitário: R$ 00,00
- Subtotal: R$ 00,00

Total do pedido: R$ 00,00

Gostaria de combinar entrega e pagamento.
```

## Env

Usar `.env.local` para valores reais e `.env.example` como modelo.

Exemplo:

```env
NEXT_PUBLIC_STORE_NAME=Meliar
NEXT_PUBLIC_WHATSAPP_NUMBER=5511999999999
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Nunca commitar `.env.local`.

## Critérios de aceite

Antes de finalizar qualquer etapa:

- rode `pnpm lint`;
- rode `pnpm build`;
- garanta que mobile e desktop estão aceitáveis;
- garanta que não há segredo no código;
- garanta que não há backend desnecessário;
- garanta que a etapa não aumentou o escopo.

## Tarefa inicial recomendada

Comece pela base Next.js e estrutura do projeto.

Depois implemente nesta ordem:

1. layout base;
2. home;
3. dados manuais de produtos;
4. PLP;
5. PDP;
6. carrinho;
7. WhatsApp checkout;
8. polimento e deploy.

Não pule direto para carrinho, Supabase ou painel administrativo.
