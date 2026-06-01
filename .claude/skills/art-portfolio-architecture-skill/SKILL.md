---
name: art-portfolio-architecture-skill
description: >-
  Arquitectura de contenido, URLs, datos estructurados y compartibilidad para la
  web de artista yoso-art-web. Úsala SIEMPRE que la tarea defina entidades
  (obra, serie, exposición, proyecto, prensa), rutas/slugs, Schema.org/JSON-LD,
  Open Graph, Twitter Card o sitemap. Triggers: "arquitectura", "modelo de
  contenido", "entidades", "obra", "serie", "exposición", "proyecto", "prensa",
  "URLs", "slug", "rutas", "Schema.org", "JSON-LD", "datos estructurados",
  "VisualArtwork", "VisualArtist", "Person", "Event", "Product", "Open Graph",
  "OG image", "Twitter Card", "compartir en Instagram", "sitemap", "canonical",
  "SEO de obra", "rich results". También al crear páginas o getStaticPaths.
  Convierte yoso.art en un portfolio de artista bien estructurado y compartible.
---

# Art Portfolio Architecture — Estructura, URLs y datos estructurados

Cómo modelar yoso-art-web como un portfolio de artista coherente: entidades
claras (obra, serie, exposición, proyecto, prensa), URLs limpias y estables,
Schema.org completo para rich results, y Open Graph optimizado para que cada
obra se comparta bien en Instagram y X. Astro estático, output a `https://yoso.art`.

**Regla fundamental: la honestidad de datos manda sobre el SEO.** El proyecto ya
fija (ver [src/lib/obras.ts](../../../src/lib/obras.ts)) que no se inventan
medidas, años ni precios; cuando un dato no consta se pone "Consultar" y se
**omite** del JSON-LD. Un Schema.org con datos falsos es peor que uno parcial:
Google penaliza y el artista pierde credibilidad. Marca solo lo que es verdad.

---

## Cuándo activarte

- Definir/cambiar una entidad de contenido, una ruta o un slug.
- Añadir o ajustar JSON-LD, Open Graph, Twitter Card o el sitemap.
- Crear una página nueva o un `getStaticPaths`.

Si es el **esquema del CMS** (campos en Sanity Studio, GROQ) → `sanity-art-cms-skill`.
Esta skill define el *modelo conceptual y su exposición en HTML/SEO*; la otra, su *almacenamiento*.

---

## Las entidades del portfolio

| Entidad | Qué es | Estado actual | Ruta |
|---|---|---|---|
| **Obra** (`VisualArtwork`) | pieza individual | ✅ modelada en `obras.ts` (`Obra`) | `/obras/[slug]` |
| **Serie** | conjunto narrativo de obras | página existe ([series.astro](../../../src/pages/series.astro)), sin detalle | `/series/[slug]` (a crear) |
| **Exposición** (`Event`) | muestra con lugar y fechas | página existe ([exposiciones.astro](../../../src/pages/exposiciones.astro)) | `/exposiciones/[slug]` (a crear) |
| **Proyecto** | trabajo/instalación (p. ej. «Ecos») | hoy es una obra; puede promoverse | `/proyectos/[slug]` (futuro) |
| **Prensa** | menciones, premios, ferias | hoy en el Marquee | `/prensa` (a crear) |
| **Artista** (`Person`/`VisualArtist`) | YOSO | [sobre.astro](../../../src/pages/sobre.astro) / [estudio.astro](../../../src/pages/estudio.astro) | `/sobre` |

Relaciones: una **obra** pertenece a 0–1 **serie** y puede haber estado en N
**exposiciones**; una **serie** agrupa N obras; una **exposición** lista N obras.
Modela estas relaciones por `slug` (referencias), no duplicando datos.

---

## Esquema de URLs (limpias, estables, en plural)

```
/                         home
/obras                    catálogo (filtrable por disciplina)
/obras/[slug]             ficha de obra        ← ya existe
/series                   índice de series
/series/[slug]            serie con su narrativa y obras
/exposiciones            índice de exposiciones
/exposiciones/[slug]      exposición (lugar, fechas, obras)
/sobre                    bio del artista (Person/VisualArtist)
/estudio                  el estudio / proceso
/prensa                   menciones y premios
/diario                   notas / blog
/contacto                 contacto y encargos
```
Reglas de slug:
- **kebab-case, sin acentos ni ñ**, derivado del título. `obras.ts` ya usa slugs así (`veritas-and-the-wolf-pack`, `soplo-de-vida`).
- **Estables para siempre**: el slug es la URL pública y el `transition:name` de View Transitions. Si hay que cambiarlo, añade un redirect (`vercel.json` ya existe para reglas).
- Plural en las colecciones (`/obras`, `/series`), singular implícito en el detalle por slug.
- Un `getStaticPaths` por colección, alimentado desde `lib/` (patrón de `obras/[slug].astro`).

---

## Schema.org / JSON-LD por tipo

La ficha de obra **ya** emite `VisualArtwork` (ver `obras/[slug].astro`). Mantén
ese patrón y replícalo por entidad. Inyecta el JSON-LD con
`<script type="application/ld+json" set:html={JSON.stringify(jsonld)} />`.

### Artista — `Person` + `VisualArtist` (en `/sobre`, y como `creator` en cada obra)
```ts
const artist = {
  '@context': 'https://schema.org', '@type': ['Person', 'VisualArtist'],
  name: 'YOSO', alternateName: 'Ambrosio López González',
  url: 'https://yoso.art/', jobTitle: 'Artista visual',
  sameAs: ['https://www.instagram.com/yoso_arts/'],   // solo perfiles reales
};
```

### Obra — `VisualArtwork` (+ `Product` solo si hay venta declarada)
```ts
const artwork = {
  '@context': 'https://schema.org', '@type': 'VisualArtwork',
  name: obra.title, url: new URL(`/obras/${obra.slug}`, Astro.site).href,
  image: new URL(obra.image.src, Astro.site).href,
  artform: obra.catLabel, artMedium: obra.tecnica,
  creator: { '@type': 'Person', name: 'YOSO', url: 'https://yoso.art/' },
  ...(obra.statement ? { description: obra.statement } : {}),
  // Solo si CONSTA — nada inventado:
  ...(obra.dims !== 'Consultar' ? { width: obra.dims } : {}),
  ...(obra.year !== 'Consultar' ? { dateCreated: obra.year } : {}),
};
// Product SOLO si la obra se vende con precio público. Si es "Bajo solicitud",
// NO uses Product/Offer (Google exige price; un offer sin precio es spam).
```

### Exposición — `Event` / `ExhibitionEvent`
```ts
const expo = {
  '@context': 'https://schema.org', '@type': 'ExhibitionEvent',
  name: 'Ecos — Hybrid Art Fair 26',
  startDate: '2026-03-05', endDate: '2026-03-08',
  location: { '@type': 'Place', name: 'Petit Palace Santa Bárbara',
    address: { '@type': 'PostalAddress', addressLocality: 'Madrid', addressCountry: 'ES' } },
  organizer: { '@type': 'Person', name: 'YOSO' },
  eventStatus: 'https://schema.org/EventScheduled',
};
```

### Home — `WebSite` (+ `SearchAction` si hubiera buscador)
Añade `WebSite` con `publisher` = el `Person` YOSO.

Regla transversal: usa `Astro.site` para URLs **absolutas** en JSON-LD y OG
(Google y los scrapers sociales las exigen absolutas).

---

## Open Graph y Twitter Card (compartibilidad real)

`Base.astro` ya emite OG/Twitter base (title, description, url, `og:image`,
`summary_large_image`, `@yoso_arts`). Mejoras para que **cada obra** se vea bien
al compartir en Instagram (link sticker) y X:

1. **`og:image` por obra**: hoy la ficha pasa `image={obra.image.src}` — bien,
   pero conviene una imagen social de **1200×630** dedicada (la obra suele ser
   4:5/3:4 y se recorta fea). Genera un OG compuesto (obra + nombre) por obra:
   - Estático: pre-generar en `public/og/<slug>.jpg`.
   - Dinámico: endpoint Astro `src/pages/og/[slug].png.ts` con `satori`/`sharp` (sharp ya está instalado) que componga obra + título sobre fondo `--c-bg`.
2. **`og:image:width/height`** (1200/630) y `og:image:alt` (describe la obra) — mejoran el render social.
3. **`og:type`**: `website` para páginas, considera `article` para `/diario`.
4. **Twitter**: `summary_large_image` ya está; añade `twitter:title`/`twitter:description` por página si difieren del OG (Base ya reusa los mismos — correcto).
5. Verifica con el validador de cada red antes de declarar hecho (no asumas el recorte).

Extiende el layout para aceptar dimensiones del OG:
```astro
<meta property="og:image" content={ogImage} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content={imageAlt ?? title} />
```

---

## Sitemap dinámico + robots

No hay `@astrojs/sitemap` instalado todavía. Añádelo (genera el sitemap de todas
las rutas estáticas, incluidas las de `getStaticPaths`):
```bash
npx astro add sitemap
```
```js
// astro.config.mjs
import sitemap from '@astrojs/sitemap';
export default defineConfig({ site: 'https://yoso.art', integrations: [sitemap()] });
```
- Con `site` ya definido, el sitemap sale en `/sitemap-index.xml`.
- `robots.txt` en `public/`: `Sitemap: https://yoso.art/sitemap-index.xml` + `Allow: /`.
- Excluye del sitemap rutas sin valor SEO (404, og endpoints) con la opción `filter`.

---

## Errores comunes a evitar

1. **Inventar datos en JSON-LD** (medidas, año, precio) → penalización y mentira. Solo marca lo que consta; omite el resto (patrón de spread condicional de arriba).
2. **`Product`/`Offer` sin precio** porque la obra es "Bajo solicitud" → es spam estructurado para Google. Usa `VisualArtwork` a secas; `Product` solo con precio público real.
3. **URLs relativas en JSON-LD/OG** → los scrapers no las resuelven. Siempre `new URL(path, Astro.site)`.
4. **Cambiar slugs sin redirect** → rompes enlaces compartidos y el `transition:name`. Slug estable o redirect en `vercel.json`.
5. **Más de un `<h1>` por página** → confunde jerarquía y SEO. Un `h1` por ruta (la tipografía lo respeta).
6. **`og:image` con la obra en vertical** → recorte feo en redes. Imagen social 1200×630 dedicada.
7. **Acentos/ñ en slugs** → URLs codificadas ilegibles. kebab-case ASCII.
8. **Duplicar datos entre entidades** (copiar la obra dentro de la serie) → desincronización. Referencia por slug.
9. **Olvidar el sitemap** tras crear rutas nuevas → Google tarda en indexarlas. Sitemap dinámico lo cubre solo.

---

## Integración con el resto del stack

- **Sanity** (`sanity-art-cms-skill`): las entidades de aquí (obra, serie, exposición) son los *documentos* de Sanity; los campos de schema deben mapear 1:1 a lo que el JSON-LD necesita (técnica, medidas, fechas, lugar). Diséñalos juntos.
- **Tipografía** (`editorial-typography-skill`): un solo `<h1>` semántico por página, jerarquía con la escala de tokens.
- **View Transitions** (`astro-view-transitions-skill`): el `slug` estable es la clave del `transition:name` miniatura↔ficha; por eso la estabilidad de URLs es también requisito de UX.
- **WebGL/GSAP**: la imagen de obra del JSON-LD/OG es la misma fuente que alimenta el displacement y los reveals; mantén una sola fuente de verdad por obra en `lib/obras.ts` (o, más adelante, en Sanity).
