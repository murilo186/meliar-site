# Task: Featured Products Swiper

Data: 2026-05-08
Branch sugerida: `feature/finalizacao-loja`

## Objetivo

Criar uma nova seção na home da loja, logo abaixo de `Novidades`, com foco em produtos que estão sendo usados por clientes/looks reais.

A seção deve funcionar como um bloco comercial forte de fechamento da loja, antes das otimizações mais finas de performance e segurança.

## Nome da seção

`Elas estão usando`

## Referencia visual

Inspiracao no comportamento de swiper/carrossel do site da Brooks Donna:

- cards grandes em foco
- navegação horizontal por swipe
- miniaturas abaixo
- item central destacado
- leitura imediata do produto em uso

Diferença principal:

- usar `imagem` do produto, nao video
- manter a interface compacta e mobile-first
- evitar qualquer visual pesado ou chamativo demais

## O que a feature deve mostrar

Cada item do carrossel deve exibir:

- imagem principal do produto
- miniatura inferior ou faixa de thumbnails
- nome do produto
- preço
- CTA leve para abrir o produto

Se fizer sentido, pode incluir:

- cor do look/produto
- categoria curta
- indicador de destaque manual

## Fonte dos itens

Os itens do swiper devem vir dos produtos marcados como `hot` na pagina `admin/produtos`.

Regras:

- usar apenas produtos com flag `isHot = true`
- se houver poucos itens, manter o carrossel mesmo assim
- se nao houver itens `hot`, a seção pode:
  - esconder completamente
  - ou cair para um estado vazio curto, dependendo da decisao de layout
- a ordem ideal deve priorizar curadoria manual, nao automacao

## Regras de layout

- a seção entra logo abaixo de `Novidades`
- deve ocupar menos espaco que um banner tradicional
- no mobile, o item principal precisa dominar a tela
- thumbnails devem ficar acessiveis sem poluir
- nao usar gradientes
- nao usar textos longos
- nao usar blocos vazios
- nao usar marketing genérico

## Comportamento esperado

- swipe horizontal no mobile
- navegação por setas ou botões leves no desktop, se necessario
- thumbnail clicavel para trocar o item exibido
- clique no card abre o PDP
- foco visual no look, nao no bloco editorial

## Dados necessários

Idealmente essa seção nao deve depender de uma query complexa.

Melhor abordagem futura:

- lista manual de produtos em destaque
- ou flag simples de destaque no catalogo local
- ou campo dedicado para curadoria da home

Se o modelo atual de componentes nao suportar isso com clareza, o correto é criar uma estrutura nova para essa seção em vez de forcar o componente atual.

## Componentes prováveis

Possivel estrutura futura:

- `FeaturedProductsSection`
- `FeaturedProductSwiper`
- `FeaturedProductCard`
- `FeaturedProductThumbnails`

## Checklist tecnico para implementacao

1. Criar um helper de catalogo para buscar produtos `hot`.
2. Expor esses itens na home abaixo de `Novidades`.
3. Montar o swiper com foco em uma imagem principal por vez.
4. Sincronizar as thumbnails com o slide ativo.
5. Abrir o PDP ao clicar no card principal.
6. Garantir comportamento mobile-first.
7. Manter o bloco compacto e com linguagem visual coerente com a loja.
8. Reaproveitar dados existentes do catalogo, sem query complexa ou dependencia desnecessaria do admin.

## Estrutura sugerida de arquivos

### Dados e catalogo

- `data/products.ts`
- `lib/catalog/get-products.ts`
- `lib/catalog/get-featured-hot-products.ts`

### Tipos

- `types/product.ts`

### Componentes

- `components/home/featured-products-section.tsx`
- `components/home/featured-products-swiper.tsx`
- `components/home/featured-product-card.tsx`
- `components/home/featured-product-thumbnails.tsx`

### Home

- `app/page.tsx`

## Responsabilidade de cada peça

- `get-featured-hot-products.ts`
  - filtra os produtos com `isHot = true`
  - retorna apenas os dados necessários para a home

- `featured-products-section.tsx`
  - monta a chamada da seção
  - insere o bloco abaixo de `Novidades`

- `featured-products-swiper.tsx`
  - controla slide ativo
  - suporta swipe no mobile
  - sincroniza thumbnails e card principal

- `featured-product-card.tsx`
  - exibe a imagem principal
  - mostra nome e preço
  - leva ao PDP

- `featured-product-thumbnails.tsx`
  - mostra as miniaturas
  - permite trocar o item em foco

## Fluxo esperado

1. Admin marca um produto como `hot`.
2. O helper de catalogo retorna esse produto.
3. A home renderiza a seção `Elas estão usando`.
4. O usuário navega pelo swiper.
5. Ao clicar no card, vai para o PDP do produto.

## Decisao de implementacao

Se a estrutura atual da home nao absorver essa seção de forma limpa, a correção não deve ser "enfiar" o swiper dentro de um bloco existente.

Nesse caso, a implementação correta é:

- criar componentes novos
- manter a seção isolada
- preservar o restante da home sem refatoração desnecessária
- evitar acoplamento com lógica de admin ou queries complexas

## Fora de escopo agora

- video
- automação de curadoria
- integração com Instagram
- personalização por usuário
- analytics de clique
- lazy loading avançado da galeria
- variação por cor dentro do swiper
- qualquer dependência de Supabase para buscar os itens da home nessa etapa

## Aceitacao

A tarefa pode ser considerada pronta quando:

- a seção aparece abaixo de `Novidades`
- a navegacao funciona bem no mobile
- a imagem principal fica clara e legivel
- as thumbnails funcionam como seletor
- o bloco combina com a linguagem visual atual da loja
- o layout nao parece um carrossel genérico de template

## Observacao tecnica

O modelo atual pode nao ser o melhor ponto de encaixe para essa feature se ele exigir muitas adaptações na home. Nesse caso, a implementacao deve esperar uma rodada com mais contexto ou um modelo mais forte para desenhar a estrutura correta sem quebrar o restante da home.
