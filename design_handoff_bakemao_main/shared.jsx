// Shared data + primitives for the three BakeMao redesigns.
// Aesthetic matches the "small fat mao" logo: soft pastel bg, chocolate-brown outlines,
// big sparkles, plump rounded shapes.

const QUICK_QTY = [1, 2, 4, 6, 12, 24, 48, 100];

const FAKE_STATE = {
  qty: 6,
  groups: [
    {
      name: '法式磅蛋糕',
      mode: 'percent',
      target: 'mold',
      moldType: 'round',
      cakeType: 'pound',
      moldSize: 6,
      moldHeight: 6,
      moldWhip: '奶油打發',
      moldDesc: '奶油加糖打發至蓬鬆泛白，麵糊濃稠，進爐後適度膨脹。',
      moldExamples: '磅蛋糕、瑪德蓮、費南雪',
      moldTotal: 464.95,
      moldBatter: 465,
      perUnit: 225,
      qty: 6,
      ingredients: [
        { name: '中筋麵粉', brand: '',       pct: 100, g: 774.9 },
        { name: '無鹽奶油', brand: '總統牌', pct: 100, g: 774.9 },
        { name: '細砂糖',   brand: '台糖',   pct: 80,  g: 619.9 },
        { name: '全蛋',     brand: '',       pct: 80,  g: 619.9 },
      ],
      totalPct: 360,
      totalG: 2789.7,
    },
  ],
  summary: [
    { name: '中筋麵粉', brand: '', g: 774.9 },
    { name: '全蛋',     brand: '', g: 619.9 },
    { name: '細砂糖',   brand: '台糖', g: 619.9 },
    { name: '無鹽奶油', brand: '總統牌', g: 774.9 },
  ],
  summaryKg: 2.79,
  summaryCount: 4,
};

const ROUND_SIZES = [4, 5, 6, 7, 8, 9, 10, 12];
const CAKE_TYPES = [
  { v: 'mousse',  l: '慕斯類' },
  { v: 'pound',   l: '磅蛋糕' },
  { v: 'sponge',  l: '海綿蛋糕' },
  { v: 'chiffon', l: '戚風蛋糕' },
  { v: 'custom',  l: '自訂' },
];

// The real logo image (896×1195, sticker style).
// Use this instead of a hand-drawn Mimi.
function MaoLogo({ size = 44 }) {
  return (
    <img
      src="assets/maologo.png"
      alt="BakeMao"
      width={size}
      height={size}
      style={{ objectFit: 'contain', display: 'block', flexShrink: 0 }}
    />
  );
}

// Sparkle — 4-point star, matches logo's sparkle motif.
function Sparkle({ size = 14, color = '#6BA3D6', style }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      <path d="M12 0 L13.5 9 L22 12 L13.5 15 L12 24 L10.5 15 L2 12 L10.5 9 Z" fill={color} />
    </svg>
  );
}

// Small paw print
function PawPrint({ size = 14, color = '#6B4A2F', opacity = 1 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ opacity }}>
      <ellipse cx="12" cy="15" rx="5" ry="4.5" fill={color} />
      <ellipse cx="5"  cy="9"  rx="2.2" ry="2.8" fill={color} />
      <ellipse cx="10" cy="6"  rx="2.2" ry="2.8" fill={color} />
      <ellipse cx="14" cy="6"  rx="2.2" ry="2.8" fill={color} />
      <ellipse cx="19" cy="9"  rx="2.2" ry="2.8" fill={color} />
    </svg>
  );
}

const ICONS = {
  camera: (c = 'currentColor') => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  ),
  plus: (c = 'currentColor', w = 14) => (
    <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  minus: (c = 'currentColor', w = 14) => (
    <svg width={w} height={w} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  chevron: (c = 'currentColor') => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  close: (c = 'currentColor') => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.4" strokeLinecap="round">
      <line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>
    </svg>
  ),
  question: (c = 'currentColor') => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

Object.assign(window, { MaoLogo, Sparkle, PawPrint, ICONS, QUICK_QTY, FAKE_STATE, ROUND_SIZES, CAKE_TYPES });
