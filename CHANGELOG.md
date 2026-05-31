# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí, mapeados a la
recomendación de origen de las auditorías de negocio y SEO.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## Rediseño Astro (rama `rediseno/astro`)

Rebuild desde cero a nivel galería contemporánea. La web estática previa permanece en `main`.

- `chore(astro): scaffold` — proyecto Astro 5 (estático) + stack (gsap, lenis, ogl),
  `Base.astro` con SEO de origen (title/description/canonical/OG — SEO §1/§3/§5), build OK.
- `design(astro): sistema de diseño en código` — `src/styles/tokens.css` + `global.css`:
  base oscura + blanco hueso + acento oro `#b8905a`, tipografías self-hosted Fraunces + Inter
  (Fontsource), escala tipográfica de saltos grandes, espaciado generoso, easings cinemáticos
  (`cubic-bezier(0.22,1,0.36,1)`, 0.6–1.2 s). Aplica coherencia de marca (Negocio) y base de
  rendimiento (fuentes self-hosted, sin render-blocking de Google Fonts — SEO §Técnico).
- `feat(astro): layout base — navegación, footer, View Transitions y plantillas de ruta` —
  `Header.astro` (nav transparente sobre hero que se solidifica al scroll, menú móvil
  accesible con `aria-expanded`/foco/Esc, estado activo `aria-current`), `Footer.astro`
  (contacto + redes con `rel=noopener` — SEO §Enlaces), `<ClientRouter />` (transiciones de
  página), `skip-link` y `<main>` semántico (a11y). Plantillas de ruta: `/obras`, `/series`,
  `/exposiciones`, `/sobre`, `/estudio`, `/diario`, `/contacto` (arquitectura multipágina, 8
  páginas; navegación sin 404).
- `feat(astro): hero cinematográfico WebGL (displacement) + intro` — `Hero.astro`: obra
  "Identity" a 100svh con shader OGL de displacement reactivo a cursor/scroll (cover-fit),
  nombre con reveal mascarado GSAP SplitText, scrim para legibilidad, indicador de scroll y
  **fallback a imagen** si no hay WebGL. Canvas decorativo (`aria-hidden`); contenido textual
  real y H1 único (a11y/SEO §2). Sección intro al artista con transición narrativa.
  Verificado en navegador (sin errores, canvas pinta, SplitText OK).
- `feat(astro): /obras — galería real con filtros + ruta dinámica /obras/[slug]` —
  `src/lib/obras.ts` (catálogo desde `works-data.mjs` + imágenes locales), `obras/index.astro`
  (55 obras con `astro:assets` → WebP/AVIF + `srcset`/`sizes`, **alt descriptivo** por obra —
  SEO §Imágenes; filtros por disciplina accesibles `aria-pressed`; hover zoom; reveal on
  scroll), `obras/[slug].astro` (`getStaticPaths` → **una página por obra**, SEO §2/§4 y
  Negocio §5; ficha mínima a desarrollar). Build: 63 páginas. Verificado (filtro Escultura→3).

## [No publicado]

### Añadido
- `chore: inicialización del repositorio y estructura base` — scaffolding inicial
  (`README.md`, `.gitignore`, `CHANGELOG.md`, `docs/plan-de-trabajo.md`). Sin recomendación
  de auditoría asociada (paso de infraestructura).
- `feat(seo): esqueleto semántico + cabeza SEO + tokens de marca en index` — Cambio 1.
  - `index.html`: estructura HTML5 semántica con **un único H1** y jerarquía H2 por
    disciplina — Recomendación SEO Top 5 §2 (Headings 22/100) + categoría Headings.
  - `<title>` único de 52 car. con keyword al inicio — Recomendación SEO Top 5 §5.
  - `<meta name="description">` de 157 car. — Recomendación SEO Top 5 §1.
  - Open Graph + Twitter Cards — Recomendación SEO Top 5 §3 (OG 8/100).
  - JSON-LD `Person` (sameAs IG/X/WISe.ART) — Recomendación SEO Top 5 §4 (Schema 5/100).
  - `canonical`, `lang="es"`, viewport, favicon SVG real — Recomendación SEO §Meta y
    §Técnico (favicon.ico devolvía HTML).
  - Footer con **© 2026** (corrige © 2022) — Recomendación Negocio §4.
  - Enlaces sociales con `rel="noopener noreferrer"` — Recomendación SEO §Enlaces.
  - `assets/css/tokens.css`, `base.css`, `layout.css`: sistema de diseño fiel a la marca
    (paleta + Playfair/Cormorant/DM Sans) — Recomendación Negocio §coherencia de marca.
- `feat(conversion): hero con propuesta de valor, CTA principal, barra de reconocimientos y stats` — Cambio 2.
  - Hero reescrito con propuesta de valor + **CTA principal "Ver obra disponible" sobre el
    pliegue** — Recomendación Negocio §6 (hero sin propuesta) y §copy (CTA claro).
  - **Barra de reconocimientos** (Arte Laguna · NASDAQ Times Square · WISe.ART · Jaume
    Graells · Art Madrid) bajo el hero — Recomendación Negocio §3 (premios invisibles).
  - Barra de **stats** (8+ premios · 15+ exposiciones · 10+ países · 3 galerías) — refuerzo
    de autoridad, Recomendación Negocio §3.
  - `assets/css/sections.css`: estilos de hero/reconocimientos/stats con animación de
    entrada respetando `prefers-reduced-motion`.
- `feat(conversion): bloque de trayectoria — premios, exposiciones, galerías y prensa` — Cambio 3.
  - Sección Trayectoria con subsecciones H3 (jerarquía Hx correcta: 1×H1, 5×H2, 4×H3) —
    Recomendación SEO §2 (headings) + Negocio §3 / §prueba social.
  - **Premios** (8) con año, institución, localización y badge de resultado.
  - **Exposiciones** (12), **galerías de representación** (3) y **prensa** (6) con datos
    reales — prueba social que transforma "me gusta" en "quiero comprar" (Negocio §3).
  - Estilos añadidos a `assets/css/sections.css` (rejillas responsive con hairline).
- `feat(a11y): galerías de obra en HTML estático + lightbox accesible` — Cambio 4.
  - 55 obras (32 arte digital · 3 escultura · 20 fotografía) como `<figure><img>` **estáticos**
    con **alt descriptivo**, `loading="lazy"`, `decoding="async"` y dimensiones — Recomendación
    SEO §Imágenes (19/26 con alt vacío; clave para Google Imágenes) + item 13 del plan.
  - Lightbox accesible (`assets/js/gallery.js`): `role=dialog` + `aria-modal`, teclado
    (Esc/flechas), **trampa de foco** y restauración de foco al cerrar.
  - Fix a11y: `visibility` cambia al instante al abrir (se retrasa al cerrar) para que el
    diálogo sea enfocable de inmediato; verificado con prueba funcional Playwright.
  - Escultura con ficha técnica real (técnica, año, dimensiones).
  - `scripts/gen-galleries.mjs`: generador reproducible de las galerías estáticas.
  - `assets/css/gallery.css`: rejilla 4/3/2 columnas y estilos del lightbox.
- `feat(conversion): formulario de contacto y newsletter de captación` — Cambio 6.
  - Formulario de contacto en la home (#contacto) con labels reales asociados, `<select>` de
    asunto y validación accesible — Recomendación Negocio §copy (CTA de contacto).
  - **Newsletter** "Recibe aviso de nueva obra disponible" — Recomendación Negocio §7.
  - `assets/js/forms.js`: validación + envío `mailto` (sin backend), preparado para enchufar
    Formspree/Web3Forms/Brevo. `assets/css/forms.css` con estilos accesibles (foco visible).
  - Pendiente de decisión: endpoint de backend de formularios (default actual: `mailto`).
- `feat(seo): sección FAQ con acordeón accesible y schema FAQPage` — Cambio 7.
  - FAQ que resuelve objeciones de compra (adquisición, precios, envíos, ediciones/certificado,
    NFT/WISe.ART, encargos) — conversión (Negocio).
  - Acordeón accesible (`assets/js/faq.js`): `aria-expanded` + `aria-controls`.
  - JSON-LD `FAQPage` para resultados enriquecidos — Recomendación SEO §4.
- `seo: robots.txt y sitemap.xml propios` — Cambio 8.
  - `robots.txt` (permite rastreo, declara sitemap) y `sitemap.xml` (home + Sobre YOSO) —
    Recomendación SEO §Técnico (infra de indexación). Cierra la Fase 1.
- `perf: localización y optimización de imágenes (55 obras a WebP) + OG propia` — Cambio 9.
  - Las 55 obras descargadas de yoso.art y **optimizadas a WebP** (máx. 1200 px, q80) en
    `assets/img/obra/` (~3,9 MB total) — Recomendación SEO §Imágenes/§Técnico (CWV) y
    Negocio §10; elimina la dependencia de hotlink a yoso.art.
  - Imagen **Open Graph 1200×630** propia (`assets/img/og-yoso.jpg`) — corrige la OG cuadrada.
  - `index.html` y `sobre-yoso.html` reescritos a rutas locales (0 hotlinks restantes).
  - Tooling de build: `package.json` + `scripts/works-data.mjs`, `scripts/fetch-images.mjs`
    (sharp). `node_modules/` ignorado.
- `a11y(perf): contraste AA y medición Lighthouse antes/después` — Cambio 10.
  - Corrige el contraste WCAG AA: nuevo `--c-gold-text` (#836234) para texto dorado pequeño,
    `--c-ink-mute` oscurecido, badge/botón dorados con texto/fondo accesibles, textos tenues
    sobre oscuro reforzados — Calidad innegociable (a11y); `color-contrast` sin incidencias.
  - Lighthouse móvil **antes→después**: Rendimiento 68→**95**, Accesibilidad 100→**100**,
    Buenas prácticas 96→**100**, SEO 92→**100**; LCP 6,0→**2,8 s**, Speed Index 6,1→**1,8 s**,
    TBT 70→**0 ms** — Recomendación SEO §Técnico (CWV) y Negocio §10.
  - `scripts/serve.mjs` (server estático para auditar) y `docs/lighthouse/resumen.md`.
- `feat(venta): fichas individuales de obra destacada con ficha técnica y CTA de precio` — Cambio 11.
  - 6 fichas (`obra-<slug>.html`: Identity, Veritas, Dream of Red Wave II, Ecos, Soplo de
    Vida, La Boda) con **Técnica · Dimensiones · Edición · Año · Precio** y CTA
    **"Consultar precio"** (mailto prerrellenado) — Recomendación Negocio §5; campos
    desconocidos como "Consultar" (sin inventar datos).
  - Schema **VisualArtwork** por obra — Recomendación SEO §4 (Product/obra).
  - Enlace **"Ver ficha"** desde la tarjeta de galería de cada obra destacada; `sitemap.xml`
    actualizado con las 6 fichas. `scripts/gen-obras.mjs` reproducible.
- `feat(content): sección WISe.ART / arte digital tokenizado` — Cambio 12.
  - Sección "Arte digital tokenizado" en la home con 6 obras NFT (precio ETH) y CTA al perfil
    de artista en WISe.ART (Ethereum) — Recomendación Negocio §8 y §12 (presencia blockchain
    comunicada en la web).
- `feat(analytics): GA4 e instrumentación de eventos clave` — Cambio 13.
  - `assets/js/analytics.js`: GA4 (gtag/dataLayer) con ID placeholder (se activa al sustituir
    `GA_ID`) y eventos: `cta_ver_obra`, `cta_consultar_precio`, `obra_abrir`, `obra_ver_ficha`,
    `form_contacto`, `form_newsletter`, `scroll_galeria` — Recomendación Negocio (analítica).
  - Incluido en home, "Sobre YOSO" y las 6 fichas. Verificado sin errores de consola.
- `docs: informe final con antes/después, métricas Lighthouse y próximos pasos` — Cambio 14.
  - `docs/informe-final.md` con capturas antes (yoso.art en vivo) / después, tabla Lighthouse,
    mapa de recomendaciones aplicadas y próximos pasos — Entregable. Actualiza el README.

---

### Plantilla de entrada

```
- tipo(scope): descripción — Recomendación <fuente> §<n> → commit <hash>
```

Donde `<fuente>` es `SEO` o `Negocio`, y `<n>` el número/sección de la recomendación.
