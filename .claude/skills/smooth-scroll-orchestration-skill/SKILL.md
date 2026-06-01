---
name: smooth-scroll-orchestration-skill
description: >-
  Orquestación de scroll suave en yoso-art-web: cómo combinar Lenis con GSAP
  ScrollTrigger sin conflictos y bajo View Transitions de Astro. Úsala SIEMPRE
  que la tarea toque el scroll, el pin de secciones, el scrubbing, o bloquear el
  scroll en un modal/lightbox. Triggers: "Lenis", "smooth scroll", "scroll
  suave", "ScrollTrigger no se actualiza", "los triggers no funcionan", "scroll
  virtual", "lerp", "scrub", "sticky", "pin", "parallax", "scroll lock",
  "bloquear scroll", "modal", "lightbox", "scroll jank", "duration easing del
  scroll", "scroll-to", "anchor scroll", "el scroll va a saltos". También al
  editar el script de Lenis en Base.astro o crear secciones dependientes del
  scroll. Sensación de scroll premium tipo cyrcle.com / jr-art.net.
---

# Smooth Scroll Orchestration — Lenis × GSAP × Astro

Cómo conseguir el scroll "premium" de yoso-art-web sin el bug clásico: con
scroll virtual (Lenis), ScrollTrigger no se entera de que la página se movió y
los pins/reveals se quedan congelados. Aquí está el contrato correcto, ya
implementado en el proyecto, más los patrones de sticky, scrub y scroll-lock.

**Regla fundamental: una sola instancia de Lenis y un solo bucle de raf.** Lenis
vive en `Base.astro`, conduce el `gsap.ticker` y notifica a `ScrollTrigger.update`.
Nunca crees un segundo Lenis, ni un segundo `requestAnimationFrame`, ni llames a
`lenis.raf` por tu cuenta. Engánchate a lo que ya existe (`window.__lenis`).

---

## Cuándo activarte

- Algo del scroll no responde: pins quietos, reveals que no disparan, parallax a tirones.
- Configurar la sensación del scroll (lerp/duration/easing), un sticky, un scrub, o bloquear scroll en modal/lightbox.
- Editar el `<script>` de Lenis en [src/layouts/Base.astro](../../../src/layouts/Base.astro).

Si es la animación en sí (timeline, SplitText, pin horizontal) → `gsap-cinematic-skill`.
Esta skill es solo el **transporte** del scroll y su sincronía.

---

## El contrato real (ya en Base.astro) — entiéndelo antes de tocar

```ts
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis: any = null;
const tick = (t: number) => lenis?.raf(t * 1000);   // GSAP da segundos; Lenis quiere ms

function start() {
  if (reduce || lenis) return;                       // a11y: sin smooth si reduced-motion
  lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);          // (1) cada scroll virtual → actualiza triggers
  gsap.ticker.add(tick);                             // (2) un solo raf: el de GSAP conduce Lenis
  gsap.ticker.lagSmoothing(0);                       // (3) sin saltos por lag
  (window as any).__lenis = lenis;                   // (4) acceso global para otras skills
}
function stop() { if (!lenis) return; gsap.ticker.remove(tick); lenis.destroy(); lenis = null; }

document.addEventListener('astro:page-load', () => { start(); ScrollTrigger.refresh(); });
document.addEventListener('astro:before-swap', stop);
```

Las cuatro líneas que evitan el bug:
1. `lenis.on('scroll', ScrollTrigger.update)` — sin esto, los triggers NO ven el scroll virtual y se congelan.
2. `gsap.ticker.add(tick)` — un único raf. Lenis no corre su propio loop; lo conduce el ticker de GSAP. Dos loops = jitter.
3. `lagSmoothing(0)` — desactiva el suavizado de lag de GSAP que con scroll virtual provoca saltos.
4. `__lenis` global — es la API que usan `webgl-displacement`, `gsap-cinematic` y los modales para leer velocidad o bloquear scroll.

Y `ScrollTrigger.refresh()` en `page-load` recalcula medidas tras cada
navegación (View Transitions mantienen el documento vivo).

---

## Ajuste de la sensación (premium = lento y con peso)

Lenis acepta `duration` **o** `lerp` (no ambos a la vez con sentido). El proyecto
usa `duration: 1.1`. Para una galería de arte:

```ts
new Lenis({
  duration: 1.1,                 // 1.0–1.3 = pesado, cinemático (más alto = más "deslizante")
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),  // expo.out, deceleración suave
  smoothWheel: true,
  wheelMultiplier: 1,            // <1 = scroll más lento/control; no exageres o frustra
  touchMultiplier: 1.5,
  // NO actives smoothTouch en móvil: pelea con el scroll nativo y marea. Déjalo nativo.
});
```
- **`lerp` alternativa** (0–1, interpolación por frame): `lerp: 0.08` ≈ suave premium; más bajo = más lento. Usa lerp **o** duration, no los dos.
- Móvil: deja el scroll táctil nativo (no `smoothTouch`). El smooth es para rueda/trackpad de escritorio.
- `reduced-motion`: ni instancies Lenis (ya está cubierto). El scroll nativo del navegador es el fallback correcto.

---

## Sticky / pin que funcionan

Con Lenis, **no uses `position: sticky` para efectos coordinados con animación**:
el sticky de CSS y ScrollTrigger miden distinto y se desincronizan. Usa el `pin`
de ScrollTrigger (como ya hace `Featured.astro`):

```ts
ScrollTrigger.create({
  trigger: '.sticky-section',
  start: 'top top', end: '+=120%',
  pin: true, pinSpacing: true, anticipatePin: 1,
  invalidateOnRefresh: true,        // recalcula al redimensionar / refresh post-navegación
});
```
- `pinType` lo gestiona ScrollTrigger solo; con Lenis (que mueve `transform`, no `scrollTop`) ScrollTrigger detecta y usa `transform` correctamente porque le pasamos `ScrollTrigger.update`.
- `position: sticky` puro **sí** vale para cosas no animadas (un header, una columna de ficha) — eso no necesita ScrollTrigger y convive bien.

---

## Scrubbing suave

`scrub: 1` (número, no `true`) añade ~1s de inercia al seguir el scroll → se
siente premium y disimula el jitter. Para parallax de imágenes de obra:

```ts
gsap.to('.obra-parallax', {
  yPercent: -12, ease: 'none',
  scrollTrigger: { trigger: '.obra-parallax', start: 'top bottom', end: 'bottom top', scrub: 1 },
});
```
`ease: 'none'` en scrubs: la curva la da el scroll, no el tween.

---

## Scroll-lock en modal / lightbox (crítico)

El lightbox de la ficha ([obras/[slug].astro](../../../src/pages/obras/[slug].astro), `data-zoom`) y cualquier modal deben **congelar el scroll de fondo**. Con Lenis
NO basta `overflow:hidden` en body (Lenis ignora el overflow del DOM). Usa su API:

```ts
const lenis = (window as any).__lenis;
function openLightbox() {
  lenis?.stop();                          // congela el scroll virtual de fondo
  document.documentElement.classList.add('is-locked');   // por si no hay Lenis (reduced-motion)
}
function closeLightbox() {
  lenis?.start();
  document.documentElement.classList.remove('is-locked');
}
```
```css
/* Fallback cuando Lenis no está activo (reduced-motion / sin smooth) */
.is-locked, .is-locked body { overflow: hidden; touch-action: none; }
```
- Si el modal tiene su propio contenido scrollable, márcalo con `data-lenis-prevent` para que Lenis no robe ese scroll interno:
  ```html
  <div class="modal__scroll" data-lenis-prevent> … </div>
  ```
- Al cerrar, **siempre** `lenis.start()`. Olvidarlo deja la página muerta.

---

## Scroll-to (anclas, "volver arriba", menú)

No uses `scrollIntoView` ni `window.scrollTo` con Lenis activo (lo ignora o pelea).
Usa la API de Lenis, con fallback nativo:

```ts
function scrollToTarget(target: string | HTMLElement) {
  const lenis = (window as any).__lenis;
  if (lenis) lenis.scrollTo(target, { offset: -96, duration: 1.2 });  // -96 = altura header
  else (typeof target === 'string' ? document.querySelector(target) : target)
        ?.scrollIntoView({ behavior: 'smooth' });
}
```
`scroll-padding-top: 6rem` ya está en `global.css` para el fallback de anclas.

---

## Errores comunes a evitar

1. **Olvidar `lenis.on('scroll', ScrollTrigger.update)`** → EL bug clásico: pins y reveals congelados. Es la línea nº1.
2. **Dos bucles de raf** (Lenis con su propio loop *y* el ticker de GSAP) → jitter/tearing. Un solo raf: el ticker conduce `lenis.raf`.
3. **No `ScrollTrigger.refresh()` tras navegar** → con View Transitions el documento persiste; sin refresh las medidas son de la página anterior.
4. **`overflow:hidden` para bloquear scroll en modal** → Lenis lo ignora. Usa `lenis.stop()/start()`.
5. **No volver a `lenis.start()`** al cerrar el modal → página congelada.
6. **`smoothTouch` en móvil** → marea y rompe gestos nativos. Déjalo nativo.
7. **Crear un segundo `new Lenis`** en un componente → dos motores peleando. Reusa `window.__lenis`.
8. **`scrollIntoView`/`scrollTo` nativo con Lenis activo** → salto brusco. Usa `lenis.scrollTo`.
9. **No destruir Lenis en `before-swap`** → instancia huérfana tras navegar. `stop()` ya lo hace; replícalo en cualquier init alternativo.
10. **Ignorar reduced-motion** → no instancies Lenis; scroll nativo.

---

## Compatibilidad con View Transitions de Astro

- El ciclo está resuelto: `start()` + `refresh()` en `astro:page-load`, `stop()` (destroy) en `astro:before-swap`. Lenis se recrea limpio en cada navegación.
- Durante la transición visual (swap del DOM) el scroll debe estar quieto: como destruimos Lenis en `before-swap` y lo recreamos en `page-load`, no hay scroll virtual a medias.
- Si una transición de página anima posición (ver `astro-view-transitions-skill`), no toques `scrollTop` manualmente: deja que Lenis se reinicie en top (o usa `lenis.scrollTo(0,{immediate:true})` en `after-swap` si quieres forzar inicio arriba).

---

## Integración con el resto del stack

- **GSAP** (`gsap-cinematic-skill`): todo ScrollTrigger depende de este contrato; no funciona sin él. Engancha tweens al `gsap.ticker`, nunca a un raf propio.
- **WebGL** (`webgl-displacement-skill`): lee `window.__lenis.on('scroll', …)` para alimentar dirección/intensidad del shader con la velocidad del scroll.
- **View Transitions** (`astro-view-transitions-skill`): comparten el ciclo `page-load`/`before-swap`/`after-swap`.
- **Loader** (`cinematic-loader-skill`): mantén `lenis.stop()` mientras el loader cubre la pantalla y `lenis.start()` al revelar el contenido, para que el usuario no scrollee bajo el loader.
