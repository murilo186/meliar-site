# Admin de Produtos - Usabilidade Mobile First

## Objetivo
Deixar a tela de admin mais clara para uso diário da cliente, com prioridade para celular, sem perder eficiência no desktop.

## Problemas identificados
1. Muitas ações competindo no mesmo nível visual.
2. Falta de orientação de fluxo (o que fazer primeiro).
3. Ações destrutivas próximas de ações comuns.
4. Termos técnicos (ex: SKU) visíveis o tempo todo.
5. Difícil escanear o estado do produto por cor no mobile.

## Direção de UX
1. Estruturar a tela em etapas curtas e sequenciais.
2. Exibir resumo rápido do produto no topo.
3. Mostrar resumo por cor (tamanhos, fotos, estoque, status ativo).
4. Isolar ações perigosas em "Zona de risco".
5. Manter feedback de carregamento no próprio botão clicado.

## Implementação iniciada nesta iteração
1. Etapas numeradas:
   - 1. Dados do produto
   - 2. Cores, tamanhos e fotos
2. Cabeçalho com indicadores rápidos:
   - quantidade de cores
   - variantes
   - fotos
   - estoque total
   - variantes ativas
3. Resumo por cor em cada bloco:
   - tamanhos
   - fotos
   - estoque
   - ativas
4. "Zona de risco" no fim do bloco da cor para remoção completa.
5. SKU movido para "Ver detalhes técnicos" (colapsável).

## Próximos passos sugeridos
1. Criar barra de ação fixa no rodapé mobile para salvar o bloco atual.
2. Reduzir densidade visual dos cards de imagem no celular (stack mais compacto).
3. Adicionar ícones de ajuda curtos para termos críticos (ex: variante ativa).
4. Padronizar feedback de sucesso/erro por bloco (não só no topo da página).
5. No desktop, separar em duas colunas (edição à esquerda e resumo à direita).

## Critério de aceite
1. Cliente entende o fluxo sem orientação externa.
2. Consegue editar cor/tamanho/foto sem medo de exclusão acidental.
3. Tempo para ajustar uma cor completa reduzido no mobile.

## Refinamento visual aplicado (rodada 2)
1. Checkboxes com área de toque maior para seleção de tamanhos e status "Ativa".
2. Blocos de cor com contraste leve para facilitar escaneamento no celular.
3. Upload de imagens em caixa própria para separar da lista de imagens.
4. Grid de imagens compactado para 2 colunas no mobile.
5. Cards de variante com borda e fundo dedicados, reduzindo mistura visual.
6. Formulário de estoque reorganizado com rótulo explícito "Qtd em estoque".
