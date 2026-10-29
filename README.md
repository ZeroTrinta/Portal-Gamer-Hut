# Gamer Hut · Creative Studio

Gerador de criativos para o Instagram da Gamer Hut. Roda 100% no navegador
(React + Babel via CDN), sem build.

## Como rodar

Por causa do carregamento de módulos `.jsx`, sirva a pasta por um servidor
estático (abrir o arquivo direto via `file://` pode bloquear os scripts):

```bash
# Python
python3 -m http.server 8080
# ou Node
npx serve .
```

Depois abra `http://localhost:8080`.

## Modelos disponíveis

- **Mês da Mídia Física Destaque** — até quatro jogos com capas, logo da marca e preços.
- **Mês da Mídia Física Lista** — até quatro blocos de marcas, com listas em duas colunas.
- **Mês da Mídia Física Individual** — arte de fundo, mockup opcional e promoção em destaque.
  Os três são carrosséis sem limite fixo de páginas, com Feed e Stories, sem capa obrigatória.
  Os preços são preenchidos manualmente.

- **Carrossel** — páginas sequenciais sem limite fixo (mínimo 3) (capa + conteúdo). Inclui o tipo de
  página **Vídeo**: card horizontal 16:9 com trailer tocando e **exportação em
  vídeo** (canvas + MediaRecorder, com áudio).
- **Post blocado** — tipografia forte sobre cor sólida.
- **Post c/ imagem** — imagem em destaque + texto e etiqueta de preço.
- **Quiz** — modo *Pergunta* (opções A–D, resposta destacável) e *Esse ou
  Aquele* (dois painéis + divisor).
- **Top / Ranking** — lista numerada (top da semana / mais vendidos).
- **Capa de Reels** — 9:16 com guia de safe zone 4:5.

### Formato Feed / Stories

**Post blocado**, **Quiz** e **Top / Ranking** têm um seletor de **FORMATO** no
topo do painel: alterna entre **Feed 4:5 (1080×1350)** e **Stories 9:16
(1080×1920)**. O conteúdo se reequilibra automaticamente no formato vertical.

## Tags de categoria

Cada tag define a cor de destaque e o selo (Notícias, Pré-venda, Restoque,
Lançamento, Preview, Trailer, Review, Quiz). Adicionar/editar tags em
`app/data.jsx` faz o app inteiro se adaptar.

## Estrutura

```
index.html        # shell + fontes + ordem de carregamento dos scripts
app/data.jsx      # tokens de design, tags, templates, padrões de fundo
app/preview.jsx   # renderizadores de cada modelo + compositor de vídeo (canvas)
app/controls.jsx  # controles atômicos do painel (inputs, drops, steppers)
app/panel.jsx     # montagem do painel por modelo
app/app.jsx       # shell do app, escala, export PNG e export de vídeo
assets/           # logotipos e marcas (PNG)
```

## Exportação

- **PNG** — render off-screen em resolução nativa (html-to-image).
- **Vídeo** (apenas página de vídeo do carrossel) — grava o quadro da marca com
  o trailer tocando; sai em MP4 ou WebM conforme o navegador.

> Observação: vídeos enviados ficam só na sessão (não são salvos ao recarregar).

## Banners Black Físico — desktop e mobile

Escolha **BANNER BLACK FRIDAY** no Studio. Escolha **Desktop (1500 × 435)** ou **Mobile (600 × 1269)**. O PNG é exportado na dimensão nativa do formato escolhido, com o formato no nome do arquivo.
Use **Jogo em destaque** com uma arte de fundo e mockup opcional, ou **Vários jogos**
com 1 a 5 capas/mockups. PNG transparente funciona para recortes; as imagens mantêm
sua proporção. Chamada, nome, destaque de desconto, preços e CTA são editáveis.
Deixe preços e desconto em branco para uma campanha sem valores. Não são calculados
nem inventados descontos. O exportador avisa se os textos excedem o espaço do banner.

Nos carrosséis, digite a quantidade e confirme com Enter ou saindo do campo.
**Ir para página** acessa diretamente qualquer oferta. Reduzir a quantidade não apaga
o conteúdo das páginas ocultas. A navegação mostra até sete botões por vez, e páginas
vazias não ocupam espaço de armazenamento. A capacidade de imagens salvas depende do
armazenamento do navegador; exportações em lote dependem da permissão de downloads múltiplos.

Testes de lógica e renderização estrutural: `npm install` e `npm test`.

Os banners seguem a campanha Black Físico: fundo escuro, iluminação laranja, logo
no topo, título em duas linhas, período em contorno luminoso e CTA em botão.
O mobile reorganiza a composição na vertical; cinco jogos usam duas fileiras.
**Pré-Black**, **Black Físico** e **Mês da Mídia Física** aplicam textos editáveis.
O primeiro usa o período de 10 a 12 de outubro das referências; revise as datas para
cada campanha. Aplicar um conjunto substitui textos e limpa preços/desconto,
preservando imagens e formato. Trocar apenas o formato preserva todos os campos.

## Mês da Mídia Física — três versões da campanha

- **Destaque:** título editável, logo opcional abaixo dele e de um a quatro jogos
  por página. Cada jogo tem capa, nome, plataforma, preço anterior riscado e promoção.
- **Lista:** de um a quatro blocos com logo ou nome de marca e até 12 jogos por
  bloco. Blocos 1 e 3 ficam à esquerda; 2 e 4, à direita. Cada linha tem nome,
  plataforma e os dois preços. Distribua listas muito extensas entre páginas.
- **Individual:** imagem de fundo, mockup opcional com escala, rotação e posição,
  título opcional, plataforma, preços, condição e aviso de estoque editável.

Todos têm fundo preto com textura e brilho laranja, imagem enviada ou cor sólida.
A imagem aceita enquadramento, zoom, desfoque e escurecimento. Logos, conteúdo,
cores e aviso podem ser personalizados por página. Não é necessário criar capa.

**Duplicar esta oferta no final** copia também jogos, grupos e logos sem vincular
as edições entre páginas. O exportador detecta textos que não cabem e pede para
encurtá-los ou distribuir os jogos em mais páginas. Preços vazios são omitidos.

O antigo carrossel Black Friday continua fora da seleção. Seus dados salvos de
imagem, preço e páginas são reaproveitados no Individual, com a nova composição.
O banner Black Friday desktop/mobile permanece disponível.

Validação: 21 testes automatizados, edição e duplicação pela interface e exportação
PNG no Chromium das três versões em Feed e Stories.

### Stories do carrossel

Em **Mês da Mídia Física → Formato do carrossel**, alterne entre **Feed 4:5
(1080 × 1350)** e **Stories 9:16 (1080 × 1920)**. A seleção vale para todas as
páginas e mantém ofertas, mockups, preços e posição atual. No Stories, a composição
original fica centralizada com 285 px adicionais acima e abaixo; o fundo preenche
a altura inteira. Exportar PNG e Todas usam o formato escolhido, indicado no nome
dos arquivos. Essa opção é independente do formato de outros modelos.

### Contador de páginas

Em **Páginas**, a opção **Mostrar contador de páginas** controla o número no canto
superior direito de todos os slides do carrossel. Vale para o carrossel padrão e
o Mês da Mídia Física, em Feed e Stories, e para exportações PNG e vídeo. A navegação
do editor permanece disponível. A preferência é salva junto ao projeto; por padrão
o contador continua visível.

## Recorte de mockup

No topo do Studio, **Recorte de mockup** abre uma aba independente para PS5 e
Nintendo Switch. Envie PNG/JPG/WebP (até 20 MB), confira a detecção do retângulo
externo e ajuste os quatro cantos arrastando ou pelos campos X/Y. A opção de
proporção frontal usa o formato escolhido sem esticar a imagem. Para caixas em
perspectiva, mantenha-a desmarcada e ajuste os cantos manualmente.

O recorte preserva o branco interno da caixa. Sombras, margens brancas sem borda
visível e fundos complexos podem exigir ajuste manual. Imagens acima de 2400 px
no maior lado são reduzidas para manter o processamento local leve. Baixe o PNG
transparente e envie-o no campo de mockup da arte.
