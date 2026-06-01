---
name: gsap-cinematic-skill
description: >-
  Recetas de GSAP 3.13 avanzado para la web editorial de arte de YOSO
  (yoso-art-web). Úsala SIEMPRE que la tarea pida animar texto, secciones o
  galerías con movimiento cinematográfico. Triggers: "GSAP", "animación",
  "SplitText", "ScrollTrigger", "pin", "scroll horizontal", "Flip", "FLIP",
  "transición de miniatura a fullscreen", "reveal on scroll", "stagger",
  "marquee", "ticker", "texto letra por letra", "easing editorial", "scrub",
  "timeline", "registrar plugin GSAP", "parallax de texto", "aparece al hacer
  scroll", "animar titular". También al editar componentes que ya usan GSAP
  (Hero, Featured) o crear secciones animadas. Aplica el nivel de movimiento de
  refikanadol.com / jr-art.net / cyrcle.com a un sitio Astro estático.
---

# GSAP Cinematic — Movimiento editorial de galería

Cómo animar yoso-art-web con GSAP 3.13 al nivel de una galería contemporánea:
titulares que se revelan letra a letra, galerías con scroll horizontal pineado,
transiciones de miniatura a obra a pantalla completa con Flip, y tickers
infinitos sin saltos. Todo con easings lentos y curados, y compatible con
View Transitions de Astro.

**Regla fundamental: una sola fuente de verdad para el ease y el ciclo de
vida.** El ease editorial del proyecto es `power4.out` / `power3.out` en JS y
`--ease-art` (`cubic-bezier(0.22,1,0.36,1)`) en CSS — no inventes curvas
nuevas por animación. Y toda animación arranca en `astro:page-load` y se revierte
en `astro:before-swap` (View Transitions activas en `Base.astro`).

---

## Cuándo activarte

- Animar texto/titulares (SplitText), revelar secciones al hacer scroll, pinear y mover galerías en horizontal, transiciones Flip miniatura→obra, marquees.
- Editar [src/components/Hero.astro](../../../src/components/Hero.astro) (ya usa SplitText), [src/components/Featured.astro](../../../src/components/Featured.astro) (ya usa ScrollTrigger pin horizontal) o crear una sección con movimiento.

Si la tarea distorsiona **píxeles de una imagen** (shader) → `webgl-displacement-skill`.
Si es la **sincronización scroll suave** Lenis↔ScrollTrigger → `smooth-scroll-orchestration-skill`.

---

## Registrar plugins en Astro (hazlo bien una vez)

GSAP 3.13: **todos los plugins son gratis** (SplitText, Flip, ScrollTrigger,
MorphSVG…). Se importan desde subrutas y se registran **dentro del `<script>` de
isla de Astro**, no en un módulo global.

```ts
// Dentro de un <script> de componente .astro
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(ScrollTrigger, SplitText, Flip);
```

Reglas:
- Un `<script>` por componente; Astro lo bundlea y deduplica. Registrar el plugin dos veces es inofensivo, pero **importar GSAP en el frontmatter (`---`) no** — va en `<script>` cliente.
- En páginas estáticas no hay SSR de GSAP: nada de animar en el render. Todo tras `astro:page-load`.
- Define el ease del proyecto una vez y reúsalo:
  ```ts
  gsap.registerPlugin(ScrollTrigger);
  // ease editorial equivalente al --ease-art de tokens.css
  gsap.config({ nullTargetWarn: false });
  const EASE = 'power4.out';          // úsalo en todas las reveals
  ```

---

## Receta 1 — SplitText letra por letra con mask y clip-path

El reveal de marca. El `Hero.astro` ya hace la versión simple (`yPercent: 120`);
esta es la versión "con máscara" para titulares de sección (cada línea recorta
sus letras). Patrón para `<h2>`/`<h1>` de `estudio`, `sobre`, `exposiciones`.

```ts
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(SplitText, ScrollTrigger);

function revealHeadings() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    // mask: true envuelve cada línea en un contenedor con overflow:hidden →
    // las letras suben "desde detrás" del borde, efecto editorial limpio.
    const split = new SplitText(el, { type: 'lines,chars', mask: 'lines' });
    el.style.visibility = 'visible';                 // estaba oculto hasta split
    gsap.from(split.chars, {
      yPercent: 120,
      duration: 0.9,
      ease: 'power4.out',
      stagger: { each: 0.012, from: 'start' },
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
    // Re-split al cambiar el ancho (las líneas cambian); revert evita fugas.
    (el as any)._split = split;
  });
}

document.addEventListener('astro:page-load', revealHeadings);
document.addEventListener('astro:before-swap', () => {
  document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => (el as any)._split?.revert());
});
```

```css
/* El titular se oculta hasta que SplitText lo procesa (evita FOUC del salto). */
[data-split] { visibility: hidden; }
@media (prefers-reduced-motion: reduce) { [data-split] { visibility: visible; } }
```

Variante **clip-path** (sin mask de GSAP, control manual del recorte por línea):
```ts
const split = new SplitText(el, { type: 'lines' });
gsap.set(split.lines, { clipPath: 'inset(0 0 100% 0)' });
gsap.to(split.lines, { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'power3.out', stagger: 0.12,
  scrollTrigger: { trigger: el, start: 'top 80%', once: true } });
```

---

## Receta 2 — Galería con scroll horizontal pineado

Ya implementada en `Featured.astro`. Patrón canónico del proyecto (cópialo para
`series` o una sala de exposición). Claves que ya están bien resueltas y NO hay
que romper: solo pinear en escritorio, `invalidateOnRefresh` para recalcular la
distancia al redimensionar, y `x: () => -distance()` como función (no valor fijo).

```ts
gsap.to(track, {
  x: () => -distance(),              // función → se recalcula en refresh
  ease: 'none',                      // el movimiento lo da el scrub, no el ease
  scrollTrigger: {
    trigger: section, start: 'top top',
    end: () => '+=' + distance(),
    pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
  },
});
```
- `scrub: 1` (no `true`) suaviza el seguimiento ~1s: sensación premium.
- En móvil/`reduced-motion`: **no pinees**, deja scroll horizontal nativo (`overflow-x:auto`). Ya está así en Featured.
- Tras crear ScrollTriggers, llama `ScrollTrigger.refresh()` una vez cargadas las imágenes (si no, las medidas salen mal). En este proyecto lo hace `Base.astro` en `page-load`.

---

## Receta 3 — Flip: miniatura → obra a pantalla completa

Para el lightbox/zoom de la ficha ([obras/[slug].astro](../../../src/pages/obras/[slug].astro) ya tiene `data-zoom`). Flip mide el estado inicial (la miniatura
en su sitio) y anima hasta el estado final (fullscreen) sin saltos, aunque
cambien de contenedor en el DOM.

```ts
import gsap from 'gsap';
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(Flip);

function openWork(thumb: HTMLElement, overlay: HTMLElement) {
  const img = thumb.querySelector('img')!.cloneNode(true) as HTMLImageElement;
  const state = Flip.getState(thumb.querySelector('img')!);   // 1) mide origen
  overlay.appendChild(img);                                   // 2) muévela al overlay
  overlay.hidden = false;
  Flip.from(state, {                                          // 3) anima origen→destino
    duration: 0.7, ease: 'power3.inOut', absolute: true,
    scale: true, onComplete: () => img.classList.add('is-zoomed'),
  });
}
```
- `absolute: true` evita reflows de los hermanos durante el vuelo.
- `scale: true` interpola por transform (GPU), no por width/height (reflow).
- Para cerrar: invierte — `Flip.getState` del fullscreen y `Flip.from` de vuelta a la miniatura.
- Bloquea el scroll de Lenis mientras el overlay está abierto (`window.__lenis.stop()`) → ver `smooth-scroll-orchestration-skill`.

---

## Receta 4 — Reveal on scroll con stagger

La grid de `/obras` ya revela con IntersectionObserver + CSS (válido y barato).
Usa **GSAP** cuando quieras un stagger en rejilla 2D o un control de ease que el
CSS no da:

```ts
gsap.utils.toArray<HTMLElement>('.obra-card').forEach((card) => {
  gsap.from(card, {
    y: 28, autoAlpha: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: card, start: 'top 92%', once: true },
  });
});
// Stagger por filas (grid): batch evita 1 ScrollTrigger por tarjeta.
ScrollTrigger.batch('.obra-card', {
  start: 'top 90%',
  onEnter: (els) => gsap.from(els, { y: 28, autoAlpha: 0, stagger: 0.08, ease: 'power3.out', duration: 0.8, overwrite: true }),
});
```
Regla: si ya hay un reveal CSS funcionando (como en obras/index), **no lo
dupliques con GSAP**; elige uno. `autoAlpha` (opacity+visibility) evita que un
elemento invisible siga capturando clics.

---

## Receta 5 — Marquee / ticker infinito sin saltos

`Marquee.astro` hoy usa CSS (`@keyframes translateX(-100%)` con la pista
duplicada): correcto y suficiente. Pasa a **GSAP** solo si necesitas: arrastre
con el cursor, velocidad reactiva al scroll, o pausa/aceleración suave.

```ts
// Loop infinito sin costura usando moduladores (wrap perfecto).
const track = document.querySelector<HTMLElement>('[data-mq]')!;
const width = track.scrollWidth / 2;                  // la pista está duplicada
const tween = gsap.to(track, {
  x: -width, duration: 38, ease: 'none', repeat: -1,
  modifiers: { x: gsap.utils.unitize((x) => parseFloat(x) % width) },  // wrap sin salto
});
// Reactivo a Lenis: acelera/invierte según velocidad de scroll
(window as any).__lenis?.on('scroll', ({ velocity }: { velocity: number }) => {
  tween.timeScale(1 + Math.min(Math.abs(velocity) * 0.3, 4) * Math.sign(velocity || 1));
});
```
El secreto anti-salto es duplicar el contenido (ya lo hace el componente con
`[0,1].map`) y envolver `x` con módulo, no reiniciar el tween.

---

## Easings editoriales del proyecto

| Uso | JS (GSAP) | CSS equivalente |
|---|---|---|
| Reveal / salida premium | `power4.out` / `power3.out` | `--ease-art` = `cubic-bezier(0.22,1,0.36,1)` |
| Transición simétrica (Flip, modal) | `power3.inOut` | `--ease-in-out` = `cubic-bezier(0.65,0,0.35,1)` |
| Movimiento por scrub | `'none'` | — (lo da el scrub) |

Duraciones: titulares 0.9–1.1s, micro 0.4–0.6s, fundidos grandes 1.2s
(`--dur-3`). Lento y deliberado, no nervioso.

---

## Errores comunes a evitar

1. **SplitText sin `revert()`** → al re-entrar a la página (View Transitions) o al redimensionar, se acumulan `<div>`/`<span>` y el texto se rompe. Guarda la instancia y revierte en `astro:before-swap` y antes de re-split.
2. **No ocultar el titular antes de split** → flash del texto sin animar (FOUC). `visibility:hidden` por CSS hasta que SplitText corre; visible si `reduced-motion`.
3. **`x` como valor fijo en scroll horizontal** → al redimensionar la galería se descuadra. Usa función + `invalidateOnRefresh: true`.
4. **Olvidar `ScrollTrigger.refresh()` tras cargar imágenes** → starts/ends calculados con alturas equivocadas. (En este repo lo dispara `Base.astro`; si añades triggers async, refréscalo tú.)
5. **No limpiar ScrollTriggers en `before-swap`** → triggers zombis tras navegar. `ScrollTrigger.getAll().forEach(t => t.kill())` en before-swap, o usa `gsap.context()` y `ctx.revert()`.
6. **Animar width/height en Flip** → reflow y jank. Usa `scale: true` (transform).
7. **Inventar easings nuevos por capricho** → rompe la coherencia. Usa los de la tabla.
8. **No respetar `prefers-reduced-motion`** → en ese modo: sin SplitText, sin pin, sin marquee; deja layout estático.

---

## Integración con el resto del stack

- **Lenis** (`smooth-scroll-orchestration-skill`): GSAP y Lenis ya están sincronizados en `Base.astro` (`lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`). No crees un segundo `requestAnimationFrame`; engánchate al ticker existente.
- **WebGL** (`webgl-displacement-skill`): anima `uProgress`/`uStrength` con `gsap.to({v},…)` + `onUpdate` (como ya hace el crossfade del hero), nunca con bucles sueltos.
- **View Transitions** (`astro-view-transitions-skill`): el contrato `astro:page-load` (init) / `astro:before-swap` (kill+revert) es obligatorio en toda animación nueva. Para micro-animaciones *dentro* de una transición de página, dispáralas en `astro:after-swap`.
- **Loader** (`cinematic-loader-skill`): coordina el reveal del hero para que arranque al terminar el loader, no antes (evita animar contenido oculto).
