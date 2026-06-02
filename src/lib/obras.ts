/**
 * Catálogo de obra para el rediseño. Reutiliza los datos reales recopilados
 * (scripts/works-data.mjs) y los empareja con las imágenes locales optimizadas
 * (assets/img/obra/<slug>.webp) para servirlas con astro:assets.
 *
 * Honestidad de datos: solo se rellenan año/dimensiones/edición cuando constan
 * (esculturas y piezas destacadas). En el resto figura "Consultar" — no se
 * inventan medidas ni precios de obra real (Negocio §1, §5).
 */
import type { ImageMetadata } from 'astro';
// @ts-ignore — módulo JS de datos sin tipos
import { allWorks } from '../../scripts/works-data.mjs';
// Colores de acento extraídos automáticamente (scripts/extract-accents.mjs).
import generatedAccents from './accent-colors.generated.json';

export type Cat = 'digital' | 'escultura' | 'foto';

export interface Obra {
  slug: string;
  title: string;
  cat: Cat;
  catLabel: string;
  tecnica: string;
  year: string;
  dims: string;
  edition: string;
  availability: string;
  statement: string | null;
  image: ImageMetadata;
  /** Color de acento (validado) para etiqueta y tinte interno de la obra. */
  accentColor: string;
  /** Variante del acento con saturación reforzada (≥78%) para el glow del hover. */
  accentGlow: string;
  /** Origen del color: "manual" (asignado a mano) | "auto" (extraído). */
  accentColorSource: 'manual' | 'auto';
}

const AUTO_ACCENTS = generatedAccents as Record<string, string>;
const ACCENT_FALLBACK = '#b8905a'; // oro de marca si faltara color

// --- Utilidades de color: derivar un glow más saturado del acento aprobado ---
function hexToRgb(hex: string): [number, number, number] {
  const n = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)) as [number, number, number];
}
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0; const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h /= 6;
  }
  return [h, s, l];
}
function hslToHex(h: number, s: number, l: number): string {
  const hue = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = s === 0 ? l : hue(p, q, h + 1 / 3);
  const g = s === 0 ? l : hue(p, q, h);
  const b = s === 0 ? l : hue(p, q, h - 1 / 3);
  return '#' + [r, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('');
}
/** Acento con saturación reforzada y luminosidad media para que el glow «cante» sobre negro. */
function glowFrom(hex: string): string {
  const [h, s, l] = rgbToHsl(...hexToRgb(hex));
  return hslToHex(h, Math.max(s, 0.78), Math.min(Math.max(l, 0.5), 0.64));
}

/**
 * Overrides manuales de color de acento. Tienen prioridad sobre la extracción
 * automática y se marcan como accentColorSource:"manual". Añade aquí las obras
 * cuyo glow quieras afinar a mano (p. ej. 'identity': '#c79a52').
 * (Validados con el cliente: de momento se usan los automáticos tal cual.)
 */
const MANUAL_ACCENTS: Record<string, string> = {};

function accentFor(slug: string): { accentColor: string; accentGlow: string; accentColorSource: 'manual' | 'auto' } {
  const manual = MANUAL_ACCENTS[slug];
  const accentColor = manual ?? AUTO_ACCENTS[slug] ?? ACCENT_FALLBACK;
  return { accentColor, accentGlow: glowFrom(accentColor), accentColorSource: manual ? 'manual' : 'auto' };
}

const CAT_LABEL: Record<Cat, string> = {
  digital: 'Arte digital',
  escultura: 'Escultura',
  foto: 'Fotografía',
};

/** Datos enriquecidos conocidos por obra. */
const DETAILS: Record<string, Partial<Obra>> = {
  'identity': {
    tecnica: 'Arte digital · impresión de alta resolución',
    edition: 'Edición limitada · consultar',
    statement: 'Obra emblemática de la serie onírica de YOSO: una reflexión sobre la identidad y la singularidad del individuo, pensada en alta resolución para el gran formato.',
  },
  'veritas-and-the-wolf-pack': {
    tecnica: 'Arte digital · impresión de alta resolución',
    edition: 'Edición limitada · consultar',
    statement: 'Imagen surrealista donde lo simbólico y lo onírico exploran la verdad y la mirada del grupo.',
  },
  'dream-of-red-wave-ii': {
    tecnica: 'Arte digital · impresión de alta resolución',
    edition: 'Edición limitada · consultar',
    statement: 'Segunda pieza de la serie «Dream of Red Wave». Una visión fugaz convertida en imagen.',
  },
  'ecos': {
    tecnica: 'Instalación · 108 zapatos rojos, 1 negro, audio',
    year: '2026', dims: 'Escalera de emergencia, 5 tramos', edition: 'Obra única',
    statement: 'Instalación presentada en Hybrid Art Fair 26 (Madrid, Petit Palace Santa Bárbara, 5–8 marzo 2026). Evoca los ecos de las vidas cotidianas que persisten en un espacio común.',
  },
  'soplo-de-vida': {
    tecnica: 'Maniquí CACHAREL (c. 1950), maderas nobles y latón',
    dims: '67 × 175 cm · 13,5 kg', edition: 'Obra única',
    statement: 'Escultura de pared. Maniquí articulado de niño vintage de la marca CACHAREL, fabricado por BERO DESIGN (Italia), integrado en un marco de teca y samba con herrajes de latón.',
  },
  'la-boda': {
    tecnica: 'Escultura', edition: 'Obra única',
    statement: 'Pieza escultórica que prolonga la indagación de YOSO sobre la identidad y el rito desde el volumen y la materia.',
  },
};

const files = import.meta.glob<{ default: ImageMetadata }>(
  '../../assets/img/obra/*.webp',
  { eager: true },
);
const bySlug = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  const slug = path.split('/').pop()!.replace('.webp', '');
  bySlug.set(slug, mod.default);
}

export const obras: Obra[] = (allWorks() as Array<{
  title: string; slug: string; cat: Cat; meta: string | null;
}>)
  .filter((w) => bySlug.has(w.slug))
  .map((w) => {
    const d = DETAILS[w.slug] ?? {};
    return {
      slug: w.slug,
      title: w.title,
      cat: w.cat,
      catLabel: CAT_LABEL[w.cat],
      tecnica: d.tecnica ?? w.meta ?? CAT_LABEL[w.cat],
      year: d.year ?? 'Consultar',
      dims: d.dims ?? 'Consultar',
      edition: d.edition ?? (w.cat === 'escultura' ? 'Obra única' : 'Edición limitada · consultar'),
      availability: d.availability ?? 'Bajo solicitud',
      statement: d.statement ?? null,
      image: bySlug.get(w.slug)!,
      ...accentFor(w.slug),
    };
  });

export const cats: { value: Cat | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'digital', label: 'Arte digital' },
  { value: 'escultura', label: 'Escultura' },
  { value: 'foto', label: 'Fotografía' },
];

export function getObra(slug: string): Obra | undefined {
  return obras.find((o) => o.slug === slug);
}

/** Selección destacada para la home (orden curado). */
const FEATURED = [
  'identity', 'cardinals-dance', 'veritas-and-the-wolf-pack',
  'dream-of-red-wave-ii', 'ecos', 'michelagnolo',
  'your-home-your-land', 'family-portrait-on-sofa',
];
export const featured: Obra[] = FEATURED
  .map((s) => getObra(s))
  .filter((o): o is Obra => Boolean(o));

/** Obra anterior y siguiente (navegación circular dentro del catálogo). */
export function adjacent(slug: string): { prev: Obra; next: Obra } | null {
  const i = obras.findIndex((o) => o.slug === slug);
  if (i < 0) return null;
  const n = obras.length;
  return { prev: obras[(i - 1 + n) % n], next: obras[(i + 1) % n] };
}

/** Hasta `n` obras relacionadas de la misma disciplina (excluye la actual). */
export function related(slug: string, n = 3): Obra[] {
  const o = getObra(slug);
  if (!o) return [];
  return obras.filter((x) => x.cat === o.cat && x.slug !== slug).slice(0, n);
}
