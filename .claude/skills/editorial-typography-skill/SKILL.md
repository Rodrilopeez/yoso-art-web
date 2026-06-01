---
name: editorial-typography-skill
description: >-
  Sistema tipográfico estilo galería contemporánea para yoso-art-web. Úsala
  SIEMPRE que la tarea toque fuentes, jerarquía de texto, escala tipográfica,
  pesos, interlineado, o la carga/optimización de tipografías. Triggers:
  "tipografía", "fuente", "font", "Fraunces", "Inter", "Canela", "Editorial
  New", "Cormorant", "serif display", "sans neutra", "pairing tipográfico",
  "escala modular", "jerarquía", "eyebrow", "deck", "caption", "font-display",
  "preload de fuente", "Fontsource", "self-hosted fonts", "font-weight",
  "interletraje", "letter-spacing", "variable font", "FOUT", "FOIT". También al
  crear titulares, textos largos, fichas técnicas o al editar tokens.css /
  global.css. Aplica el refinamiento tipográfico de una galería de arte.
---

# Editorial Typography — Tipografía de galería

El sistema tipográfico de yoso-art-web: una serif display (**Fraunces**) para
titulares con voz de autor y una sans neutra (**Inter**) para interfaz y lectura.
Pocos tamaños, saltos grandes, mucho aire. Carga self-hosted vía Fontsource,
sin FOUT ni capas de red de terceros.

**Regla fundamental: no inventes tokens nuevos.** El sistema ya vive en
[src/styles/tokens.css](../../../src/styles/tokens.css) (escala, pesos, tracking)
y las primitivas en [src/styles/global.css](../../../src/styles/global.css)
(`.eyebrow`, `.lead`, `h1–h3`). Construye SIEMPRE con esas variables y clases;
si falta un nivel, añádelo al token, no lo hardcodees en un componente.

---

## Cuándo activarte

- Elegir/cambiar fuente o peso, definir jerarquía de un bloque, ajustar interlineado/tracking, montar una ficha técnica, o tocar la carga de fuentes.
- Editar `tokens.css`, `global.css`, o el `import '@fontsource-variable/...'` de [src/layouts/Base.astro](../../../src/layouts/Base.astro).

---

## Las fuentes reales del proyecto (no asumas otras)

Instaladas vía **Fontsource variable** (`package.json`), self-hosted, sin Google Fonts en runtime:

```
--font-display: 'Fraunces Variable', Georgia, 'Times New Roman', serif;   /* titulares */
--font-sans:    'Inter Variable', system-ui, 'Segoe UI', sans-serif;       /* UI + cuerpo */
```

- **Fraunces Variable**: serif display con eje óptico (`opsz`) e itálica real. Es la voz editorial. `font-optical-sizing: auto` ya activo en `body`, `h1–h4` y display.
- **Inter Variable**: sans neutra para navegación, eyebrows, botones, fichas y cuerpo.

> Si en una propuesta se pide el look de **Canela / Editorial New / Cormorant** (alternativas comerciales premium): Fraunces es la sustituta libre y ya está integrada. No añadas una fuente de pago sin licencia. Si se compra una (p.ej. Canela), se autohospeda igual (ver "Añadir una fuente nueva") y se cambia **solo** `--font-display`; nada más en el código se toca.

---

## Pairing y roles

| Rol | Fuente | Token / clase | Notas |
|---|---|---|---|
| Nombre del artista (hero) | Fraunces | `--fs-mega` | `--fw-semi`, line-height 0.9 |
| Título de página / obra | Fraunces | `h1` / `--fs-h1` | `--fw-reg`, `--ls-tight`, `text-wrap: balance` |
| Sección | Fraunces | `h2` / `--fs-h2` | |
| Subsección / título tarjeta | Fraunces | `h3` / `--fs-h3` | |
| Eyebrow (etiqueta superior) | **Inter** | `.eyebrow` | mayúsculas, `--ls-wider`, color `--c-accent-2` |
| Deck / lead (entradilla) | **Inter** | `.lead` / `--fs-lead` | `--fw-light`, color `--c-ink-dim` |
| Cuerpo | **Inter** | `--fs-body` (~17px) | `--fw-light`, `--lh-body` 1.7, ancho `--container-text` (680px) |
| Caption / ficha técnica | **Inter** | `--fs-sm` / `--fs-eyebrow` | color `--c-ink-mute` |

**Contraste de la pareja:** serif solo en lo expresivo (titulares, statement de
obra, cita); sans en todo lo funcional. No mezcles serif en botones ni en
etiquetas — rompe el código visual de galería.

---

## Escala modular (ya definida, fluida)

`tokens.css` usa una escala de pocos pasos con `clamp()` (responsive sin media
queries). Saltos grandes = jerarquía clara de galería:

```
--fs-eyebrow 0.72rem · --fs-sm 0.85rem · --fs-body 1.0625rem
--fs-lead  clamp(1.15,1.6vw,1.45)
--fs-h3    clamp(1.5,2.6vw,2.1)
--fs-h2    clamp(2.2,5vw,3.6)
--fs-h1    clamp(3,8vw,6)
--fs-mega  clamp(4.5,17vw,15)   /* nombre del artista */
```
Si necesitas un tamaño intermedio, **interpola dentro de la escala** (p. ej. un
`--fs-h2-5`), no metas un `font-size: 2.8rem` suelto en un componente.

Tracking e interlineado (también tokens): `--ls-tight` (-0.02em) para display,
`--ls-wide`/`--ls-wider` para eyebrows en mayúsculas, `--lh-tight` 1.02 para
mega, `--lh-body` 1.7 para lectura.

---

## Patrón — bloque editorial completo

La secuencia eyebrow → título → deck → cuerpo, con las clases reales:

```astro
<header class="section container--text">
  <p class="eyebrow">Exposición</p>
  <h2 data-split>Ecos — Hybrid Art Fair 26</h2>
  <hr class="accent-rule" style="margin:1.25rem 0 1.5rem;" />
  <p class="lead">108 zapatos rojos y uno negro en una escalera de emergencia.</p>
  <p>Texto largo en Inter, ancho de lectura limitado a 680px para una medida
     cómoda (~66 caracteres). Interlineado generoso 1.7.</p>
</header>
```
- `--container-text` (680px) mantiene la **medida** de lectura ideal; no dejes párrafos a 1300px.
- `text-wrap: balance` ya está en `h1–h4`: evita líneas viudas en titulares.
- Para el cuerpo largo considera `text-wrap: pretty` (mejora viudas/huérfanas).

---

## Ficha técnica de obra (tipografía de catálogo)

La [ficha](../../../src/pages/obras/[slug].astro) usa un `<dl>` técnica/dimensiones/
edición/año. Tipografía de catálogo de museo: etiqueta en sans mayúsculas
mate, valor en sans claro legible. Mantén `tabular-nums` en las medidas para que
las cifras alineen:

```css
.ficha__dl { font-feature-settings: 'tnum' 1; }      /* números tabulares */
.ficha__row dt { font-size: var(--fs-eyebrow); letter-spacing: var(--ls-wide);
  text-transform: uppercase; color: var(--c-ink-mute); }
.ficha__row dd { font-size: var(--fs-body); color: var(--c-ink); }
```

---

## Carga y optimización (Fontsource self-hosted)

Hoy `Base.astro` importa las variables completas:
```ts
import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';
```
Esto self-hospeda las fuentes (bien: sin terceros, GDPR-friendly, sin salto a
Google). Mejoras recomendadas:

1. **`font-display: swap`** — Fontsource ya lo aplica por defecto. Verifica que ningún CSS lo pise. Evita el texto invisible (FOIT); en una galería el FOUT controlado es preferible a página en blanco.

2. **Preload de los pesos críticos** del primer pintado (nombre del hero + h1). Con fuente variable, precarga el archivo woff2 del eje:
   ```astro
   <!-- en el <head> de Base.astro, antes de los imports CSS -->
   <link rel="preload" as="font" type="font/woff2" crossorigin
     href="/_astro/fraunces-latin-variable-wghtOnly-normal.woff2" />
   ```
   (verifica el nombre real del woff2 emitido en `dist/_astro/` tras `astro build`; cámbialo si Astro lo renombra por hash).

3. **Subset `latin`** — importa solo el subconjunto necesario para no cargar cirílico/griego:
   ```ts
   import '@fontsource-variable/fraunces/latin.css';
   import '@fontsource-variable/inter/latin.css';
   ```

4. **Itálica de Fraunces** solo si se usa (statement de obra, citas): impórtala aparte; no cargues el eje `ital` si no aparece en pantalla.

5. **`size-adjust` / metrics fallback**: la cadena de fallback (`Georgia`, `system-ui`) ya está. Para minimizar el reflow al cambiar de fallback a la real, considera un `@font-face` de ajuste con `size-adjust` si el CLS sube.

---

## Errores comunes a evitar

1. **Hardcodear tamaños/colores** en un componente en vez de usar tokens → el sistema se desincroniza. Siempre `var(--fs-*)`, `var(--c-ink*)`.
2. **Serif en UI** (botones, filtros, nav) → rompe el lenguaje de galería. Inter en todo lo funcional.
3. **Párrafos a ancho completo** → ilegibles. Limita a `--container-text`.
4. **Cargar Google Fonts** "para probar" → reintroduces terceros y un salto de red que el self-hosting ya evitó. No lo hagas; usa Fontsource.
5. **Preload de todos los pesos** → desperdicia banda. Solo el woff2 del primer pintado.
6. **Olvidar `font-optical-sizing: auto`** en display nuevo → Fraunces pierde su ajuste óptico. Ya está en `body`/`h*`; mantenlo en cualquier display custom.
7. **Cifras sin `tabular-nums`** en tablas/fichas → columnas de medidas desalineadas.
8. **Cambiar `--font-display` sin autohospedar** la fuente nueva → dependencia externa y FOUT sin control.

---

## Añadir una fuente nueva (si se compra una display premium)

1. Coloca los `.woff2` en `public/fonts/` o instala su paquete Fontsource.
2. Declara `@font-face` (con `font-display: swap`) en un CSS importado por `Base.astro`.
3. Cambia **solo** `--font-display` en `tokens.css`. Toda la jerarquía la hereda automáticamente — ese es el beneficio de centralizar en tokens.
4. Preload del peso del primer pintado. Revisa CLS en Lighthouse.

---

## Integración con el resto del stack

- **GSAP** (`gsap-cinematic-skill`): los titulares con `data-split` se revelan con SplitText. La tipografía debe estar cargada antes de partir el texto (de ahí el preload del peso del hero) o las métricas de líneas saldrán mal.
- **Loader** (`cinematic-loader-skill`): el contador/nombre del loader usa `--font-display` y `--fs-mega`; reúsalos para coherencia.
- **Sanity** (`sanity-art-cms-skill`): el `statement` y la ficha técnica vienen del CMS; aplícales las clases `.lead` / ficha aquí definidas, no estilos inline.
- **Arquitectura** (`art-portfolio-architecture-skill`): los `<h1>` únicos por página (jerarquía semántica) son también SEO; un solo `h1` por ruta.
