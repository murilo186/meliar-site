# Fluxo WhatsApp -> Vendas -> Perfil

Data: 2026-05-08
Status: Implementado no frontend/backend da loja

## Objetivo

Conectar o botão `Finalizar no WhatsApp` ao fluxo de pedidos para que:

- o pedido seja criado no banco no momento do clique;
- o pedido apareça na área `Admin > Vendas`;
- o pedido apareça no `Perfil` do usuário quando autenticado.

## Diagnóstico da situação anterior

- Carrinho gerava apenas URL `wa.me` com mensagem.
- Admin vendas usava somente mock local.
- Perfil mostrava placeholder de pedidos.
- Não havia registro real de pedido ao clicar no checkout WhatsApp.

## Implementação aplicada

1. Checkout WhatsApp com persistência

- Criada rota `POST /api/checkout/whatsapp`.
- No clique de finalizar:
  - cria pedido em `orders` com `status = pending` e `channel = whatsapp`;
  - cria itens em `order_items`;
  - retorna URL WhatsApp com mensagem já incluindo número do pedido.
- Após sucesso, a sacola local é limpa e o WhatsApp é aberto.

2. Admin vendas com dados reais

- `app/admin/vendas` agora tenta carregar pedidos do banco.
- `app/admin/vendas/[id]` agora tenta carregar detalhe real do banco.
- Fallback para mock foi mantido em caso de erro de conexão/dados.
- Status da UI foi alinhado ao schema real:
  - `pending`, `approved`, `paid`, `delivered`, `cancelled`.

3. Perfil com pedidos do usuário

- `app/(site)/perfil` passa a listar os pedidos vinculados ao `customer_id = auth.uid()`.
- Exibe número do pedido, status, canal, data, quantidade de itens e total.
- Cada pedido possui link para uma tela própria de detalhe em `/perfil/pedidos/[id]`.
- Na tela de detalhe, a cliente pode abrir novamente o WhatsApp com mensagem de suporte do pedido.

4. Admin com troca de status real

- O detalhe de vendas em `/admin/vendas/[id]` agora permite transição de status persistida no banco.
- Fluxo aplicado:
  - `pending -> approved | cancelled`
  - `approved -> paid | cancelled`
  - `paid -> delivered | cancelled`

## Análise SQL (Supabase)

Leitura do `supabase/schema.sql`:

- Estrutura de `orders` e `order_items` já existe.
- RLS para leitura de pedidos próprios por cliente já existe.
- RLS admin para gestão total já existe.

Para o fluxo implementado, foi usada gravação server-side com `service_role` (seguro no servidor), então não foi necessário abrir policy de insert para cliente no browser.

## Arquivos principais envolvidos

- `app/api/checkout/whatsapp/route.ts`
- `lib/orders/create-whatsapp-order.ts`
- `lib/admin/sales-orders.ts`
- `lib/orders/get-customer-orders.ts`
- `components/cart/cart-page.tsx`
- `app/admin/vendas/page.tsx`
- `app/admin/vendas/[id]/page.tsx`
- `app/(site)/perfil/page.tsx`
