# Planejamento do Backoffice (Meliar)

Data: 2026-05-07
Status: Login concluído, admin em evolução

## Objetivo deste documento

Registrar o alinhamento funcional e técnico da área administrativa/backoffice antes da implementação completa.

Próximo tema a discutir: implementação da tela admin.

## Atualização de status — 2026-05-07 (etapa login)

Etapa de login finalizada com entregas implementadas:

- Login com Supabase ativo.
- Persistência de sessão por cookies via Supabase SSR + middleware.
- Guard de rota em `/admin` validando autenticação e `profiles.role = 'admin'`.
- Redirecionamento pós-login:
  - admin -> `/admin`
  - usuário comum -> `/`
- Header com estado logado:
  - mensagem "Bem-vindo" + primeiro nome
  - dropdown com `Perfil` e `Sair`
- Logout implementado (`signOut`).
- Rotas de auth protegidas para usuário já logado:
  - `/login`
  - `/create-account`
- Página `/perfil` simples criada e protegida.
- Fluxo de recuperação de senha implementado:
  - `/esqueci-senha` (envio de link)
  - `/redefinir-senha` (atualização de senha)

Observação:
- Erros de extensões do navegador e widget externo não bloqueiam a autenticação.

## Regras já alinhadas

- Imagens: máximo de 3 fotos por cor.
- Tendências (carrossel home): seleção manual (`sim`/`não`) com limite de itens.
- Novidades: automático, até 6 produtos mais recentes.
- Selo "Nova": produtos criados nos últimos 14 dias.
- Filtro de novidades na página de produtos.
- Admin com busca de produtos e tela de controle por item.
- Controle por variante (cor + tamanho): disponibilidade e quantidade.
- Ação para esconder/exibir produto no site.
- Log de movimentação de estoque (quantidade, data/hora, usuário).
- Cadastro de produto por formulário: categoria, preço, cores, tamanhos, estoque inicial e imagens por cor.
- Edição de estoque separada da edição de conteúdo do produto.
- Em ações de edição/salvamento e remoção/exclusão no admin, exibir confirmação antes de executar:
  - edição: "Salvar alterações?"
  - remoção: "Tem certeza que deseja remover/deletar este item?"
- Fluxo futuro de pedido via WhatsApp com aprovação manual no sistema.
- Baixa de estoque e painel de vendas atrelados ao fluxo de aprovação do pedido.

## Modelagem proposta (alto nível)

- `categories` com hierarquia (`parent_id`) para suportar agrupadores (ex.: Parte de baixo -> Saia/Calça).
- `products` com dados gerais e flags de publicação/destaque.
- `colors` e `sizes` como tabelas de referência.
- `product_variants` para combinação vendável (produto + cor + tamanho).
- `product_images` relacionadas por produto/cor, com ordenação e limite de 3 por cor.
- `inventory_movements` para auditoria de estoque.
- `orders` e `order_items` para registrar intenção/fluxo vindo do checkout WhatsApp.
- `profiles`/usuários administrativos para controle de acesso.

## SKU

SKU deve ser por variante (não por produto geral), com unicidade garantida.

Exemplo de formato:
- `MLR-CROPDIFF-ROS-M`

## Pontos que faltam fechar

1. Concorrência de estoque (transação/lock para evitar conflito entre admins).
2. Matriz de status do pedido (pending, approved, cancelled, etc.).
3. Regra de reserva de estoque para pedido pendente.
4. Critério oficial do painel de vendas (aprovado, pago, entregue).
5. Políticas de segurança/RLS no Supabase.
6. Regra de upload (formato, tamanho máximo, capa).
7. Momento de criação do `order` no fluxo de WhatsApp.
8. Perfis de permissão no backoffice (`admin`, `operacional`, etc.).

## Ordem sugerida (macro)

1. Login/admin auth.
2. Modelagem final do banco (SQL + constraints + índices + triggers + policies).
3. Cadastro/edição de produto e variantes.
4. Controle de estoque e log de movimentações.
5. Fluxo de pedido WhatsApp + aprovação manual + baixa de estoque.
6. Painel consolidado de vendas e operação.

## Observação de escopo

Este documento registra planejamento. A próxima etapa ativa de implementação será a discussão e definição de login.
