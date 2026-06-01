---
name: cinematic-loader-skill
description: >-
  Loaders curados (no spinners) para la entrada de yoso-art-web. Úsala SIEMPRE
  que la tarea toque la pantalla de carga inicial, el preloader, el contador, o
  la transición del loader al contenido. Triggers: "loader", "preloader",
  "pantalla de carga", "splash", "intro", "contador", "0 al 100", "porcentaje de
  carga", "barra de progreso", "línea de carga", "nombre que se revela",
  "mascarado tipográfico", "SplitText loader", "primera visita", "sessionStorage
  loader", "spinner", "loading screen", "cortina de entrada". También al editar
  src/components/Loader.astro o coordinar la entrada con el hero. Entrada
  cinematográfica tipo cyrcle.com / jr-art.net, una sola vez por sesión.
---

# Cinematic Loader — Entrada curada, no spinner

La pantalla de entrada de yoso-art-web: una cortina con tipografía de galería que
se muestra **solo en la primera visita de la sesión**, dura lo que tarda la carga
real (ni más ni menos) y se retira con una transición elegante que da paso al
hero —nunca un corte brusco ni un spinner genérico.

**Regla fundamental: el loader nunca debe retrasar al usuario.** Si la página ya
cargó, sale. Si es una navegación interna (View Transitions), no aparece. Una
sola vez por sesión (`sessionStorage`). Y SIEMPRE se quita, pase lo que pase
(timeout de seguridad): un loader atascado es peor que no tener loader.

---

## Cuándo activarte

- Diseñar/ajustar la pantalla de carga inicial o su salida hacia el contenido.
- Editar [src/components/Loader.astro](../../../src/components/Loader.astro) (ya existe: marca «YOSO» + línea, timeline GSAP, one-time por sesión).
- Coordinar el arranque del hero/animaciones con el final del loader.

---

## Lo que YA existe (extiéndelo, no lo reescribas)

`Loader.astro` resuelve la base correctamente:
- **One-time por sesión**: `sessionStorage('yoso_loaded')` → en navegaciones siguientes se hace `loader.remove()` y no parpadea.
- **Respeta `reduced-motion`**: se quita sin animar.
- **Bloquea scroll** mientras cubre (`body.overflow = hidden`) y lo restaura al terminar.
- **Salida cinematográfica**: marca aparece → línea crece a 120px → cortina sube (`yPercent:-100`, `power4.inOut`).
- Vive en `Base.astro`, se dispara en `astro:page-load`.

Lo que conviene **añadir**: sincronizar la duración con la **carga real** (hoy es
fija), un timeout de seguridad, coordinar con el reveal del hero, y ofrecer los
tres patrones visuales del briefing.

---

## Sincronizar con la carga real (clave del "ni más ni menos")

Hoy el timeline dura ~2.2s fijos. Mejor: avanzar con el progreso real y cerrar
en cuanto la página está lista, con un mínimo de cortesía (que no parpadee) y un
máximo de seguridad (que no se cuelgue).

```ts
function handleLoader() {
  const loader = document.querySelector<HTMLElement>('[data-loader]');
  if (!loader) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (sessionStorage.getItem('yoso_loaded') || reduce) { loader.remove(); return; }
  sessionStorage.setItem('yoso_loaded', '1');

  loader.hidden = false;
  const lenis = (window as any).__lenis;
  lenis?.stop();                                   // congela scroll bajo el loader (mejor que overflow)
  document.documentElement.classList.add('is-locked');

  const MIN = 900;                                 // cortesía: no menos de 0.9s
  const start = performance.now();
  let done = false;

  const finish = () => {
    if (done) return; done = true;
    const waited = performance.now() - start;
    const delay = Math.max(0, MIN - waited);        // respeta el mínimo
    gsap.to(loader, { yPercent: -100, duration: 0.9, ease: 'power4.inOut', delay: delay / 1000,
      onComplete: () => { lenis?.start(); document.documentElement.classList.remove('is-locked');
        loader.remove(); revealHero(); } });        // pasa el testigo al hero
  };

  // cierra cuando la página está realmente lista…
  if (document.readyState === 'complete') finish();
  else window.addEventListener('load', finish, { once: true });
  // …o como muy tarde a los 4s (timeout de seguridad: nunca atascado)
  setTimeout(finish, 4000);
}
```

`revealHero()` arranca la animación del nombre del hero (`webgl`/`SplitText`)
**al terminar** el loader, no antes — evita animar contenido que está tapado.

---

## Patrón 1 — Contador numérico 0→100 (tipografía display)

Cifra grande en Fraunces que cuenta hasta 100 mientras carga. Si tienes progreso
real, mapéalo; si no, interpola suave hasta 100 y engancha el cierre a `load`.

```html
<div class="loader" data-loader hidden aria-hidden="true">
  <span class="loader__count" data-count>0</span>
</div>
```
```css
.loader__count { font-family: var(--font-display); font-weight: var(--fw-semi);
  font-size: var(--fs-mega); line-height: 1; color: var(--c-ink);
  font-variant-numeric: tabular-nums; }   /* las cifras no "bailan" al cambiar */
```
```ts
const el = loader.querySelector<HTMLElement>('[data-count]')!;
const n = { v: 0 };
gsap.to(n, { v: 100, duration: 2.4, ease: 'power1.inOut',
  onUpdate: () => { el.textContent = String(Math.round(n.v)); },
  onComplete: finish });
// con progreso real: gsap.to(n, { v: targetPct, duration: 0.3 }) en cada evento de carga
```
`tabular-nums` (ya disponible vía `editorial-typography-skill`) evita el salto de
ancho entre dígitos.

---

## Patrón 2 — Línea progresiva + nombre que se revela

Evolución del loader actual: la línea se completa de 0→100% del ancho y, al
llegar, el nombre «YOSO» se revela con máscara.

```ts
const tl = gsap.timeline({ onComplete: finish });
tl.fromTo(line, { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'power2.inOut', transformOrigin: 'left' })
  .from(splitName.chars, { yPercent: 110, stagger: 0.05, duration: 0.7, ease: 'power4.out' }, '-=0.3');
```
```css
.loader__line { width: min(60vw, 420px); height: 1px; background: var(--c-accent); }
.loader__mark { overflow: hidden; }   /* máscara para que las letras suban desde detrás */
```
Usa `scaleX` (GPU) en vez de animar `width` (reflow).

---

## Patrón 3 — Mascarado tipográfico con SplitText

El nombre entra letra a letra desde detrás de una máscara, sin línea ni contador
— el más sobrio y "galería". Es el `mask` de SplitText (ver `gsap-cinematic-skill`):

```ts
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);
const split = new SplitText('.loader__mark', { type: 'chars', mask: 'chars' });
gsap.timeline({ onComplete: finish })
  .from(split.chars, { yPercent: 120, stagger: 0.06, duration: 0.8, ease: 'power4.out' })
  .to('.loader__mark', { letterSpacing: '0.4em', duration: 0.6, ease: 'power2.inOut' }, '-=0.2')
  .to(loader, { autoAlpha: 0, duration: 0.6 });    // este patrón funde en vez de levantar cortina
```
Acuérdate de `split.revert()` si el loader pudiera re-montarse (no debería, por el
`sessionStorage`, pero es buena higiene).

---

## Transición elegante al contenido (no corte brusco)

- **Cortina que sube** (`yPercent:-100`, `power4.inOut`) o **fade** (`autoAlpha`), nunca `display:none` seco.
- Pasa el testigo: el `onComplete` del loader llama a `revealHero()`. El hero **no** anima su nombre hasta entonces (coordínalo: el hero comprueba una bandera o escucha un evento `yoso:loaded`).
  ```ts
  // en el loader, al terminar:
  document.dispatchEvent(new CustomEvent('yoso:loaded'));
  // en Hero.astro: if (sessionStorage.getItem('yoso_loaded')) initName(); else document.addEventListener('yoso:loaded', initName, { once:true });
  ```
- Mantén el fondo del loader en `--c-bg` (idéntico al body) para que el cambio sea solo de capas, sin destello.

---

## Errores comunes a evitar

1. **Loader que no se quita nunca** (espera un `load` que no llega, imágenes rotas) → SIEMPRE un `setTimeout(finish, 4000)` de seguridad y `done` para no cerrar dos veces.
2. **Aparece en navegaciones internas** → con View Transitions parpadearía en cada página. `sessionStorage` + `hidden` por defecto ya lo evitan; no lo rompas.
3. **Duración fija larga** → hace esperar a quien ya tenía todo cargado. Engánchalo a la carga real con mínimo de cortesía.
4. **Bloquear con `overflow:hidden` y olvidar Lenis** → el scroll virtual sigue activo bajo el loader. Usa `lenis.stop()/start()` (ver `smooth-scroll-orchestration-skill`).
5. **Animar el hero bajo el loader** → trabajo invisible y desincronía. Revélalo en el `onComplete`/evento.
6. **No respetar `reduced-motion`** → quítalo sin animación (ya lo hace).
7. **`transition:persist` en el loader** → se congela y no vuelve a comportarse bien. Nunca lo persistas (ver `astro-view-transitions-skill`).
8. **Animar `width`/`left`** del progreso → reflow. Usa `scaleX`/`transform`.
9. **Cifras sin `tabular-nums`** → el contador "salta" de ancho. Actívalo.
10. **Olvidar restaurar `body`/scroll** si el loader falla a mitad → deja la página bloqueada. Restaura en `onComplete` y en el timeout.

---

## Integración con el resto del stack

- **Lenis** (`smooth-scroll-orchestration-skill`): `lenis.stop()` mientras el loader cubre, `lenis.start()` al revelar.
- **GSAP / SplitText** (`gsap-cinematic-skill`): el mascarado tipográfico usa el mismo `mask` de SplitText y los easings del proyecto (`power4.out`, `power4.inOut`).
- **Tipografía** (`editorial-typography-skill`): contador y marca usan `--font-display`, `--fs-mega` y `tabular-nums`. Coherencia con el resto.
- **View Transitions** (`astro-view-transitions-skill`): el loader se dispara en `astro:page-load` pero solo actúa en la primera carga; jamás se persiste.
- **WebGL / Hero** (`webgl-displacement-skill`): el reveal del nombre y el arranque del shader del hero se coordinan con el final del loader (evento `yoso:loaded`).
