# Plan de trabajo — Yoso Art Web

> Reconstrucción estática que aplica **íntegramente** las recomendaciones de la auditoría de
> negocio y la auditoría SEO. Orden de prioridad: **alto impacto + bajo riesgo primero →
> SEO técnico antes que rediseño → rediseño antes que microcopy**.
>
> Estado: **pendiente de aprobación**. No se tocará código del sitio hasta tu OK.

## Leyenda

- **Esfuerzo:** S (≤1h) · M (media jornada) · L (jornada o más)
- **Impacto:** bajo / medio / alto
- **Origen:** `SEO §n` (Top 5 / categoría de la auditoría SEO) · `Negocio §n` (errores / plan
  de acción de la auditoría de negocio)

---

## Decisiones pendientes (necesito tu respuesta antes o durante la Fase 1)

1. **Idiomas.** La web actual es trilingüe (ES/EN/FR) con hreflang — un punto fuerte SEO.
   Propuesta: construir primero **ES completo** y dejar EN/FR como **Fase 7** (replicar
   estructura + hreflang). ¿Lo hacemos así o el inglés es imprescindible desde el día 1?
2. **Precios reales.** La auditoría exige precios visibles (`Negocio §1, §3`). No los tengo.
   Propuesta intermedia fiel a la auditoría: ficha técnica completa (técnica, dimensiones,
   edición, año) + **"Consultar precio"** con formulario prerrellenado por obra, y dejar
   los campos de precio listos para rellenar cuando me los pases. ¿Tienes precios,
   dimensiones y ediciones de las obras destacadas?
3. **Despliegue.** ¿Destino final? (GitHub Pages, Netlify, o subir el estático al hosting
   actual de yoso.art). Afecta a rutas y a la config de analítica.
4. **Formulario de contacto.** Sin backend en estático. Propuesta: Formspree/Web3Forms
   (gratuito) o `mailto:` como fallback. ¿Preferencia?
5. **Analítica.** ¿Google Analytics 4, Plausible u otra? Necesario para instrumentar eventos
   (`Negocio` — analítica) antes de cerrar.

---

## FASE 0 — Inicialización ✅ (en curso)

| # | Acción | Archivos | Origen | Esf. | Impacto |
|---|--------|----------|--------|------|---------|
| 0 | Repo, ramas, README, CHANGELOG, plan | `README.md`, `.gitignore`, `CHANGELOG.md`, `docs/` | Infra | S | — |

## FASE 1 — Cimientos del sitio + SEO técnico base (alto impacto, bajo riesgo)

| # | Acción | Archivos | Origen | Esf. | Impacto |
|---|--------|----------|--------|------|---------|
| 1 | Estructura HTML5 semántica de `index.html` con **un único H1** descriptivo y jerarquía H2/H3 correcta (Arte Digital / Escultura / Fotografía) | `index.html` | SEO §2 (Headings 22/100) | M | alto |
| 2 | `<title>` único 50–60 car. con keyword + `<meta name="description">` 150–160 car. | `index.html` `<head>` | SEO §1, §5 | S | alto |
| 3 | Open Graph + Twitter Cards (`og:*`, `twitter:summary_large_image`) con imagen 1200×630 | `index.html`, `assets/img/og-yoso.jpg` | SEO §3 (OG 8/100) | S | alto |
| 4 | `<link rel="canonical">`, `lang="es"`, viewport, favicon real `favicon.ico` + tamaños | `index.html`, `/favicon.*` | SEO §Meta, §Técnico | S | medio |
| 5 | Datos estructurados JSON-LD: `Person`/`VisualArtist` + `sameAs` (IG, X, WISe.ART) + `knowsAbout` | `index.html` | SEO §4 (Schema 5/100) | S | medio |
| 6 | Tokens de diseño (paleta + tipografías de marca) y CSS base mobile-first | `assets/css/base.css`, `assets/css/tokens.css` | Identidad / Negocio §coherencia | M | alto |
| 7 | `robots.txt` + `sitemap.xml` propios (con `noopener` en externos) | `/robots.txt`, `/sitemap.xml` | SEO §Técnico, §Enlaces | S | medio |

## FASE 2 — Conversión y autoridad en Home (núcleo del negocio)

| # | Acción | Archivos | Origen | Esf. | Impacto |
|---|--------|----------|--------|------|---------|
| 8 | **Hero** con propuesta de valor (H1 + frase filosófica) + **CTA principal por encima del pliegue** ("Ver obra disponible") | `index.html`, `assets/css/hero.css` | Negocio §6 (hero), §copy | M | alto |
| 9 | **Barra de reconocimientos** bajo el hero (Venecia · Times Square · Ginebra · Art Madrid…) | `index.html` | Negocio §3 (premios invisibles) | S | alto |
| 10 | Sección **trayectoria/premios** + exposiciones + prensa + galerías (prueba social) | `index.html` | Negocio §3, §prueba social | M | alto |
| 11 | Footer con **© 2026** (corregir el © 2022 actual) y enlaces sociales con `rel="noopener noreferrer"` | `index.html` | Negocio §4 (© 2022), SEO §Enlaces | S | medio |
| 12 | **Newsletter** "Aviso de nueva obra disponible" (captación de leads) | `index.html`, `assets/js/forms.js` | Negocio §7 (newsletter) | M | medio |

## FASE 3 — Catálogo de obra + fichas (corazón de la venta)

| # | Acción | Archivos | Origen | Esf. | Impacto |
|---|--------|----------|--------|------|---------|
| 13 | Galería de obra (Arte Digital / Escultura / Fotografía) con grid responsive, lightbox accesible y **alt descriptivo en cada obra** | `obra.html`, `assets/js/gallery.js` | SEO §Imágenes (19/26 alt vacío), Negocio | L | alto |
| 14 | **Ficha individual** por obra destacada: técnica · dimensiones · edición · año · precio/Consultar + CTA compra/encargo | `obra/<slug>.html` (N destacadas) | Negocio §5 (ficha técnica), §copy | L | alto |
| 15 | Schema `VisualArtwork`/`Product` por obra (precio si disponible) | fichas de obra | SEO §4 (Product) | M | medio |
| 16 | Optimización de imágenes: WebP/AVIF, `loading="lazy"` nativo + `width/height` (evitar CLS) | `assets/img/`, fichas | SEO §Imágenes, §Técnico (CWV) | L | alto |

## FASE 4 — Páginas de soporte y objeciones

| # | Acción | Archivos | Origen | Esf. | Impacto |
|---|--------|----------|--------|------|---------|
| 17 | Página **"Sobre YOSO"** que vende la historia (arquitecto → arte, sueños, identidad) >300 palabras | `sobre-yoso.html` | SEO §Contenido (texto escaso), Negocio §6 | M | medio |
| 18 | Página **Contacto** con formulario corto + datos + CTA "consulta de adquisición" | `contacto.html` | Negocio §copy CTA | M | medio |
| 19 | **FAQ** que resuelve objeciones (envíos, encargos, ediciones, certificados, NFT/Web3) | `index.html` o `faq.html` | Negocio (conversión/FAQ) | M | medio |
| 20 | Sección **Arte Digital Tokenizado** (WISe.ART) con enlace al perfil Ethereum | `index.html` | Negocio §8 (Wise Art) | S | bajo |

## FASE 5 — Rendimiento, accesibilidad y verificación

| # | Acción | Archivos | Origen | Esf. | Impacto |
|---|--------|----------|--------|------|---------|
| 21 | Fuentes optimizadas (`preconnect`, `font-display:swap`, subset), CSS crítico, sin render-blocking | `<head>`, CSS | SEO §Técnico (CWV), Negocio §10 | M | medio |
| 22 | Accesibilidad WCAG AA: contraste, foco visible, navegación por teclado, labels reales, ARIA mínimo | global | Calidad (a11y) | M | medio |
| 23 | Lighthouse/PageSpeed antes/después; objetivo CWV en verde y móvil ≥ 90 | `docs/informe-final.md` | SEO §Técnico, Negocio §10 | M | alto |

## FASE 6 — Analítica e instrumentación

| # | Acción | Archivos | Origen | Esf. | Impacto |
|---|--------|----------|--------|------|---------|
| 24 | Eventos: envío de formulario, clic CTA principal, scroll en galería, clic en obra | `assets/js/analytics.js` | Negocio (analítica) | M | medio |

## FASE 7 — Internacionalización (si se aprueba)

| # | Acción | Archivos | Origen | Esf. | Impacto |
|---|--------|----------|--------|------|---------|
| 25 | Réplica EN/FR + `hreflang` + sitemaps por idioma | `/en/`, `/fr/` | SEO §Meta (hreflang) | L | medio |

## FASE 8 — Cierre

| # | Acción | Archivos | Origen | Esf. | Impacto |
|---|--------|----------|--------|------|---------|
| 26 | `docs/informe-final.md` (antes/después, métricas Lighthouse, próximos pasos) | `docs/` | Entregable | M | — |
| 27 | Pull Request `mejoras/auditoria` → `main` con descripción detallada | — | Entregable | S | — |

---

## Recomendaciones de auditoría que NO se aplican en este repo (y por qué)

Algunas acciones de la auditoría de negocio son **operativas/externas**, no de código web, y
quedan como recomendaciones en el informe final (no como tareas del repo):

- Abrir perfiles en **Saatchi Art / Artsy / Singulart** (`Negocio §1, §2, §4, §8`) — gestión
  de cuentas en plataformas de terceros.
- **Estrategia de Instagram / Reels** (`Negocio §9`) — producción de contenido.
- Migración real del WordPress de producción — fuera de alcance (construimos el estático).

> Si quieres, puedo además generar los textos/fichas listos para subir a Saatchi/Artsy.
