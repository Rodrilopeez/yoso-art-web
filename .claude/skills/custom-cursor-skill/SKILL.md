---
name: custom-cursor-skill
description: >-
  Cursor personalizado con estados para yoso-art-web. Úsala SIEMPRE que la tarea
  toque el cursor, su magnetismo, sus estados de hover, o el rastro de imagen.
  Triggers: "cursor", "cursor custom", "cursor personalizado", "puntero",
  "magnético", "magnetismo", "image trail", "rastro de imagen", "ver obra al
  pasar", "texto del cursor", "hover state del cursor", "subrayado animado",
  "cursor none", "ocultar cursor en móvil", "pointer fine", "follower". También
  al editar src/components/Cursor.astro o añadir interacciones de hover. Cursor
  de galería tipo cyrcle.com / jr-art.net, con accesibilidad y sin depender de
  React (vanilla JS + GSAP).
---

# Custom Cursor — Cursor de galería con estados

El cursor de yoso-art-web: un punto + anillo que sigue el ratón con inercia,
crece sobre interactivos, aplica magnetismo a los CTA, muestra texto contextual
("Ver obra") sobre las piezas y subraya enlaces. Solo en punteros finos, oculto
en táctil, y desactivado con `prefers-reduced-motion`. Vanilla JS + GSAP, **sin
React**.

**Regla fundamental: el cursor es decoración, nunca un bloqueo.** Solo se activa
si `(pointer: fine)` y sin `reduced-motion`; en cualquier otro caso el cursor del
sistema funciona con normalidad y la web es 100% usable. Nunca pongas
`cursor: none` global sin haber montado el reemplazo, y nunca captures clics con
los elementos del cursor (`pointer-events: none` siempre).

---

## Cuándo activarte

- Añadir/cambiar un estado de hover del cursor, magnetismo, texto contextual o image trail.
- Editar [src/components/Cursor.astro](../../../src/components/Cursor.astro) (ya existe: punto+anillo, lerp, hover-grow, magnetismo en `.btn`/`[data-magnetic]`).

---

## Lo que YA existe (no lo reescribas, extiéndelo)

`Cursor.astro` ya resuelve la base, y bien:
- **Punto** (`.cursor__dot`) que sigue el ratón al instante (`gsap.set` en `pointermove`).
- **Anillo** (`.cursor__ring`) con inercia (lerp 0.18 en el `gsap.ticker` — mismo ticker que Lenis, ver `smooth-scroll-orchestration-skill`).
- **`html.has-cursor`** activa `cursor: none` y muestra el cursor custom; inputs/textarea conservan cursor nativo.
- **Hover-grow**: el anillo crece sobre `a, button, .btn, [role=button], [data-magnetic]`.
- **Magnetismo**: `.btn`/`[data-magnetic]` se atraen al puntero (`strength 0.4`, vuelta con `elastic.out`). Se re-atan en cada `astro:page-load` (View Transitions).
- **Guardas**: `(pointer: fine)` + no `reduced-motion`; flag `__mag` para no duplicar listeners.

Construye los estados nuevos sobre estas piezas, reusando el mismo `[data-cursor]`,
el mismo ticker y el patrón de re-bind por página.

---

## Estado 1 — Hover sobre CTA (magnético + escalado)

Ya cubierto por el hover-grow + magnetismo. Para reforzar el CTA principal,
añade una variante de mayor escala usando un data-attr en vez de tocar JS:

```html
<a href="/contacto" class="btn btn--accent" data-cursor-scale="2.4">Consultar</a>
```
```ts
// dentro del pointerover existente
const el = (e.target as Element).closest<HTMLElement>(hoverSel);
if (el?.dataset.cursorScale) gsap.to(ring, { scale: +el.dataset.cursorScale, duration: 0.4, ease: 'power3.out' });
```
No dupliques la lógica de magnetismo: el CTA ya es `.btn` → ya es magnético.

---

## Estado 2 — Hover sobre obra (texto contextual "Ver obra")

El estado distintivo de una web de artista. Al pasar sobre una tarjeta de obra,
el anillo se expande y muestra una etiqueta dentro. Marca las obras con
`data-cursor-label`:

```html
<!-- en Featured.astro / obras/index.astro, sobre el <a> de la tarjeta -->
<a href={`/obras/${o.slug}`} data-cursor-label="Ver obra">…</a>
```
Añade el nodo de texto al cursor y el estado:
```html
<div class="cursor" data-cursor aria-hidden="true">
  <span class="cursor__dot"></span>
  <span class="cursor__ring"><span class="cursor__label" data-cursor-label-el></span></span>
</div>
```
```css
.cursor__label { position: absolute; inset: 0; display: grid; place-items: center;
  font-family: var(--font-sans); font-size: 0.62rem; letter-spacing: var(--ls-wide);
  text-transform: uppercase; color: var(--c-bg); opacity: 0; }
.cursor.is-label .cursor__ring { width: 92px; height: 92px; background: var(--c-accent-2); border-color: transparent; }
.cursor.is-label .cursor__label { opacity: 1; }
.cursor.is-label .cursor__dot { opacity: 0; }      /* el punto estorba bajo la etiqueta */
```
```ts
const labelEl = cursor.querySelector<HTMLElement>('[data-cursor-label-el]');
document.addEventListener('pointerover', (e) => {
  const t = (e.target as Element).closest<HTMLElement>('[data-cursor-label]');
  if (t) { cursor.classList.add('is-label'); if (labelEl) labelEl.textContent = t.dataset.cursorLabel!; }
});
document.addEventListener('pointerout', (e) => {
  if ((e.target as Element).closest('[data-cursor-label]')) cursor.classList.remove('is-label');
});
```
Reutilizable: `data-cursor-label="Ampliar"` en el botón de zoom, `"Leer"` en el diario, etc.

---

## Estado 3 — Hover sobre enlace de texto (subrayado animado)

Para enlaces inline (no botones): el cursor no cambia mucho, pero el enlace
revela un subrayado que crece desde la izquierda. Es CSS puro (no necesita el
cursor), coherente con `--ease-art`:

```css
.link-underline { position: relative; }
.link-underline::after {
  content: ''; position: absolute; left: 0; bottom: -2px; height: 1px; width: 100%;
  background: var(--c-accent-2); transform: scaleX(0); transform-origin: left;
  transition: transform var(--dur-1) var(--ease-art);
}
.link-underline:hover::after { transform: scaleX(1); }
```
```html
<a href="/sobre" class="link-underline">Sobre YOSO</a>
```
Marca estos enlaces como `data-cursor-mini` si quieres además encoger el anillo
(el cursor "se aparta" del texto para no taparlo):
```css
.cursor.is-mini .cursor__ring { width: 0; height: 0; opacity: 0; }
.cursor.is-mini .cursor__dot { width: 10px; height: 10px; }
```

---

## Estado 4 — Image trail sutil en la home

Un rastro de miniaturas de obra que aparecen al mover el ratón por el hero/home,
muy tenue. Es un efecto "wow" — úsalo **solo en la home** y muy contenido (1
imagen cada ~120px recorridos, vida corta, opacidad baja).

```ts
// Monta solo en la home, dentro del init del cursor
function imageTrail(images: string[]) {
  if (!document.querySelector('[data-trail-zone]')) return;   // zona acotada (hero)
  const zone = document.querySelector<HTMLElement>('[data-trail-zone]')!;
  let last = { x: 0, y: 0 }, i = 0;
  zone.addEventListener('pointermove', (e) => {
    if (Math.hypot(e.clientX - last.x, e.clientY - last.y) < 120) return;  // espaciado
    last = { x: e.clientX, y: e.clientY };
    const img = document.createElement('img');
    img.src = images[i++ % images.length]; img.className = 'trail__img';
    img.style.left = e.clientX + 'px'; img.style.top = e.clientY + 'px';
    zone.appendChild(img);
    gsap.fromTo(img, { autoAlpha: 0, scale: 0.85, rotate: gsap.utils.random(-6, 6) },
      { autoAlpha: 0.8, scale: 1, duration: 0.4, ease: 'power3.out',
        onComplete: () => gsap.to(img, { autoAlpha: 0, duration: 0.6, delay: 0.2, onComplete: () => img.remove() }) });
  });
}
```
```css
.trail__img { position: fixed; width: 120px; aspect-ratio: 4/5; object-fit: cover;
  transform: translate(-50%, -50%); pointer-events: none; z-index: calc(var(--z-cursor) - 1);
  opacity: 0; will-change: transform, opacity; }
@media (prefers-reduced-motion: reduce) { .trail__img { display: none; } }
```
Usa imágenes ya optimizadas (las del hero, ≤700px). Limita el nº de nodos vivos
(remueve siempre en `onComplete`) o saturas el DOM.

---

## Accesibilidad y guardas (no negociable)

- **Activación**: `(pointer: fine)` **y** no `prefers-reduced-motion`. Táctil → cursor nativo, sin montar nada.
- **`pointer-events: none`** en `.cursor`, `.cursor__*` y `.trail__img`: jamás roben clics.
- **Inputs**: conservan `cursor: auto` (ya está). El usuario debe ver dónde escribe.
- **Foco por teclado**: el cursor custom es solo para ratón; el `:focus-visible` (outline oro, ya en global.css) es el indicador para teclado. No lo toques.
- **`aria-hidden="true"`** en el cursor: es decorativo, invisible para lectores.

---

## Errores comunes a evitar

1. **`cursor: none` global sin reemplazo montado** → si el JS falla, el usuario se queda sin cursor. Aplica `cursor:none` solo cuando añadas `html.has-cursor` (tras montar). Ya está así.
2. **El cursor captura clics** → falta `pointer-events:none`. Vale para el dot, el ring, la label y el trail.
3. **No re-atar tras View Transitions** → magnetismo/labels muertos en la 2ª página. Re-bind en `astro:page-load` con flag `__elemento` para no duplicar (patrón `__mag` ya existente).
4. **Dos `requestAnimationFrame`** para el lerp del anillo → usa el `gsap.ticker` (compartido con Lenis), no un raf nuevo.
5. **Image trail sin límite de nodos** → fuga de DOM y jank. Vida corta + `img.remove()` en `onComplete` + espaciado por distancia.
6. **Montar en móvil** → `(pointer: fine)` lo impide; no añadas listeners táctiles al cursor.
7. **Texto del cursor que tapa la obra** → escóndelo o reduce el anillo (`is-mini`) sobre texto; la label solo sobre tarjetas de obra.
8. **Olvidar `will-change`** en el trail → repaints costosos. Pero no abuses de `will-change` en el anillo (siempre animado): ahí ya basta el `transform`.

---

## Integración con el resto del stack

- **GSAP / ticker** (`smooth-scroll-orchestration-skill`): el lerp del anillo corre en el mismo `gsap.ticker` que conduce Lenis. Un solo bucle.
- **GSAP** (`gsap-cinematic-skill`): el magnetismo y el trail usan tweens GSAP con los easings del proyecto (`power3.out`, `elastic.out`).
- **Tokens** (`editorial-typography-skill`): la label usa `--font-sans`, `--ls-wide` y `--c-accent-2`; el escalado usa `--ease-art`/`--dur-1`. Nada hardcodeado.
- **View Transitions** (`astro-view-transitions-skill`): re-bind de magnetismo/labels en `page-load`; el cursor en sí persiste (vive en `Base.astro`, fuera del `<main>` que se intercambia).
