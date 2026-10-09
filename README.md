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

- **Modelo Black Friday** — carrossel sem limite fixo de ofertas (mínimo 1) em 1080×1350. Cada página
  tem arte do jogo ao fundo (com zoom e posição), nome, preço anterior riscado,
  preço promocional em destaque e condição opcional. A cor segue a categoria.
  Selecione o modelo no Studio, preencha os preços e use **Exportar PNG** ou
  **Todas**. Os preços não são consultados automaticamente.

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

## Banner Black Friday desktop

Escolha **BANNER BLACK FRIDAY** no Studio. O PNG tem exatamente **1500 × 435 pixels**.
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
