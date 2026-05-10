# Próximos Passos Funcionais (Pré-Finalização)

Objetivo: fechar os últimos pontos de fluxo antes de entrar na fase de refinamento visual e detalhes.

## 1) Validação de checkout no backend
- Validar autenticação no servidor para finalizar pedido.
- Validar preço pelo banco (não confiar no payload do cliente).
- Validar disponibilidade real da variante (cor/tamanho) no momento do checkout.

## 2) Fluxo pós-checkout mais robusto
- Exibir confirmação clara após criação do pedido (número do pedido e estado).
- Tratar cenário de falha ao abrir WhatsApp sem perder contexto do pedido.

## 3) Páginas institucionais mínimas
- Adicionar conteúdo base de Trocas/Devoluções, Privacidade e Termos.
- Garantir links visíveis no rodapé e navegação.

## 4) Alerta de indisponibilidade no carrinho
- Conferir estoque novamente no carrinho antes de finalizar.
- Alertar item indisponível/estoque insuficiente quando houver mudança após PDP.
- Bloquear finalização enquanto houver itens com indisponibilidade.
