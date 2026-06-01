---
name: sanity-art-cms-skill
description: >-
  Esquemas de Sanity Studio, queries GROQ e integración con Astro para que el
  artista YOSO suba obra solo en yoso-art-web. Úsala SIEMPRE que la tarea toque
  el CMS, el modelado de documentos, las imágenes del CDN o las consultas de
  datos. Triggers: "Sanity", "CMS", "Studio", "esquema", "schema de obra",
  "documento", "GROQ", "query", "consulta", "subir obra", "panel del artista",
  "ficha técnica editable", "imágenes de obra", "CDN de Sanity", "hotspot",
  "image builder", "urlFor", "WebP", "AVIF", "transformación de imagen",
  "portable text", "disponibilidad", "edición", "borrador/preview". También al
  conectar Astro con datos externos o reemplazar lib/obras.ts por el CMS.
  Prepara un backend de contenido para que el artista sea autónomo.
---

# Sanity Art CMS — Backend de contenido para el artista

Cómo dar a YOSO un panel donde suba obra, series y exposiciones **solo**, sin
tocar código, y servirlo en Astro estático con imágenes optimizadas desde el CDN
de Sanity. El objetivo: que la web siga siendo rápida y el artista, autónomo.

**Regla fundamental: el esquema de Sanity debe mapear 1:1 al modelo `Obra` que ya
existe** en [src/lib/obras.ts](../../../src/lib/obras.ts) y a lo que el JSON-LD
necesita (`art-portfolio-architecture-skill`). No diseñes campos nuevos sin
correspondencia: si hoy hay `tecnica`, `dims`, `edition`, `availability`,
`statement`, esos son los campos del documento. Migrar = cambiar la **fuente** de
los datos, no el contrato.

---

## Cuándo activarte

- Crear/editar esquemas de Sanity, queries GROQ, o la integración Astro↔Sanity.
- Configurar el CDN de imágenes (transformaciones, formatos), hotspot, o el flujo de subida del artista.
- Reemplazar el origen estático (`lib/obras.ts` + `scripts/works-data.mjs`) por el CMS.

Si es el *modelo conceptual / URLs / SEO* → `art-portfolio-architecture-skill`.
Esta skill es el *almacenamiento y la entrega de datos*.

---

## Estado actual (de dónde partimos)

- Sanity **no está instalado** todavía (no figura en `package.json`).
- Los datos viven en `scripts/works-data.mjs` + enriquecimiento en `lib/obras.ts`, con imágenes locales en `assets/img/obra/*.webp` servidas por `astro:assets`.
- Output **estático** (`astro.config.mjs`): el fetch a Sanity ocurre **en build** (SSG), no en runtime. Re-deploy al publicar = webhook de Sanity → Vercel.

Plan de adopción: instalar Sanity, modelar los documentos espejo del modelo
actual, migrar los datos, y sustituir `obras.ts` por queries GROQ manteniendo la
**misma interfaz `Obra`** para no tocar las páginas.

---

## Instalación

```bash
npm create sanity@latest -- --template clean --create-project "YOSO Art" --dataset production
npm install @sanity/client @sanity/image-url
# Studio embebido o repo aparte; para empezar, carpeta /studio dentro del repo.
```
`.env` (no commitear): `SANITY_PROJECT_ID`, `SANITY_DATASET=production`,
`SANITY_API_VERSION=2024-10-01`, y un token de solo-lectura para build.

---

## Esquemas de Studio (espejo del modelo real)

### `obra` — el documento central
```ts
// studio/schemas/obra.ts
import { defineType, defineField } from 'sanity';
export default defineType({
  name: 'obra', title: 'Obra', type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Título', type: 'string', validation: r => r.required() }),
    defineField({ name: 'slug', title: 'Slug (URL)', type: 'slug',
      options: { source: 'title', maxLength: 96 }, validation: r => r.required() }),
    defineField({ name: 'cat', title: 'Disciplina', type: 'string',
      options: { list: [
        { title: 'Arte digital', value: 'digital' },
        { title: 'Escultura', value: 'escultura' },
        { title: 'Fotografía', value: 'foto' },
      ], layout: 'radio' }, validation: r => r.required() }),
    // Imágenes: hero + detalles + vista en sala (briefing)
    defineField({ name: 'hero', title: 'Imagen principal', type: 'image',
      options: { hotspot: true }, validation: r => r.required(),
      fields: [{ name: 'alt', type: 'string', title: 'Texto alternativo' }] }),
    defineField({ name: 'gallery', title: 'Detalles / vista en sala', type: 'array',
      of: [{ type: 'image', options: { hotspot: true },
        fields: [{ name: 'alt', type: 'string', title: 'Texto alternativo' }] }] }),
    // Ficha técnica (= campos de obras.ts). Vacío => la web mostrará "Consultar".
    defineField({ name: 'tecnica', title: 'Técnica', type: 'string' }),
    defineField({ name: 'dims', title: 'Dimensiones', type: 'string' }),
    defineField({ name: 'year', title: 'Año', type: 'string' }),
    defineField({ name: 'edition', title: 'Edición', type: 'string' }),
    defineField({ name: 'availability', title: 'Disponibilidad', type: 'string',
      initialValue: 'Bajo solicitud' }),
    defineField({ name: 'price', title: 'Precio (solo si es público)', type: 'number',
      description: 'Déjalo vacío si es bajo solicitud. Solo se usa para Schema Product si hay precio.' }),
    defineField({ name: 'statement', title: 'Statement', type: 'text', rows: 4 }),
    defineField({ name: 'serie', title: 'Serie', type: 'reference', to: [{ type: 'serie' }] }),
    defineField({ name: 'featured', title: 'Destacar en home', type: 'boolean', initialValue: false }),
    defineField({ name: 'order', title: 'Orden', type: 'number' }),
  ],
  preview: { select: { title: 'title', subtitle: 'cat', media: 'hero' } },
});
```

### `serie` — narrativa que agrupa obras
```ts
fields: [ title, slug,
  { name: 'narrativa', type: 'array', of: [{ type: 'block' }] },   // Portable Text
  { name: 'cover', type: 'image', options: { hotspot: true } } ]
// Las obras referencian la serie (no al revés): la lista de obras se resuelve por GROQ.
```

### `exposicion` — `Event` con lugar y fechas
```ts
fields: [ title, slug,
  { name: 'lugar', type: 'string' }, { name: 'ciudad', type: 'string' },
  { name: 'startDate', type: 'date' }, { name: 'endDate', type: 'date' },
  { name: 'descripcion', type: 'array', of: [{ type: 'block' }] },
  { name: 'obras', type: 'array', of: [{ type: 'reference', to: [{ type: 'obra' }] }] } ]
```

Validaciones útiles: `slug` requerido y único; `endDate >= startDate`; `alt` en
imágenes (accesibilidad y SEO). Pon `initialValue` en `availability` para guiar
al artista.

---

## Queries GROQ (optimizadas para Astro/SSG)

Pide **solo los campos que usas** y resuelve referencias en la misma query
(evita N+1). Proyecta el slug plano para comodidad.

```ts
// src/lib/sanity.ts
import { createClient } from '@sanity/client';
export const sanity = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET,
  apiVersion: '2024-10-01',
  useCdn: true,            // build: CDN cacheado = más rápido y barato
});

export const OBRAS_QUERY = `*[_type == "obra"] | order(order asc, _createdAt desc){
  "slug": slug.current, title, cat,
  tecnica, dims, year, edition, availability, price, statement, featured,
  "serie": serie->{ "slug": slug.current, title },
  hero, "heroAlt": hero.alt,
  "gallery": gallery[]{ ..., "alt": alt }
}`;

export const OBRA_BY_SLUG = `*[_type == "obra" && slug.current == $slug][0]{ … }`;  // mismos campos
```

Mantén una capa adaptadora que devuelva el **mismo tipo `Obra`** que hoy, para no
tocar las páginas:
```ts
// reemplazo de obras.ts, misma interfaz pública
export const obras: Obra[] = (await sanity.fetch(OBRAS_QUERY)).map(mapObra);
// mapObra rellena "Consultar"/"Obra única" igual que hoy cuando un campo viene vacío.
```
`getStaticPaths` de `obras/[slug].astro` sigue igual: itera `obras`.

---

## Imágenes: CDN de Sanity + astro:assets

Dos formas de servir la obra; elige según el caso:

1. **CDN de Sanity con transformaciones** (recomendado para obra subida por el artista): el CDN entrega WebP/AVIF y redimensiona on-the-fly.
```ts
// src/lib/img.ts
import imageUrlBuilder from '@sanity/image-url';
import { sanity } from './sanity';
const builder = imageUrlBuilder(sanity);
export const urlFor = (src: any) => builder.image(src).auto('format').fit('max').quality(80);
// uso: urlFor(obra.hero).width(1200).url()  -> WebP/AVIF automático según navegador
```
```astro
<img
  src={urlFor(obra.hero).width(1200).url()}
  srcset={[600,900,1200,1800].map(w => `${urlFor(obra.hero).width(w).url()} ${w}w`).join(', ')}
  sizes="(max-width: 900px) 100vw, 58vw"
  width={1200} height={1500} alt={obra.heroAlt ?? obra.title} loading="lazy" decoding="async" />
```
   - `.auto('format')` = AVIF/WebP según `Accept` del navegador. No fuerces un único formato.
   - Respeta el **hotspot**: usa `.fit('crop')` + el focal point para recortes cuadrados de tarjeta.

2. **`astro:assets`** (mejor para imágenes que están en el repo en build): pásalas por `<Image>` como hoy. Para imágenes remotas de Sanity, autoriza el dominio en `astro.config.mjs`:
```js
image: { domains: ['cdn.sanity.io'] }
```
   Con `<Image src={urlFor(...).url()} ... inferSize />` Astro puede optimizarlas en build, pero suele ser redundante con el CDN: para obra del CMS, deja que el CDN de Sanity haga el trabajo y usa astro:assets solo para assets locales.

**Para el shader WebGL** (`webgl-displacement-skill`): pásale `urlFor(obra.hero).width(2000).url()` y recuerda `img.crossOrigin='anonymous'` (el CDN de Sanity manda CORS correcto) para no tener un canvas "tainted".

---

## Flujo del artista (autonomía real)

1. Entra al Studio (`/studio` o subdominio), crea un documento **Obra**, sube `hero`, rellena lo que sepa (lo demás queda vacío → "Consultar").
2. Marca `featured` para la home; ordena con `order`.
3. Publica → webhook a Vercel → rebuild → la obra aparece en `yoso.art`.
4. **Preview opcional**: para que vea borradores antes de publicar, configura draft mode (requiere `output: 'server'`/SSR en una ruta de preview, o `useCdn:false` + token en un entorno de preview). De entrada, SSG + publish basta.

---

## Errores comunes a evitar

1. **Romper la interfaz `Obra`** al migrar → habría que tocar todas las páginas. Mapea GROQ → mismo tipo y mantén los fallbacks ("Consultar", "Obra única").
2. **`useCdn: false` en build sin necesidad** → más lento y consume API. En SSG usa `useCdn: true`; solo `false` para preview de borradores.
3. **N+1 de referencias** → resuelve `serie->{…}` y `obras[]->{…}` dentro de la misma GROQ, no con fetches por obra.
4. **Servir la imagen original** (varios MB) → usa `urlFor(...).width(n)` siempre; nunca el asset crudo del CDN.
5. **Forzar un solo formato** → usa `.auto('format')` (AVIF/WebP por navegador).
6. **Ignorar el hotspot** → recortes de tarjeta con la cara cortada. Usa hotspot + `fit('crop')`.
7. **Sin `alt`** → inaccesible y peor SEO. Campo `alt` obligatorio por imagen.
8. **Token de escritura en el cliente** → fuga de seguridad. En SSG el token es de solo-lectura y vive en build (`.env`, no commiteado), nunca en el bundle.
9. **Precio en `Product` cuando es "Bajo solicitud"** → ver `art-portfolio-architecture-skill`: `price` solo alimenta Schema si es público.
10. **No autorizar `cdn.sanity.io`** en `astro.config.mjs` si usas `<Image>` con remotas → build falla.

---

## Integración con el resto del stack

- **Arquitectura** (`art-portfolio-architecture-skill`): los documentos `obra`/`serie`/`exposicion` son las entidades de allí; sus campos alimentan el JSON-LD (técnica, dims, fechas, lugar). Diséñalos en paralelo.
- **astro:assets / WebGL / GSAP**: la imagen del CMS es la única fuente por obra; el mismo `urlFor(...).url()` alimenta `<img>`, el OG y el shader. Una sola verdad.
- **Tipografía** (`editorial-typography-skill`): el Portable Text (`statement`, narrativa de serie) se renderiza con `.lead`/cuerpo del sistema, no con estilos del CMS.
- **View Transitions** (`astro-view-transitions-skill`): el `slug` de Sanity es la URL y el `transition:name`; valídalo único en el esquema.
