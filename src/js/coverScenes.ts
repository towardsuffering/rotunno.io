/**
 * Themed cover illustrations. Each scene draws on a 1600x900 canvas, keeps the top-left
 * corner clear for the label, and uses the seeded `rand` for per-post variation.
 */
import type { CoverPalette } from "./coverUtils";

export interface SceneCtx {
  p: CoverPalette;
  rand: () => number;
}

type Scene = (ctx: SceneCtx) => string;

const f = (n: number) => n.toFixed(1);
const between = (rand: () => number, min: number, max: number) => min + rand() * (max - min);

// random walk, used for price lines and series
function walk(rand: () => number, n: number, x0: number, x1: number, y0: number, drift = 0, vol = 50) {
  let y = y0;
  return Array.from({ length: n }, (_, i) => {
    y += (rand() - 0.5) * vol - drift;
    return [x0 + ((x1 - x0) * i) / (n - 1), y] as const;
  });
}
const pathOf = (pts: readonly (readonly [number, number])[]) =>
  pts.map(([x, y], i) => `${i ? "L" : "M"}${f(x)},${f(y)}`).join(" ");

function ground({ p }: SceneCtx, y = 780) {
  return `<line x1="120" y1="${y}" x2="1480" y2="${y}" stroke="${p.ink}" stroke-opacity="0.25" stroke-width="2"/>`;
}

// ---------------------------------------------------------------- policy / tax
const policy: Scene = (ctx) => {
  const { p, rand } = ctx;
  const tilt = between(rand, -9, 9);
  // Capitol
  const cols = Array.from({ length: 12 }, (_, i) =>
    `<rect x="${790 + i * 52}" y="625" width="14" height="115" fill="${p.ink}" fill-opacity="0.35"/>`).join("");
  const drumCols = Array.from({ length: 11 }, (_, i) =>
    `<rect x="${985 + i * 27}" y="482" width="8" height="78" fill="${p.ink}" fill-opacity="0.3"/>`).join("");
  const ribs = [-90, -50, -15, 15, 50, 90].map((dx) =>
    `<path d="M${1130 + dx},478 Q${1130 + dx * 0.55},380 1130,338" fill="none" stroke="${p.bgFrom}" stroke-opacity="0.35" stroke-width="3"/>`).join("");
  const capitol = `
    <rect x="740" y="740" width="780" height="40" fill="${p.accent2}" fill-opacity="0.2"/>
    <rect x="770" y="605" width="720" height="135" fill="${p.accent2}" fill-opacity="0.16" stroke="${p.ink}" stroke-opacity="0.25"/>
    ${cols}
    <polygon points="1030,605 1130,555 1230,605" fill="${p.accent2}" fill-opacity="0.3"/>
    <rect x="970" y="470" width="320" height="92" fill="${p.accent2}" fill-opacity="0.22"/>
    ${drumCols}
    <path d="M985,478 A145,150 0 0 1 1275,478 Z" fill="${p.accent}" fill-opacity="0.9"/>
    ${ribs}
    <rect x="1112" y="300" width="36" height="42" fill="${p.accent}"/>
    <path d="M1108,302 A22,22 0 0 1 1152,302 Z" fill="${p.accent}"/>
    <line x1="1130" y1="280" x2="1130" y2="250" stroke="${p.accent}" stroke-width="5"/>`;
  // balance scale: coins (taxes) vs. people (transfers)
  const cx = 430, cy = 400, half = 190;
  const rad = (tilt * Math.PI) / 180;
  const lx = cx - half * Math.cos(rad), ly = cy - half * Math.sin(rad);
  const rx = cx + half * Math.cos(rad), ry = cy + half * Math.sin(rad);
  const pan = (x: number, y: number) => `
    <line x1="${f(x)}" y1="${f(y)}" x2="${f(x - 70)}" y2="${f(y + 120)}" stroke="${p.ink}" stroke-opacity="0.5" stroke-width="2"/>
    <line x1="${f(x)}" y1="${f(y)}" x2="${f(x + 70)}" y2="${f(y + 120)}" stroke="${p.ink}" stroke-opacity="0.5" stroke-width="2"/>
    <path d="M${f(x - 85)},${f(y + 120)} A85,32 0 0 0 ${f(x + 85)},${f(y + 120)} Z" fill="${p.ink}" fill-opacity="0.6"/>`;
  const coins = Array.from({ length: 5 }, (_, i) =>
    `<ellipse cx="${f(lx)}" cy="${f(ly + 108 - i * 16)}" rx="46" ry="13" fill="${p.accent}" stroke="${p.bgFrom}" stroke-width="2"/>`).join("");
  const people = [-40, 0, 40].map((dx) => `
    <circle cx="${f(rx + dx)}" cy="${f(ry + 62)}" r="13" fill="${p.accent2}"/>
    <path d="M${f(rx + dx - 18)},${f(ry + 112)} Q${f(rx + dx)},${f(ry + 70)} ${f(rx + dx + 18)},${f(ry + 112)} Z" fill="${p.accent2}"/>`).join("");
  const scale = `
    <rect x="${cx - 6}" y="${cy}" width="12" height="380" fill="${p.ink}" fill-opacity="0.55"/>
    <rect x="${cx - 90}" y="770" width="180" height="14" rx="4" fill="${p.ink}" fill-opacity="0.55"/>
    <line x1="${f(lx)}" y1="${f(ly)}" x2="${f(rx)}" y2="${f(ry)}" stroke="${p.ink}" stroke-opacity="0.8" stroke-width="8" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="14" fill="${p.accent}"/>
    ${pan(lx, ly)}${pan(rx, ry)}${coins}${people}`;
  return ground(ctx, 782) + capitol + scale;
};

// ---------------------------------------------------------------- oil
const oil: Scene = (ctx) => {
  const { p, rand } = ctx;
  const pts = walk(rand, 22, 140, 1460, 330, 4, 70);
  const angle = between(rand, -14, 10);
  const pumpjack = `
    <g transform="translate(1030,780)">
      <polygon points="-130,0 0,-260 130,0" fill="none" stroke="${p.ink}" stroke-opacity="0.65" stroke-width="12" stroke-linejoin="round"/>
      <line x1="-70" y1="-130" x2="70" y2="-130" stroke="${p.ink}" stroke-opacity="0.5" stroke-width="8"/>
      <g transform="rotate(${f(angle)} 0 -260)">
        <rect x="-290" y="-278" width="520" height="34" rx="8" fill="${p.accent}"/>
        <path d="M230,-300 Q300,-262 230,-200 L230,-300 Z" fill="${p.accent}"/>
        <line x1="285" y1="-250" x2="285" y2="40" stroke="${p.ink}" stroke-opacity="0.6" stroke-width="4"/>
      </g>
      <circle cx="0" cy="-260" r="16" fill="${p.bgFrom}" stroke="${p.ink}" stroke-width="5"/>
      <circle cx="-230" cy="-70" r="62" fill="none" stroke="${p.ink}" stroke-opacity="0.6" stroke-width="12"/>
      <line x1="-230" y1="-70" x2="-250" y2="-240" stroke="${p.ink}" stroke-opacity="0.6" stroke-width="8"/>
    </g>`;
  const barrel = (x: number, s: number, o: number) => `
    <g transform="translate(${x},780) scale(${s})" fill-opacity="${o}">
      <rect x="-70" y="-200" width="140" height="200" rx="18" fill="${p.accent2}"/>
      <rect x="-74" y="-150" width="148" height="10" fill="${p.bgFrom}" fill-opacity="0.6"/>
      <rect x="-74" y="-62" width="148" height="10" fill="${p.bgFrom}" fill-opacity="0.6"/>
      <path d="M0,-130 C-22,-100 -22,-84 0,-80 C22,-84 22,-100 0,-130 Z" fill="${p.bgFrom}"/>
    </g>`;
  return `
    <path d="${pathOf(pts)}" fill="none" stroke="${p.accent}" stroke-opacity="0.5" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/>
    ${ground(ctx)}${barrel(380, 1, 0.9)}${barrel(540, 0.8, 0.6)}${pumpjack}`;
};

// ---------------------------------------------------------------- gasoline
const gas: Scene = (ctx) => {
  const { p, rand } = ctx;
  const bars = Array.from({ length: 9 }, (_, i) => {
    const h = 60 + i * 38 + rand() * 40;
    return `<rect x="${170 + i * 64}" y="${780 - h}" width="44" height="${f(h)}" rx="4" fill="${i === 8 ? p.accent : p.accent2}" fill-opacity="${i === 8 ? 1 : 0.3}"/>`;
  }).join("");
  const pump = `
    <g transform="translate(1000,780)">
      <rect x="-150" y="-470" width="300" height="470" rx="26" fill="${p.accent2}" fill-opacity="0.9"/>
      <rect x="-110" y="-420" width="220" height="140" rx="12" fill="${p.bgFrom}"/>
      <text x="0" y="-330" text-anchor="middle" font-family="Inter Variable, Inter, sans-serif" font-size="72" font-weight="700" fill="${p.accent}">$</text>
      <path d="M60,-372 l26,-30 l26,30 M86,-400 v50" fill="none" stroke="${p.accent}" stroke-width="8" stroke-linecap="round"/>
      <rect x="-110" y="-240" width="220" height="90" rx="10" fill="${p.bgFrom}" fill-opacity="0.35"/>
      <rect x="-170" y="-20" width="340" height="20" rx="4" fill="${p.ink}" fill-opacity="0.5"/>
      <path d="M150,-330 C260,-330 260,-150 230,-80 L230,-40" fill="none" stroke="${p.ink}" stroke-opacity="0.7" stroke-width="14" stroke-linecap="round"/>
      <path d="M150,-380 h70 v50 h-30 l-10,40 h-30 Z" fill="${p.ink}" fill-opacity="0.7"/>
    </g>`;
  const arrow = `<path d="M170,560 L560,330" stroke="${p.accent}" stroke-width="6" stroke-linecap="round"/><path d="M520,320 L565,327 L548,370" fill="none" stroke="${p.accent}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`;
  return ground(ctx) + bars + arrow + pump;
};

// ---------------------------------------------------------------- central bank / rates
const fed: Scene = (ctx) => {
  const { p, rand } = ctx;
  const cols = Array.from({ length: 8 }, (_, i) =>
    `<rect x="${720 + i * 92}" y="430" width="34" height="290" fill="${p.ink}" fill-opacity="0.28"/>`).join("");
  let y = between(rand, 560, 640);
  const steps: string[] = [];
  for (let i = 0; i < 12; i++) {
    const x = 160 + i * 110;
    const ny = Math.max(260, Math.min(720, y + (rand() - 0.5) * 170));
    steps.push(`${i ? "L" : "M"}${x},${f(y)} L${x + 110},${f(y)} L${x + 110},${f(ny)}`);
    y = ny;
  }
  return `
    <rect x="680" y="720" width="770" height="30" fill="${p.accent2}" fill-opacity="0.25"/>
    <rect x="660" y="750" width="810" height="30" fill="${p.accent2}" fill-opacity="0.18"/>
    <rect x="690" y="395" width="750" height="35" fill="${p.accent2}" fill-opacity="0.3"/>
    <polygon points="680,395 1065,255 1450,395" fill="${p.accent2}" fill-opacity="0.22"/>
    <circle cx="1065" cy="345" r="34" fill="none" stroke="${p.accent}" stroke-width="5"/>
    ${cols}${ground(ctx)}
    <path d="${steps.join(" ")}" fill="none" stroke="${p.accent}" stroke-width="7" stroke-linejoin="round"/>`;
};

// ---------------------------------------------------------------- music business
const music: Scene = (ctx) => {
  const { p, rand } = ctx;
  const grooves = Array.from({ length: 9 }, (_, i) =>
    `<circle cx="1080" cy="470" r="${300 - i * 22}" fill="none" stroke="${p.ink}" stroke-opacity="${0.06 + (i % 3) * 0.04}" stroke-width="2"/>`).join("");
  const wave = Array.from({ length: 40 }, (_, i) => {
    const h = 20 + Math.abs(Math.sin(i * 0.5 + rand() * 2)) * 220 * (0.4 + rand() * 0.6);
    return `<rect x="${140 + i * 15}" y="${f(470 - h / 2)}" width="8" height="${f(h)}" rx="4" fill="${i % 7 === 0 ? p.accent : p.accent2}" fill-opacity="${i % 7 === 0 ? 1 : 0.55}"/>`;
  }).join("");
  return `
    ${wave}
    <circle cx="1080" cy="470" r="320" fill="${p.bgFrom}" stroke="${p.ink}" stroke-opacity="0.2" stroke-width="3"/>
    ${grooves}
    <circle cx="1080" cy="470" r="92" fill="${p.accent}"/>
    <circle cx="1080" cy="470" r="12" fill="${p.bgFrom}"/>
    <path d="M1440,160 L1400,180 L1290,560" fill="none" stroke="${p.ink}" stroke-opacity="0.7" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
    <rect x="1262" y="548" width="56" height="34" rx="6" transform="rotate(-15 1290 565)" fill="${p.ink}" fill-opacity="0.8"/>
    <circle cx="1440" cy="160" r="34" fill="${p.ink}" fill-opacity="0.5"/>`;
};

// ---------------------------------------------------------------- live music
const live: Scene = (ctx) => {
  const { p, rand } = ctx;
  const beams = [380, 800, 1220].map((x, i) =>
    `<polygon points="${x - 20},90 ${x + 20},90 ${x + 170 - i * 60},660 ${x - 170 + i * 30},660" fill="${p.accent}" fill-opacity="${0.1 + i * 0.04}"/>
     <rect x="${x - 34}" y="70" width="68" height="34" rx="8" fill="${p.ink}" fill-opacity="0.6"/>`).join("");
  const crowd = Array.from({ length: 22 }, (_, i) => {
    const x = 120 + i * 66 + rand() * 20, y = 820 + rand() * 30, arm = rand() > 0.75;
    return `<circle cx="${f(x)}" cy="${f(y - 70)}" r="26" fill="${p.bgFrom}"/>
      <path d="M${f(x - 42)},${f(y + 40)} Q${f(x)},${f(y - 60)} ${f(x + 42)},${f(y + 40)} Z" fill="${p.bgFrom}"/>
      ${arm ? `<line x1="${f(x + 20)}" y1="${f(y - 30)}" x2="${f(x + 40)}" y2="${f(y - 150)}" stroke="${p.bgFrom}" stroke-width="16" stroke-linecap="round"/>` : ""}`;
  }).join("");
  return `
    <rect x="200" y="660" width="1200" height="40" fill="${p.accent2}" fill-opacity="0.35"/>
    ${beams}
    <line x1="800" y1="660" x2="800" y2="470" stroke="${p.ink}" stroke-opacity="0.8" stroke-width="8"/>
    <line x1="800" y1="480" x2="850" y2="420" stroke="${p.ink}" stroke-opacity="0.8" stroke-width="8"/>
    <rect x="840" y="388" width="34" height="56" rx="16" transform="rotate(40 857 416)" fill="${p.accent}"/>
    <line x1="760" y1="660" x2="840" y2="660" stroke="${p.ink}" stroke-width="8"/>
    ${crowd}`;
};

// ---------------------------------------------------------------- decision tree
const tree: Scene = (ctx) => {
  const { p, rand } = ctx;
  const nodes: string[] = [];
  const edges: string[] = [];
  const draw = (x: number, y: number, depth: number, spread: number) => {
    if (depth === 3) {
      const cls = rand() > 0.5;
      nodes.push(`<rect x="${f(x - 34)}" y="${f(y - 26)}" width="68" height="52" rx="10" fill="${cls ? p.accent : p.accent2}" fill-opacity="${cls ? 1 : 0.6}"/>`);
      return;
    }
    nodes.push(`<circle cx="${f(x)}" cy="${f(y)}" r="${30 - depth * 4}" fill="${p.bgFrom}" stroke="${p.ink}" stroke-opacity="0.7" stroke-width="5"/>`);
    for (const dir of [-1, 1]) {
      const nx = x + dir * spread, ny = y + 175;
      edges.push(`<line x1="${f(x)}" y1="${f(y)}" x2="${f(nx)}" y2="${f(ny)}" stroke="${p.ink}" stroke-opacity="0.35" stroke-width="4"/>`);
      draw(nx, ny, depth + 1, spread / 2);
    }
  };
  draw(950, 230, 0, 330);
  const gini = walk(rand, 10, 160, 460, 600, 18, 20);
  return `${edges.join("")}${nodes.join("")}
    <path d="${pathOf(gini)}" fill="none" stroke="${p.accent}" stroke-width="5"/>
    <line x1="160" y1="720" x2="460" y2="720" stroke="${p.ink}" stroke-opacity="0.3" stroke-width="2"/>`;
};

// ---------------------------------------------------------------- hyperparameter search
const searchAxes = ({ p }: SceneCtx) => `
  <line x1="560" y1="790" x2="1460" y2="790" stroke="${p.ink}" stroke-opacity="0.4" stroke-width="3"/>
  <line x1="560" y1="790" x2="560" y2="140" stroke="${p.ink}" stroke-opacity="0.4" stroke-width="3"/>`;
const gridSearch: Scene = (ctx) => {
  const { p, rand } = ctx;
  const bx = Math.floor(rand() * 7), by = Math.floor(rand() * 5);
  const cells = Array.from({ length: 35 }, (_, i) => {
    const x = i % 7, y = Math.floor(i / 7);
    const score = 1 - Math.hypot(x - bx, y - by) / 8;
    const best = x === bx && y === by;
    return `<rect x="${600 + x * 122}" y="${180 + y * 118}" width="108" height="104" rx="8" fill="${best ? p.accent : p.accent2}" fill-opacity="${best ? 1 : f(Math.max(0.06, score * 0.55))}"/>`;
  }).join("");
  return searchAxes(ctx) + cells + `
    <circle cx="${654 + bx * 122}" cy="${232 + by * 118}" r="78" fill="none" stroke="${p.accent}" stroke-width="5" stroke-dasharray="10 10"/>
    <rect x="170" y="300" width="260" height="380" rx="16" fill="none" stroke="${p.ink}" stroke-opacity="0.3" stroke-width="3"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="200" y="${340 + i * 82}" width="${120 + ((i * 47) % 80)}" height="20" rx="10" fill="${p.accent2}" fill-opacity="0.5"/>`).join("")}`;
};
const randomSearch: Scene = (ctx) => {
  const { p, rand } = ctx;
  const pts = Array.from({ length: 34 }, () => [between(rand, 610, 1420), between(rand, 180, 750)] as const);
  const best = pts[Math.floor(rand() * pts.length)];
  return searchAxes(ctx) + `
    <ellipse cx="${f(best[0])}" cy="${f(best[1])}" rx="260" ry="180" fill="${p.accent}" fill-opacity="0.08"/>
    <ellipse cx="${f(best[0])}" cy="${f(best[1])}" rx="150" ry="100" fill="${p.accent}" fill-opacity="0.1"/>
    ${pts.map(([x, y]) => `<circle cx="${f(x)}" cy="${f(y)}" r="11" fill="${p.accent2}" fill-opacity="0.75"/>`).join("")}
    <circle cx="${f(best[0])}" cy="${f(best[1])}" r="18" fill="${p.accent}"/>
    <circle cx="${f(best[0])}" cy="${f(best[1])}" r="40" fill="none" stroke="${p.accent}" stroke-width="4"/>
    <g transform="translate(300,520)" fill="none" stroke="${p.ink}" stroke-opacity="0.6" stroke-width="10">
      <rect x="-110" y="-110" width="220" height="220" rx="30"/>
      <circle cx="-50" cy="-50" r="14" fill="${p.ink}"/><circle cx="50" cy="50" r="14" fill="${p.ink}"/>
      <circle cx="50" cy="-50" r="14" fill="${p.ink}"/><circle cx="-50" cy="50" r="14" fill="${p.ink}"/>
    </g>`;
};

// ---------------------------------------------------------------- regularization (lasso vs ridge)
const regularization: Scene = (ctx) => {
  const { p, rand } = ctx;
  const cx = 860, cy = 520, r = 170;
  const ex = cx + between(rand, 240, 340), ey = cy - between(rand, 200, 260);
  const contours = [80, 150, 230, 320].map((s) =>
    `<ellipse cx="${f(ex)}" cy="${f(ey)}" rx="${s * 1.4}" ry="${s * 0.75}" transform="rotate(-25 ${f(ex)} ${f(ey)})" fill="none" stroke="${p.accent}" stroke-opacity="${0.9 - s / 450}" stroke-width="4"/>`).join("");
  return `
    <line x1="460" y1="${cy}" x2="1460" y2="${cy}" stroke="${p.ink}" stroke-opacity="0.35" stroke-width="3"/>
    <line x1="${cx}" y1="840" x2="${cx}" y2="110" stroke="${p.ink}" stroke-opacity="0.35" stroke-width="3"/>
    <polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${p.accent2}" fill-opacity="0.35" stroke="${p.accent2}" stroke-width="4"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${p.ink}" stroke-opacity="0.7" stroke-width="4" stroke-dasharray="12 10"/>
    ${contours}
    <circle cx="${cx}" cy="${cy - r}" r="14" fill="${p.accent}"/>
    <text x="250" y="470" font-family="Inter Variable, Inter, sans-serif" font-size="70" font-weight="700" fill="${p.accent2}" fill-opacity="0.8">L1</text>
    <text x="250" y="580" font-family="Inter Variable, Inter, sans-serif" font-size="70" font-weight="700" fill="${p.ink}" fill-opacity="0.6">L2</text>`;
};

// ---------------------------------------------------------------- regression vs classification
const regClass: Scene = (ctx) => {
  const { p, rand } = ctx;
  const reg = Array.from({ length: 18 }, (_, i) => {
    const x = 170 + i * 30 + rand() * 20, y = 720 - (x - 170) * 0.75 + (rand() - 0.5) * 120;
    return `<circle cx="${f(x)}" cy="${f(y)}" r="10" fill="${p.accent2}"/>`;
  }).join("");
  const cls = Array.from({ length: 30 }, (_, i) => {
    const a = i % 2 === 0;
    const x = a ? between(rand, 880, 1140) : between(rand, 1180, 1440);
    const y = a ? between(rand, 380, 760) : between(rand, 200, 600);
    return a
      ? `<circle cx="${f(x)}" cy="${f(y)}" r="11" fill="${p.accent}"/>`
      : `<rect x="${f(x - 10)}" y="${f(y - 10)}" width="20" height="20" fill="${p.accent2}"/>`;
  }).join("");
  return `
    <rect x="130" y="150" width="620" height="660" rx="20" fill="${p.ink}" fill-opacity="0.04"/>
    <rect x="850" y="150" width="620" height="660" rx="20" fill="${p.ink}" fill-opacity="0.04"/>
    ${reg}<line x1="160" y1="740" x2="720" y2="300" stroke="${p.accent}" stroke-width="6" stroke-linecap="round"/>
    ${cls}<path d="M1060,170 C1180,380 1150,560 1300,790" fill="none" stroke="${p.ink}" stroke-opacity="0.7" stroke-width="5" stroke-dasharray="14 10"/>`;
};

// ---------------------------------------------------------------- interaction effects
const interaction: Scene = (ctx) => {
  const { p, rand } = ctx;
  const a1 = between(rand, 620, 700), a2 = between(rand, 260, 320);
  const b1 = between(rand, 300, 360), b2 = between(rand, 600, 680);
  const pt = (x: number, y: number, c: string) => `<circle cx="${x}" cy="${f(y)}" r="16" fill="${c}"/>`;
  return `
    <line x1="420" y1="790" x2="1400" y2="790" stroke="${p.ink}" stroke-opacity="0.4" stroke-width="3"/>
    <line x1="420" y1="790" x2="420" y2="170" stroke="${p.ink}" stroke-opacity="0.4" stroke-width="3"/>
    <line x1="560" y1="${f(a1)}" x2="1260" y2="${f(a2)}" stroke="${p.accent}" stroke-width="7"/>
    <line x1="560" y1="${f(b1)}" x2="1260" y2="${f(b2)}" stroke="${p.accent2}" stroke-width="7"/>
    ${pt(560, a1, p.accent)}${pt(1260, a2, p.accent)}${pt(560, b1, p.accent2)}${pt(1260, b2, p.accent2)}
    <circle cx="910" cy="${f((a1 + a2 + b1 + b2) / 4)}" r="46" fill="none" stroke="${p.ink}" stroke-opacity="0.6" stroke-width="4" stroke-dasharray="8 8"/>`;
};

// ---------------------------------------------------------------- distributions / simulation
const distribution: Scene = (ctx) => {
  const { p, rand } = ctx;
  const mu = between(rand, 760, 900);
  const bars = Array.from({ length: 26 }, (_, i) => {
    const x = 300 + i * 40;
    const h = 480 * Math.exp(-(((x - mu) / 200) ** 2)) * (0.85 + rand() * 0.3) + 8;
    const tail = x < mu - 330 || x > mu + 330;
    return `<rect x="${x}" y="${f(780 - h)}" width="32" height="${f(h)}" rx="3" fill="${tail ? p.accent : p.accent2}" fill-opacity="${tail ? 0.95 : 0.45}"/>`;
  }).join("");
  const curve = Array.from({ length: 60 }, (_, i) => {
    const x = 280 + i * 18;
    return [x, 780 - 480 * Math.exp(-(((x - mu) / 200) ** 2))] as const;
  });
  return `${ground(ctx)}${bars}
    <path d="${pathOf(curve)}" fill="none" stroke="${p.ink}" stroke-opacity="0.85" stroke-width="5"/>
    <line x1="${f(mu - 330)}" y1="200" x2="${f(mu - 330)}" y2="780" stroke="${p.accent}" stroke-width="3" stroke-dasharray="10 10"/>
    <line x1="${f(mu + 330)}" y1="200" x2="${f(mu + 330)}" y2="780" stroke="${p.accent}" stroke-width="3" stroke-dasharray="10 10"/>`;
};

// ---------------------------------------------------------------- coin flip
const coin: Scene = (ctx) => {
  const { p, rand } = ctx;
  const flips = Array.from({ length: 24 }, () => (rand() > 0.5 ? 1 : 0));
  let heads = 0;
  const run = flips.map((h, i) => {
    heads += h;
    return [180 + i * 22, 640 - (heads / (i + 1) - 0.5) * 360] as const;
  });
  return `
    <line x1="170" y1="640" x2="720" y2="640" stroke="${p.ink}" stroke-opacity="0.3" stroke-width="2" stroke-dasharray="8 8"/>
    <path d="${pathOf(run)}" fill="none" stroke="${p.accent2}" stroke-width="5"/>
    <g transform="translate(1060,470)">
      <ellipse cx="22" cy="18" rx="250" ry="250" fill="${p.bgFrom}" fill-opacity="0.6"/>
      <circle r="250" fill="${p.accent}"/>
      <circle r="205" fill="none" stroke="${p.bgFrom}" stroke-opacity="0.45" stroke-width="6"/>
      <text y="70" text-anchor="middle" font-family="Inter Variable, Inter, sans-serif" font-size="210" font-weight="800" fill="${p.bgFrom}" fill-opacity="0.7">H</text>
    </g>
    <g transform="translate(1380,230) rotate(-30)">
      <ellipse rx="110" ry="34" fill="${p.accent2}"/><ellipse cy="-8" rx="110" ry="34" fill="${p.accent}" fill-opacity="0.8"/>
    </g>`;
};

// ---------------------------------------------------------------- iris flower
const iris: Scene = (ctx) => {
  const { p, rand } = ctx;
  const petals = [0, 120, 240].map((a) =>
    `<ellipse cx="0" cy="-130" rx="70" ry="140" transform="rotate(${a + 10})" fill="${p.accent}" fill-opacity="0.85"/>`).join("");
  const sepals = [60, 180, 300].map((a) =>
    `<ellipse cx="0" cy="-150" rx="58" ry="170" transform="rotate(${a})" fill="${p.accent2}" fill-opacity="0.55"/>`).join("");
  const cluster = (cx: number, cy: number, c: string, shape: "c" | "s" | "d") =>
    Array.from({ length: 12 }, () => {
      const x = cx + (rand() - 0.5) * 140, y = cy + (rand() - 0.5) * 110;
      if (shape === "c") return `<circle cx="${f(x)}" cy="${f(y)}" r="9" fill="${c}"/>`;
      if (shape === "s") return `<rect x="${f(x - 8)}" y="${f(y - 8)}" width="16" height="16" fill="${c}"/>`;
      return `<rect x="${f(x - 8)}" y="${f(y - 8)}" width="16" height="16" transform="rotate(45 ${f(x)} ${f(y)})" fill="${c}"/>`;
    }).join("");
  return `
    <line x1="180" y1="780" x2="700" y2="780" stroke="${p.ink}" stroke-opacity="0.35" stroke-width="2"/>
    <line x1="180" y1="780" x2="180" y2="300" stroke="${p.ink}" stroke-opacity="0.35" stroke-width="2"/>
    ${cluster(290, 690, p.accent2, "c")}${cluster(460, 540, p.accent, "s")}${cluster(590, 400, p.ink, "d")}
    <path d="M1080,520 C1060,680 1100,760 1070,880" fill="none" stroke="${p.accent2}" stroke-width="12"/>
    <g transform="translate(1080,440)">${sepals}${petals}<circle r="34" fill="${p.ink}" fill-opacity="0.8"/></g>`;
};

// ---------------------------------------------------------------- titanic
const ship: Scene = (ctx) => {
  const { p, rand } = ctx;
  const waves = Array.from({ length: 4 }, (_, i) => {
    const y = 700 + i * 45;
    let d = `M100,${y}`;
    for (let x = 100; x < 1500; x += 80) d += ` q40,${f(-12 - rand() * 6)} 80,0`;
    return `<path d="${d}" fill="none" stroke="${p.accent2}" stroke-opacity="${0.5 - i * 0.1}" stroke-width="3"/>`;
  }).join("");
  const funnels = [0, 1, 2, 3].map((i) =>
    `<rect x="${640 + i * 120}" y="400" width="62" height="150" transform="skewX(-8)" fill="${p.accent}"/><rect x="${640 + i * 120}" y="400" width="62" height="26" transform="skewX(-8)" fill="${p.bgFrom}" fill-opacity="0.6"/>`).join("");
  const portholes = Array.from({ length: 20 }, (_, i) => `<circle cx="${400 + i * 46}" cy="610" r="7" fill="${p.accent}" fill-opacity="0.7"/>`).join("");
  return `
    <polygon points="1270,700 1360,420 1420,500 1470,700" fill="${p.ink}" fill-opacity="0.85"/>
    <polygon points="1360,420 1395,700 1270,700" fill="${p.accent2}" fill-opacity="0.35"/>
    ${funnels}
    <rect x="420" y="540" width="760" height="40" fill="${p.ink}" fill-opacity="0.8"/>
    <path d="M300,580 L1240,580 L1190,700 L360,700 Z" fill="${p.ink}" fill-opacity="0.95"/>
    <rect x="300" y="580" width="940" height="14" fill="${p.accent2}" fill-opacity="0.5"/>
    ${portholes}${waves}`;
};

// ---------------------------------------------------------------- food / orders
const bowl: Scene = (ctx) => {
  const { p, rand } = ctx;
  const toppings = Array.from({ length: 40 }, () => {
    const a = rand() * Math.PI, r = rand() * 270;
    const x = 1050 + Math.cos(a) * r, y = 470 - Math.sin(a) * r * 0.25;
    const c = [p.accent, p.accent2, p.ink][Math.floor(rand() * 3)];
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(14 + rand() * 18)}" fill="${c}" fill-opacity="0.85"/>`;
  }).join("");
  const lines = Array.from({ length: 8 }, (_, i) =>
    `<rect x="250" y="${300 + i * 50}" width="${f(120 + rand() * 120)}" height="14" rx="7" fill="${p.bgFrom}" fill-opacity="0.5"/><rect x="${470}" y="${300 + i * 50}" width="50" height="14" rx="7" fill="${p.bgFrom}" fill-opacity="0.5"/>`).join("");
  return `
    <path d="M200,220 h360 v540 l-30,20 l-30,-20 l-30,20 l-30,-20 l-30,20 l-30,-20 l-30,20 l-30,-20 l-30,20 l-30,-20 l-30,20 l-30,-20 Z" fill="${p.accent2}" fill-opacity="0.8"/>
    ${lines}
    <ellipse cx="1050" cy="470" rx="320" ry="80" fill="${p.bgFrom}"/>
    ${toppings}
    <path d="M730,470 A320,300 0 0 0 1370,470 Z" fill="${p.accent2}" fill-opacity="0.9"/>
    <rect x="930" y="760" width="240" height="22" rx="10" fill="${p.accent2}" fill-opacity="0.9"/>`;
};

// ---------------------------------------------------------------- retail / grocery
const retail: Scene = (ctx) => {
  const { p, rand } = ctx;
  const barcode = Array.from({ length: 34 }, (_, i) => {
    const w = 3 + Math.floor(rand() * 3) * 4;
    return `<rect x="${200 + i * 13}" y="300" width="${w}" height="240" fill="${p.ink}" fill-opacity="0.7"/>`;
  }).join("");
  const items = Array.from({ length: 5 }, (_, i) =>
    `<rect x="${880 + i * 82}" y="${f(330 - rand() * 90)}" width="66" height="${f(150 + rand() * 60)}" rx="8" fill="${i % 2 ? p.accent2 : p.accent}" fill-opacity="0.85"/>`).join("");
  const grid = Array.from({ length: 4 }, (_, i) =>
    `<line x1="${900 + i * 120}" y1="460" x2="${930 + i * 110}" y2="640" stroke="${p.ink}" stroke-opacity="0.4" stroke-width="5"/>`).join("");
  return `${ground(ctx)}
    <rect x="180" y="270" width="480" height="300" rx="20" fill="none" stroke="${p.ink}" stroke-opacity="0.25" stroke-width="3"/>
    ${barcode}
    <rect x="180" y="600" width="480" height="40" rx="10" fill="${p.accent}" fill-opacity="0.85"/>
    ${items}
    <path d="M740,340 L820,340 L880,460 L1400,460 L1350,640 L930,640 Z" fill="${p.bgFrom}" fill-opacity="0.6" stroke="${p.ink}" stroke-opacity="0.8" stroke-width="12" stroke-linejoin="round"/>
    ${grid}
    <line x1="930" y1="640" x2="960" y2="700" stroke="${p.ink}" stroke-opacity="0.8" stroke-width="10"/>
    <circle cx="990" cy="740" r="34" fill="${p.ink}" fill-opacity="0.85"/><circle cx="1290" cy="740" r="34" fill="${p.ink}" fill-opacity="0.85"/>`;
};

// ---------------------------------------------------------------- leadership
const leadership: Scene = (ctx) => {
  const { p, rand } = ctx;
  const steps = Array.from({ length: 6 }, (_, i) =>
    `<rect x="${360 + i * 150}" y="${780 - (i + 1) * 80}" width="150" height="${(i + 1) * 80}" fill="${p.accent2}" fill-opacity="${0.15 + i * 0.08}"/>`).join("");
  const tx = 1260, ty = 300;
  const followers = [0, 1, 2].map((i) => {
    const x = 470 + i * 150 + rand() * 20, y = 780 - (i + 1) * 80;
    return `<circle cx="${f(x)}" cy="${f(y - 60)}" r="18" fill="${p.ink}" fill-opacity="0.55"/><path d="M${f(x - 24)},${y} Q${f(x)},${f(y - 60)} ${f(x + 24)},${y} Z" fill="${p.ink}" fill-opacity="0.55"/>`;
  }).join("");
  return `${ground(ctx)}${steps}${followers}
    <circle cx="${tx - 60}" cy="${ty + 80}" r="26" fill="${p.accent}"/>
    <path d="M${tx - 94},${ty + 180} Q${tx - 60},${ty + 90} ${tx - 26},${ty + 180} Z" fill="${p.accent}"/>
    <line x1="${tx}" y1="${ty + 180}" x2="${tx}" y2="${ty - 80}" stroke="${p.ink}" stroke-opacity="0.8" stroke-width="7"/>
    <path d="M${tx},${ty - 80} L${tx + 130},${ty - 45} L${tx},${ty - 10} Z" fill="${p.accent}"/>`;
};

// ---------------------------------------------------------------- ghost (busting problems)
const ghost: Scene = (ctx) => {
  const { p, rand } = ctx;
  const gx = 1050 + rand() * 80, gy = 430;
  let beam = `M240,700`;
  for (let i = 1; i <= 12; i++) beam += ` L${f(240 + i * ((gx - 300) / 12))},${f(700 - i * ((700 - gy) / 12) + (rand() - 0.5) * 80)}`;
  return `
    <path d="${beam}" fill="none" stroke="${p.accent}" stroke-width="10" stroke-linejoin="round" stroke-opacity="0.9"/>
    <path d="${beam}" fill="none" stroke="${p.ink}" stroke-width="3" stroke-linejoin="round"/>
    <rect x="160" y="680" width="150" height="60" rx="14" fill="${p.ink}" fill-opacity="0.7"/>
    <g transform="translate(${f(gx)},${gy})">
      <path d="M-170,250 L-170,-40 A170,170 0 0 1 170,-40 L170,250 l-56,-50 l-57,50 l-57,-50 l-57,50 l-57,-50 Z" fill="${p.accent2}" fill-opacity="0.92"/>
      <ellipse cx="-58" cy="-30" rx="26" ry="38" fill="${p.bgFrom}"/>
      <ellipse cx="58" cy="-30" rx="26" ry="38" fill="${p.bgFrom}"/>
      <ellipse cx="0" cy="70" rx="34" ry="40" fill="${p.bgFrom}"/>
    </g>`;
};

// ---------------------------------------------------------------- hiring / documents
const documentCheck: Scene = (ctx) => {
  const { p, rand } = ctx;
  const lines = Array.from({ length: 5 }, (_, i) =>
    `<rect x="760" y="${380 + i * 54}" width="${f(240 + rand() * 260)}" height="18" rx="9" fill="${p.ink}" fill-opacity="0.3"/>`).join("");
  return `
    <rect x="300" y="230" width="460" height="560" rx="18" fill="${p.accent2}" fill-opacity="0.2" transform="rotate(-6 530 510)"/>
    <rect x="460" y="250" width="860" height="520" rx="28" fill="${p.bgFrom}" stroke="${p.ink}" stroke-opacity="0.3" stroke-width="4"/>
    <rect x="460" y="250" width="860" height="80" rx="28" fill="${p.accent2}" fill-opacity="0.5"/>
    <circle cx="610" cy="470" r="90" fill="${p.accent2}" fill-opacity="0.55"/>
    <path d="M520,640 Q610,520 700,640 Z" fill="${p.accent2}" fill-opacity="0.55"/>
    ${lines}
    <circle cx="1290" cy="730" r="110" fill="${p.accent}"/>
    <path d="M1235,730 L1275,770 L1350,690" fill="none" stroke="${p.bgFrom}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>`;
};

// ---------------------------------------------------------------- process cycle (CRISP-DM)
const cycle: Scene = (ctx) => {
  const { p } = ctx;
  const cx = 1000, cy = 460, r = 300;
  const n = 6;
  const nodes = Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 - Math.PI / 2;
    return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const;
  });
  const arcs = nodes.map((_, i) => {
    const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 + 0.2, a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - 0.2;
    const [x0, y0] = [cx + Math.cos(a0) * r, cy + Math.sin(a0) * r];
    const [x1, y1] = [cx + Math.cos(a1) * r, cy + Math.sin(a1) * r];
    return `<path d="M${f(x0)},${f(y0)} A${r},${r} 0 0 1 ${f(x1)},${f(y1)}" fill="none" stroke="${p.ink}" stroke-opacity="0.45" stroke-width="5" marker-end="url(#arrow)"/>`;
  }).join("");
  return `
    <defs><marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="${p.ink}" fill-opacity="0.6"/></marker></defs>
    ${arcs}
    ${nodes.map(([x, y], i) => `<circle cx="${f(x)}" cy="${f(y)}" r="52" fill="${i === 0 ? p.accent : p.accent2}" fill-opacity="${i === 0 ? 1 : 0.7}"/>`).join("")}
    <ellipse cx="${cx}" cy="${cy - 70}" rx="90" ry="28" fill="${p.accent}"/>
    <path d="M${cx - 90},${cy - 70} v140 a90,28 0 0 0 180,0 v-140" fill="${p.accent}" fill-opacity="0.75"/>
    <path d="M${cx - 90},${cy - 20} a90,28 0 0 0 180,0 M${cx - 90},${cy + 25} a90,28 0 0 0 180,0" fill="none" stroke="${p.bgFrom}" stroke-opacity="0.5" stroke-width="4"/>`;
};

// ---------------------------------------------------------------- arts / creativity
const art: Scene = (ctx) => {
  const { p, rand } = ctx;
  const dots = Array.from({ length: 6 }, (_, i) => {
    const a = -2.6 + i * 0.5, x = 1040 + Math.cos(a) * 210, y = 480 + Math.sin(a) * 150;
    const c = [p.accent, p.accent2, p.ink][i % 3];
    return `<circle cx="${f(x)}" cy="${f(y)}" r="${f(36 + rand() * 12)}" fill="${c}" fill-opacity="0.9"/>`;
  }).join("");
  const sy = between(rand, 300, 420);
  return `
    <path d="M140,${f(sy + 260)} C380,${f(sy + 80)} 560,${f(sy + 340)} 800,${f(sy + 120)}" fill="none" stroke="${p.accent}" stroke-width="54" stroke-linecap="round" stroke-opacity="0.85"/>
    <path d="M770,520 C770,320 1000,250 1180,300 C1380,355 1400,560 1260,640 C1180,690 1150,610 1080,640 C980,690 1000,760 900,750 C820,742 770,650 770,520 Z" fill="${p.accent2}" fill-opacity="0.3" stroke="${p.ink}" stroke-opacity="0.35" stroke-width="4"/>
    <ellipse cx="930" cy="610" rx="38" ry="30" fill="${p.bgFrom}"/>
    ${dots}
    <g transform="rotate(-38 1330 260)"><rect x="1300" y="60" width="26" height="320" rx="10" fill="${p.ink}" fill-opacity="0.7"/><path d="M1296,380 h34 l-6,70 q-11,20 -22,0 Z" fill="${p.accent}"/></g>`;
};

// ---------------------------------------------------------------- generic machine learning
const ml: Scene = (ctx) => {
  const { p, rand } = ctx;
  const layers = [3, 5, 5, 2];
  const pos = layers.map((n, li) =>
    Array.from({ length: n }, (_, i) => [620 + li * 250, 470 + (i - (n - 1) / 2) * 120] as const));
  const edges = pos.slice(0, -1).flatMap((layer, li) =>
    layer.flatMap(([x0, y0]) => pos[li + 1].map(([x1, y1]) =>
      `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="${rand() > 0.75 ? p.accent : p.accent2}" stroke-opacity="${f(0.15 + rand() * 0.45)}" stroke-width="3"/>`))).join("");
  const nodes = pos.flatMap((layer, li) => layer.map(([x, y]) =>
    `<circle cx="${x}" cy="${y}" r="30" fill="${li === 3 ? p.accent : p.bgFrom}" stroke="${p.ink}" stroke-opacity="0.7" stroke-width="5"/>`)).join("");
  const scatter = Array.from({ length: 16 }, () =>
    `<circle cx="${f(between(rand, 170, 460))}" cy="${f(between(rand, 330, 640))}" r="9" fill="${p.accent2}" fill-opacity="0.8"/>`).join("");
  return scatter + `<path d="M470,480 L560,480" stroke="${p.ink}" stroke-opacity="0.5" stroke-width="5"/>` + edges + nodes;
};

export const scenes = {
  policy, oil, gas, fed, music, live, tree, gridSearch, randomSearch, regularization,
  regClass, interaction, distribution, coin, iris, ship, bowl, retail, leadership,
  ghost, documentCheck, cycle, art, ml,
} satisfies Record<string, Scene>;

export type CoverTheme = keyof typeof scenes;
