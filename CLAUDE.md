# yoso-art-web — Guía para Claude Code

Rediseño de la web del artista **YOSO** (Ambrosio López González): galería
contemporánea. Objetivo de dirección de arte: nivel de refikanadol.com /
jr-art.net / cyrcle.com — hero cinematográfico, tipografía editorial, animación
GSAP profesional, WebGL en la obra, scroll suave, transiciones entre páginas,
cursor custom y CMS para que el artista suba obra solo.

## Stack

- **Astro 5.6** · output `static` · `site: https://yoso.art` (deploy en Vercel).
- **GSAP 3.13** (SplitText, ScrollTrigger, Flip — todos gratis en 3.13).
- **Lenis 1.1** (scroll suave) · **OGL 1.0** (WebGL) · **Fontsource** (Fraunces + Inter).
- Imágenes: `astro:assets` (locales) → migración prevista a **Sanity** (CMS).
- Rama de trabajo: `rediseno/astro`.

## Convenciones clave

- **Tokens primero**: todo color/tamaño/easing sale de `src/styles/tokens.css`. Easing del proyecto: `--ease-art` = `cubic-bezier(0.22,1,0.36,1)` (`power4.out` en GSAP). No hardcodees valores.
- **Ciclo de vida con View Transitions**: el `<ClientRouter />` mantiene el documento vivo. Todo script se inicializa en `astro:page-load` y se limpia en `astro:before-swap`. Nunca `DOMContentLoaded`.
- **Un solo motor de scroll**: Lenis vive en `Base.astro` y conduce el `gsap.ticker`; reúsalo vía `window.__lenis`. No crees otro Lenis ni otro `requestAnimationFrame`.
- **Accesibilidad**: respeta `prefers-reduced-motion` en toda animación; un solo `<h1>` por página.
- **Honestidad de datos**: no se inventan medidas, años ni precios de obra; lo que no consta va como "Consultar" y se omite del JSON-LD (ver `lib/obras.ts`).

## Skills del proyecto (`.claude/skills/`)

Se autocargan por contexto. Aplican los patrones de diseño y código del rediseño:

1. **webgl-displacement-skill** — distorsión/crossfade de obra con OGL (shader `cover()`, reactividad a cursor/scroll, fallback, limpieza WebGL).
2. **gsap-cinematic-skill** — GSAP avanzado: SplitText con mask, ScrollTrigger pin horizontal, Flip miniatura→fullscreen, reveals, marquee infinito.
3. **editorial-typography-skill** — sistema tipográfico de galería: Fraunces + Inter, escala modular, jerarquía, carga Fontsource optimizada.
4. **smooth-scroll-orchestration-skill** — Lenis × GSAP ScrollTrigger sin conflictos, scroll-lock en modales, ajuste premium, compatibilidad View Transitions.
5. **custom-cursor-skill** — cursor con estados (CTA magnético, "Ver obra", subrayado, image trail), guardas de accesibilidad, vanilla JS.
6. **art-portfolio-architecture-skill** — entidades (obra/serie/exposición/proyecto/prensa), URLs limpias, Schema.org, Open Graph, sitemap.
7. **sanity-art-cms-skill** — esquemas de Studio mapeados al modelo `Obra`, GROQ sin N+1, CDN de imágenes (WebP/AVIF), autonomía del artista.
8. **astro-view-transitions-skill** — morph miniatura→hero con `transition:name`, persistencia de header, ciclo de vida, fallback.
9. **cinematic-loader-skill** — entrada curada one-time por sesión, sincronizada con la carga real, tres patrones, transición elegante al hero.

> Las skills se referencian entre sí (cada una tiene su sección "Integración con
> el resto del stack"). Son reutilizables: pensadas para viajar a futuros
> proyectos de artistas/galerías de la agencia.
