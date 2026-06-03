/* ============================================================
   GAMER HUT — Creative Studio · Design Tokens & Data
   ============================================================ */

const GH = {
  bg:      '#0B0B0A',
  bg2:     '#141312',
  panel:   '#171513',
  panel2:  '#1F1B18',
  line:    'rgba(232,100,60,0.22)',
  lineSoft:'rgba(244,241,236,0.10)',
  orange:  '#E8643C',
  orangeHi:'#F2774C',
  ink:     '#0B0B0A',
  white:   '#F4F1EC',
  mut:     '#8A8580',
  mut2:    '#5C5854',
};

/* The 8 category tags. Each drives accent color + seal word.
   Extensible: add objects here and the whole app adapts. */
const TAGS = [
  { id:'noticias',   label:'NOTÍCIAS',   seal:'NEWS',   color:'#E3B53E', ink:'#0B0B0A' },
  { id:'pre-venda',  label:'PRÉ-VENDA',  seal:'PRÉ',    color:'#E23B2E', ink:'#F4F1EC' },
  { id:'restoque',   label:'RESTOQUE',   seal:'RESTOCK',color:'#2E9D5B', ink:'#0B0B0A' },
  { id:'lancamento', label:'LANÇAMENTO', seal:'DROP',   color:'#3E78CC', ink:'#F4F1EC' },
  { id:'preview',    label:'PREVIEW',    seal:'PREVIEW',color:'#D6286E', ink:'#F4F1EC' },
  { id:'trailer',    label:'TRAILER',    seal:'TRAILER',color:'#7B3FE4', ink:'#F4F1EC' },
  { id:'review',     label:'REVIEW',     seal:'REVIEW', color:'#2BB1C4', ink:'#0B0B0A' },
  { id:'quiz',       label:'QUIZ',       seal:'QUIZ',   color:'#E8643C', ink:'#0B0B0A' },
];

/* The 4 generation templates */
const TEMPLATES = [
  { id:'carousel', label:'CARROSSEL',      ratio:'4:5', w:1080, h:1350, note:'3–5 páginas sequenciais' },
  { id:'block',    label:'POST BLOCADO',   ratio:'4:5', w:1080, h:1350, note:'Tipografia forte, cor sólida' },
  { id:'image',    label:'POST C/ IMAGEM', ratio:'4:5', w:1080, h:1350, note:'Texto + imagem em destaque' },
  { id:'reels',    label:'CAPA DE REELS',  ratio:'9:16',w:1080, h:1920, note:'Safe zone 4:5 central' },
];

/* Background patterns. Each returns inline-style layers given an accent color. */
const PATTERNS = ['solid','signature','crt','8bit','hud','caution','retro','grid','dpad','checker','chevron','circuit','stars','triangles','vbars'];
const PATTERN_LABELS = {
  solid:'SÓLIDO', signature:'SIGNATURE', crt:'CRT', '8bit':'8-BIT',
  hud:'HUD', caution:'CAUTION', retro:'RETRO', grid:'GRID', dpad:'D-PAD',
  checker:'CHECKER', chevron:'CHEVRON', circuit:'CIRCUITO', stars:'STARS',
  triangles:'TRIÂNGULOS', vbars:'BARRAS'
};

/* HUD corner-bracket tile (simple geometry, tinted via currentColor swap) */
function hudTile(hex){
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 90 90'>`+
    `<g fill='none' stroke='${hex}' stroke-width='3'>`+
    `<path d='M8 8 H22 M8 8 V22'/><path d='M82 8 H68 M82 8 V22'/>`+
    `<path d='M8 82 H22 M8 82 V68'/><path d='M82 82 H68 M82 82 V68'/>`+
    `</g><circle cx='45' cy='45' r='1.6' fill='${hex}'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}
function svgTile(hex, inner, size=80){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'>${inner}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/* Returns a style object for a pattern layer given accent color + base bg */
function patternStyle(kind, accent, base){
  switch(kind){
    case 'signature':
      return {
        background: base,
        WebkitMaskImage:`url(assets/mark-orange.png)`, maskImage:`url(assets/mark-orange.png)`,
        WebkitMaskRepeat:'repeat', maskRepeat:'repeat',
        WebkitMaskSize:'132px', maskSize:'132px',
        backgroundColor: accent, opacity:0.14,
        // accent shows through the mask
      };
    case 'crt':
      return { background:`repeating-linear-gradient(0deg, ${hexA(accent,0.18)} 0 2px, transparent 2px 6px)`, opacity:1 };
    case '8bit':
      return { background:
        `repeating-linear-gradient(0deg, ${hexA(accent,0.16)} 0 1px, transparent 1px 64px),`+
        `repeating-linear-gradient(90deg, ${hexA(accent,0.16)} 0 1px, transparent 1px 64px)` };
    case 'hud':
      return { backgroundImage: hudTile(accent), backgroundSize:'90px 90px', opacity:0.5 };
    case 'caution':
      return { background:`repeating-linear-gradient(-45deg, ${accent} 0 46px, ${base} 46px 92px)`, opacity:1 };
    case 'retro':
      return { backgroundImage:`radial-gradient(${hexA(accent,0.55)} 1.6px, transparent 1.7px)`, backgroundSize:'22px 22px', opacity:0.9 };
    case 'grid':
      return { background:
        `repeating-linear-gradient(0deg, ${hexA(accent,0.20)} 0 1px, transparent 1px 28px),`+
        `repeating-linear-gradient(90deg, ${hexA(accent,0.20)} 0 1px, transparent 1px 28px)` };
    case 'dpad':
      return { backgroundImage: svgTile(accent, `<g fill='${accent}'><path d='M34 26 h12 v8 h8 v12 h-8 v8 h-12 v-8 h-8 v-12 h8 z'/></g>`, 80),
        backgroundSize:'80px 80px', opacity:0.22 };
    case 'checker':
      return { backgroundImage:
        `linear-gradient(45deg, ${hexA(accent,0.16)} 25%, transparent 25%, transparent 75%, ${hexA(accent,0.16)} 75%),`+
        `linear-gradient(45deg, ${hexA(accent,0.16)} 25%, transparent 25%, transparent 75%, ${hexA(accent,0.16)} 75%)`,
        backgroundSize:'72px 72px', backgroundPosition:'0 0, 36px 36px' };
    case 'chevron':
      return { backgroundImage:
        `linear-gradient(135deg, ${hexA(accent,0.18)} 25%, transparent 25%),`+
        `linear-gradient(225deg, ${hexA(accent,0.18)} 25%, transparent 25%),`+
        `linear-gradient(45deg, ${hexA(accent,0.18)} 25%, transparent 25%),`+
        `linear-gradient(315deg, ${hexA(accent,0.18)} 25%, transparent 25%)`,
        backgroundSize:'56px 56px', backgroundPosition:'28px 0, 28px 0, 0 0, 0 0' };
    case 'circuit':
      return { backgroundImage: svgTile(accent,
        `<g fill='none' stroke='${accent}' stroke-width='2'>`+
        `<path d='M0 60 H40 M60 60 H120 M60 0 V40 M60 60 V120'/>`+
        `<circle cx='60' cy='60' r='6' fill='${accent}'/>`+
        `<circle cx='40' cy='60' r='3' fill='${accent}'/><circle cx='60' cy='40' r='3' fill='${accent}'/></g>`, 120),
        backgroundSize:'120px 120px', opacity:0.28 };
    case 'stars':
      return { backgroundImage: svgTile(accent,
        `<g fill='${accent}'><path d='M40 26 l4 10 10 4 -10 4 -4 10 -4 -10 -10 -4 10 -4 z'/></g>`, 80),
        backgroundSize:'80px 80px', opacity:0.30 };
    case 'triangles':
      return { backgroundImage:
        `linear-gradient(60deg, ${hexA(accent,0.16)} 50%, transparent 50%)`,
        backgroundSize:'48px 84px' };
    case 'vbars':
      return { background:`repeating-linear-gradient(90deg, ${hexA(accent,0.16)} 0 8px, transparent 8px 40px)` };
    default:
      return { background: base };
  }
}

function hexA(hex, a){
  const h = hex.replace('#','');
  const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

/* readable text color over a given bg hex */
function readableOn(hex){
  const h=hex.replace('#','');
  const r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
  const L=(0.299*r+0.587*g+0.114*b)/255;
  return L>0.6 ? '#0B0B0A' : '#F4F1EC';
}

/* ink override: 'auto' follows the background, else force black/white.
   Returns { text, logo } where logo is 'black' | 'white' for asset lookup. */
function resolveInk(mode, autoTextHex){
  if(mode==='white') return { text:'#F4F1EC', logo:'white' };
  if(mode==='black') return { text:'#0B0B0A', logo:'black' };
  return { text:autoTextHex, logo: autoTextHex==='#0B0B0A' ? 'black' : 'white' };
}

Object.assign(window, { GH, TAGS, TEMPLATES, PATTERNS, PATTERN_LABELS, patternStyle, hexA, readableOn, resolveInk });
