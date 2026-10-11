/**
 * Deterministic placeholder cover art for blog posts.
 *
 * Every post gets an illustration of its subject (detected from slug, title and tags) with a
 * seeded palette and variation, so covers are stable between builds and never identical.
 * A real `heroImage` always takes priority.
 */

import type { CoverTheme } from "./coverScenes";

export interface CoverPalette {
  bgFrom: string;
  bgTo: string;
  accent: string;
  accent2: string;
  ink: string;
}

// muted, editorial palettes (think financial press, not startup landing page)
const palettes: CoverPalette[] = [
  { bgFrom: "#0b1324", bgTo: "#1b2b4b", accent: "#d4af37", accent2: "#8fa3c7", ink: "#e8edf6" }, // navy + gold
  { bgFrom: "#0f1f1a", bgTo: "#1d3b31", accent: "#7fd1ae", accent2: "#c9e4d6", ink: "#e9f4ee" }, // forest
  { bgFrom: "#1c1210", bgTo: "#3a221b", accent: "#e39b6b", accent2: "#f1cfb4", ink: "#f7ebe2" }, // oxblood + copper
  { bgFrom: "#101418", bgTo: "#232b33", accent: "#4fb3ff", accent2: "#9fb4c7", ink: "#e6edf3" }, // graphite + blue
  { bgFrom: "#16112a", bgTo: "#2c2350", accent: "#b69cff", accent2: "#e2d8ff", ink: "#efeaff" }, // ink violet
  { bgFrom: "#f3efe6", bgTo: "#e4dccb", accent: "#9b2d20", accent2: "#3b4a5a", ink: "#1d232b" }, // newsprint
  { bgFrom: "#0d1b1e", bgTo: "#16343a", accent: "#f2c14e", accent2: "#5fb7c2", ink: "#e7f2f3" }, // teal + amber
  { bgFrom: "#eef2f6", bgTo: "#d7e0ea", accent: "#1f4e8c", accent2: "#c0563b", ink: "#14202e" }, // paper blue
];

// subject detection: first match against slug + title + tags wins
const themeRules: [CoverTheme, RegExp][] = [
  ["policy", /\btax|midterm|election|fiscal|tariff|congress/],
  ["gas", /gas[- ]price|gasoline/],
  ["oil", /\boil\b|crude|opec/],
  ["fed", /federal reserve|\bfed\b|interest rate/],
  ["live", /live music|concert|touring/],
  ["music", /music|chartmetric|royalt/],
  ["ship", /titanic/],
  ["iris", /\biris\b/],
  ["coin", /coin/],
  ["bowl", /chipotle|restaurant/],
  ["retail", /kroger|retail|grocery/],
  ["ghost", /ghost/],
  ["documentCheck", /\bi-9\b|hiring/],
  ["leadership", /leadership|emotional intelligence/],
  ["cycle", /crisp-dm/],
  ["tree", /entropy|gini|decision tree|random forest/],
  ["gridSearch", /grid search/],
  ["randomSearch", /randomi[sz]ed search|random search/],
  ["regularization", /lasso|ridge|regulari/],
  ["regClass", /classification/],
  ["interaction", /interaction|main effect|anova/],
  ["distribution", /winsoriz|histogram|simulation|sequence|random number/],
  ["art", /\barts?\b|creativ|artistic/],
  ["ml", /./],
];

const themeLabels: Record<CoverTheme, string> = {
  policy: "Tax & Policy", oil: "Oil & Macro", gas: "Energy Prices", fed: "Monetary Policy",
  music: "Music Business", live: "Live Music", tree: "Decision Trees", gridSearch: "Model Tuning",
  randomSearch: "Model Tuning", regularization: "Regularization", regClass: "Machine Learning",
  interaction: "Statistics", distribution: "Statistics in R", coin: "Probability", iris: "Data Analysis in R",
  ship: "Machine Learning", bowl: "Consumer Data", retail: "Retail Analytics", leadership: "Leadership",
  ghost: "Business", documentCheck: "Hiring & Compliance", cycle: "Analytics Process", art: "Creative Economy",
  ml: "Machine Learning",
};

// palettes that suit each subject (indexes into `palettes`); the seed picks one
const themePalettes: Partial<Record<CoverTheme, number[]>> = {
  policy: [0, 5, 7], oil: [2, 3, 6], gas: [6, 2], fed: [1, 0, 5], music: [4, 2, 0], live: [4, 3],
  ship: [0, 7], bowl: [2, 5], retail: [1, 7], leadership: [0, 1], ghost: [1, 4], documentCheck: [7, 5],
  art: [4, 5], coin: [0, 5],
};

export function detectTheme(text: string): CoverTheme {
  const haystack = text.toLowerCase();
  return themeRules.find(([, re]) => re.test(haystack))![0];
}

// FNV-1a 32-bit hash
export function hashString(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// mulberry32 seeded PRNG, returns floats in [0, 1)
export function seededRandom(seed: number): () => number {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function getCoverSpec(id: string, subject: string, themeOverride?: string) {
  const seed = hashString(id);
  const theme = (themeOverride && themeOverride in themeLabels ? themeOverride : detectTheme(subject)) as CoverTheme;
  const options = themePalettes[theme] ?? [3, 6, 7, 1, 0];
  const palette = palettes[options[seed % options.length]];
  return { seed, palette, theme, label: themeLabels[theme], rand: seededRandom(seed) };
}
