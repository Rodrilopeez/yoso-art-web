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
