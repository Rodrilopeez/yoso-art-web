/**
 * Extrae un color de acento representativo de cada obra (assets/img/obra/*.webp)
 * para usarlo como «glow» sobre fondo negro en la galería estilo Refik.
 *
 * No usamos el color DOMINANTE a secas: muchas obras de YOSO son B/N o muy
 * claras/oscuras y su dominante es gris (sin tono), lo que forzaría un color
 * inventado. En su lugar:
 *   1) Muestreamos la imagen (80px) y buscamos los píxeles más CROMÁTICOS.
 *   2) Promediamos (ponderado por saturación) → color representativo real.
 *   3) Ajustamos saturación/luminosidad para que luzca sobre negro.
 *   4) Si la obra es esencialmente acromática (B/N), usamos el oro de marca.
 *
 * Escribe src/lib/accent-colors.generated.json con { slug: "#hex" }.
 * Son la BASE automática (accentColorSource:"auto"); los overrides manuales
 * viven en obras.ts (MANUAL_ACCENTS).
 *
 * Uso:  node scripts/extract-accents.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const SRC = 'assets/img/obra';
const OUT = 'src/lib/accent-colors.generated.json';
const BRAND_GOLD = '#b8905a'; // fallback coherente para obra acromática (B/N)

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}
function hslToRgb(h, s, l) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}
const toHex = (r, g, b) => '#' + [r, g, b].map((n) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0')).join('');

/** Ajuste final para glow sobre negro: saturación viva y luminosidad media. */
function glowAdjust(r, g, b) {
  let [h, s, l] = rgbToHsl(r, g, b);
  s = Math.min(Math.max(s, 0.58), 0.85);
  l = Math.min(Math.max(l, 0.50), 0.66);
  return toHex(...hslToRgb(h, s, l));
}

async function accentFor(file) {
  const W = 80;
  const { data, info } = await sharp(file).resize(W, W, { fit: 'cover' }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const ch = info.channels; // 3
  let chromatic = [];
  for (let i = 0; i < data.length; i += ch) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const [h, s, l] = rgbToHsl(r, g, b);
    // Píxeles con color real (no gris) y ni quemados ni en sombra absoluta.
    if (s > 0.22 && l > 0.12 && l < 0.9) chromatic.push({ r, g, b, s });
  }
  const total = (data.length / ch);
  // Acromática (B/N o muy neutra): < 4% de píxeles con color → oro de marca.
  if (chromatic.length < total * 0.04) {
    return { accent: BRAND_GOLD, mode: 'acromática→oro' };
  }
  // Promedio ponderado por saturación de los píxeles más cromáticos.
  chromatic.sort((a, b) => b.s - a.s);
  const top = chromatic.slice(0, Math.max(40, Math.floor(chromatic.length * 0.25)));
  let R = 0, G = 0, B = 0, wsum = 0;
  for (const p of top) { const w = p.s * p.s; R += p.r * w; G += p.g * w; B += p.b * w; wsum += w; }
  R /= wsum; G /= wsum; B /= wsum;
  return { accent: glowAdjust(R, G, B), mode: 'cromática' };
}

const files = fs.readdirSync(SRC).filter((f) => /\.webp$/i.test(f)).sort();
const out = {};
const rows = [];
for (const f of files) {
  const slug = f.replace(/\.webp$/i, '');
  const { accent, mode } = await accentFor(path.join(SRC, f));
  out[slug] = accent;
  rows.push({ slug, accent, mode });
}

fs.writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`Escrito ${OUT} (${rows.length} obras)\n`);
console.log('slug'.padEnd(34), 'glow', '    modo');
for (const r of rows) console.log(r.slug.padEnd(34), r.accent, ' ', r.mode);
