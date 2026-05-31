/**
 * Catálogo de obra para el rediseño. Reutiliza los datos reales recopilados
 * (scripts/works-data.mjs) y los empareja con las imágenes locales optimizadas
 * (assets/img/obra/<slug>.webp) para servirlas con astro:assets.
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
  meta: string | null;
  image: ImageMetadata;
}

const CAT_LABEL: Record<Cat, string> = {
  digital: 'Arte digital',
  escultura: 'Escultura',
  foto: 'Fotografía',
};

// Importa todas las imágenes locales como ImageMetadata (para astro:assets).
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
  .map((w) => ({
    slug: w.slug,
    title: w.title,
    cat: w.cat,
    catLabel: CAT_LABEL[w.cat],
    tecnica: w.meta || CAT_LABEL[w.cat],
    meta: w.meta,
    image: bySlug.get(w.slug)!,
  }));

export const cats: { value: Cat | 'all'; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'digital', label: 'Arte digital' },
  { value: 'escultura', label: 'Escultura' },
  { value: 'foto', label: 'Fotografía' },
];

export function getObra(slug: string): Obra | undefined {
  return obras.find((o) => o.slug === slug);
}
