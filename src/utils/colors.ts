// ═══════════════════════════════════════════════════════════════
// 🎨 UTILITAIRES DE COULEUR
// Génère une palette complète (50→900) à partir d'une couleur de base
// ═══════════════════════════════════════════════════════════════

export function hexToHSL(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return [140, 55, 30];

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = ln - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * Math.max(0, Math.min(1, color)))
      .toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/**
 * Génère 10 nuances (50→900) à partir d'une couleur hex de base.
 * Conserve la teinte (hue) et la saturation, fait varier la luminosité.
 */
export function generateShades(baseHex: string): Record<string, string> {
  const [h, s] = hexToHSL(baseHex);
  const sat = Math.max(s, 25); // minimum saturation pour que ça reste coloré

  const lightnessMap: Record<string, number> = {
    '50':  96,
    '100': 91,
    '200': 80,
    '300': 66,
    '400': 52,
    '500': 42,
    '600': 34,
    '700': 27,
    '800': 21,
    '900': 14,
  };

  const shades: Record<string, string> = {};
  for (const [shade, lightness] of Object.entries(lightnessMap)) {
    shades[shade] = hslToHex(h, sat, lightness);
  }
  return shades;
}

/**
 * Calcule la couleur de texte (blanc ou noir) optimale
 * pour être lisible sur un fond donné.
 */
export function getContrastText(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return '#ffffff';

  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);

  // Luminance relative (WCAG)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#1a1a1a' : '#ffffff';
}

// ═══════════════════════════════════════════════════════════════
// 🎨 PRÉCONFIGURATIONS DE THÈMES
// ═══════════════════════════════════════════════════════════════

export interface ColorPreset {
  name: string;
  emoji: string;
  primary: string;
  accent: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { name: 'STTDM',     emoji: '🌍', primary: '#37C2C7', accent: '#EFC0A8' },
  { name: 'Forêt',     emoji: '🌳', primary: '#3d8325', accent: '#d97706' },
  { name: 'Océan',     emoji: '🌊', primary: '#0369a1', accent: '#0891b2' },
  { name: 'Cerisier',  emoji: '🌸', primary: '#be185d', accent: '#e11d48' },
  { name: 'Automne',   emoji: '🍂', primary: '#c2410c', accent: '#b45309' },
  { name: 'Lavande',   emoji: '💜', primary: '#7c3aed', accent: '#9333ea' },
  { name: 'Émeraude',  emoji: '💎', primary: '#047857', accent: '#0d9488' },
  { name: 'Bordeaux',  emoji: '🍷', primary: '#881337', accent: '#be123c' },
];
