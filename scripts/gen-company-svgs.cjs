const si = require('simple-icons');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '../public/images/companies');
fs.mkdirSync(outDir, { recursive: true });

// Simple Icons that exist
const siMap = {
  'wellsfargo': si.siWellsfargo,
};

Object.entries(siMap).forEach(([slug, icon]) => {
  if (!icon) { console.log('MISSING:', slug); return; }
  const svg = `<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><title>${icon.title}</title><path d="${icon.path}"/></svg>`;
  fs.writeFileSync(path.join(outDir, slug + '.svg'), svg);
  console.log('Saved:', slug + '.svg');
});

// Manual SVGs for companies not in simple-icons
// These are clean wordmark-style SVGs using currentColor

const manual = {
  'walgreens': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 48" fill="currentColor">
  <!-- W mark -->
  <path d="M8 12 L14 36 L20 18 L26 36 L32 12 L28 12 L24 28 L20 14 L16 28 L12 12 Z"/>
  <!-- algreens text -->
  <text x="38" y="33" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="-0.5">algreens</text>
</svg>`,

  'kroger': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 48" fill="currentColor">
  <text x="8" y="35" font-family="Georgia, serif" font-size="30" font-weight="700" letter-spacing="1">Kroger</text>
</svg>`,

  'traderjoes': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 190 48" fill="currentColor">
  <text x="8" y="34" font-family="Georgia, serif" font-size="22" font-weight="700" letter-spacing="0.5">Trader Joe's</text>
</svg>`,

  'velvettaco': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 48" fill="currentColor">
  <text x="8" y="34" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="800" letter-spacing="1.5">VELVET TACO</text>
</svg>`,

  'renuity': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 130 48" fill="currentColor">
  <text x="8" y="34" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="-0.5">Renuity</text>
</svg>`,

  'socrates': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 48" fill="currentColor">
  <!-- S mark -->
  <path d="M8 18 C8 14 11 12 16 12 C21 12 24 14 24 18 C24 21 22 23 18 24 L14 25 C10 26 8 28 8 32 C8 36 11 38 16 38 C21 38 24 36 24 32" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <text x="32" y="34" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="600" letter-spacing="0.5">Socrates Platform</text>
</svg>`,

  'intrinio': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 48" fill="currentColor">
  <text x="8" y="34" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="-0.5">intrinio</text>
</svg>`,

  'chipotle': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 155 48" fill="currentColor">
  <text x="8" y="34" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="800" letter-spacing="0.5">CHIPOTLE</text>
</svg>`,
};

Object.entries(manual).forEach(([slug, svg]) => {
  fs.writeFileSync(path.join(outDir, slug + '.svg'), svg);
  console.log('Saved:', slug + '.svg');
});

console.log('\nAll done. Files in:', outDir);
