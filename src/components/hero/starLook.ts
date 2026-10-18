// How a constellation star looks, from a stable per-star random value `h` (0-1):
// real stars vary in color temperature, the brightest show diffraction spikes,
// and each one scintillates on its own rhythm.

// mostly blue-white, some hot blue, a few warm gold and orange (picked independently of brightness)
const TEMPS = ["#e6f1ff", "#e6f1ff", "#e6f1ff", "#d4e4ff", "#c9dcff", "#fff1d6", "#ffe0b8"];

export function starLook(h: number, green = false) {
  const color = green ? (h > 0.7 ? "#ecfdf5" : "#a7f3d0") : TEMPS[Math.min(TEMPS.length - 1, Math.floor(((h * 13.37) % 1) * TEMPS.length))];
  const bright = h > 0.72; // the brightest quarter
  return {
    color,
    glow: green ? "#34d399" : color,
    core: (green ? 1.05 : 0.75) + h * 0.9, // the star itself
    halo: 2.2 + h * 2.2, // tight inner glow
    bloom: 5.5 + h * 4.5, // wide, faint outer glow
    spike: bright ? 4.5 + h * 4 : 0, // diffraction spike half-length, 0 for none
    twinkle: `${(2.4 + ((h * 7.3) % 1) * 2.6).toFixed(2)}s`, // scintillation period
  };
}

// a stable "random" value per position, so every build draws the same sky
export function starHash(x: number, y: number) {
  const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return v - Math.floor(v);
}
