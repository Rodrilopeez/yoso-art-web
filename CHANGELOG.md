# Changelog

Todos los cambios relevantes de este proyecto se documentan aquí, mapeados a la
recomendación de origen de las auditorías de negocio y SEO.

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

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

---

### Plantilla de entrada

```
- tipo(scope): descripción — Recomendación <fuente> §<n> → commit <hash>
```

Donde `<fuente>` es `SEO` o `Negocio`, y `<n>` el número/sección de la recomendación.
