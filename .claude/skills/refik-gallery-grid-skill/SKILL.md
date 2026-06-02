---
name: refik-gallery-grid-skill
description: >-
  Galería de obra tipo Refik Anadol para yoso-art-web: grid en negro absoluto,
  miniatura limpia, hover con glow del color de acento propio de cada obra,
  escalado suave y revelado de info editorial. Úsala SIEMPRE que la tarea toque
  una rejilla de obras/series/esculturas/proyectos o su comportamiento de hover.
  Triggers: "galería", "grid", "rejilla", "obras", "series", "esculturas",
  "miniaturas", "hover glow", "color de acento", "accentColor", "tap to reveal",
  "revelar título al pasar", "box-shadow glow", "escalado de miniatura",
  "lazy loading imágenes", "IntersectionObserver", "patrón Refik", "galería
  oscura". También al editar /obras, /series o crear una galería nueva. Patrón
  de refikanadol.com aplicado a yoso.art con identidad propia (no copia).
---

# Refik Gallery Grid — Galería oscura con glow por obra

El patrón de galería de yoso.art: fondo negro absoluto, cada obra sola (sin
ruido), y al pasar el cursor la miniatura **se ilumina con su propio color de
acento**, escala suavemente y revela título + técnica en tipografía editorial.
En móvil, tap-to-reveal. Reutilizable en `/obras`, `/series`, esculturas y
proyectos para coherencia visual total.

**Regla fundamental: la obra es la protagonista; el cromo es invisible hasta que
hace falta.** Por defecto solo se ve la imagen sobre negro. La información y el
glow aparecen en la interacción, nunca compiten con la obra. Cada glow usa el
color real de SU obra, no un acento global.

---

## Patrón extraído de Refik Anadol (comportamiento, no copia)

- **Grid sobre negro absoluto**, miniaturas a sangre sin marcos ni texto visible.
- **Hover**: la pieza cobra vida — leve resplandor de color propio, escala sutil, y aparece la información.
- Lo aplicamos con identidad yoso: negro `#0c0c0d` (`--c-bg`), Fraunces para títulos, ease `--ease-art`, y un `accentColor` por obra extraído de la propia imagen.

---

## Paso previo: `accentColor` por obra (en los datos)

Cada obra necesita un color de acento. Como aún no hay CMS, se añade al modelo
`Obra` en [src/lib/obras.ts](../../../src/lib/obras.ts):

```ts
export interface Obra {
  // …campos existentes…
  accentColor: string;   // hex del color de acento (glow). p.ej. '#b8905a'
}
```
Origen del color, por prioridad:
1. **Asignado a mano** (mejor): un mapa `ACCENTS: Record<slug, string>` curado. Es lo más fiel a la intención del artista.
2. **Extraído programáticamente** del dominante de la imagen, en build (Node + sharp, ya instalado):
   ```js
   // scripts/extract-accents.mjs — genera/actualiza el mapa de acentos
   import sharp from 'sharp';
   const { dominant } = await sharp(path).stats();   // {r,g,b}
   const hex = '#' + [dominant.r, dominant.g, dominant.b].map(n => n.toString(16).padStart(2,'0')).join('');
   ```
   Súbele un poco la saturación/luminosidad para que el glow luzca sobre negro.
3. **Provisional**: si falta, usa `--c-accent` (#b8905a) y deja un comentario `// TODO accentColor` para que el cliente lo revise.

> Honestidad de datos: no inventes un color "bonito" por capricho; o lo asigna el
> cliente, o se extrae de la obra, o es el provisional marcado como TODO.

---

## Markup de la galería (reutilizable)

Patrón base que sirve para /obras, /series, etc. El color viaja por
`--accent` (custom property inline) para que el CSS lo use en glow y detalles.

```astro
---
import { Image } from 'astro:assets';
import { obras } from '../lib/obras';
---
<ul class="rgrid" data-rgrid>
  {obras.map((o, i) => (
    <li class="rgrid__cell" style={`--accent:${o.accentColor}`}>
      <a class="rgrid__link" href={`/obras/${o.slug}`}
         data-reveal aria-label={`${o.title} — ${o.catLabel}`}>
        <span class="rgrid__media">
          <Image src={o.image} alt={`«${o.title}» — ${o.catLabel.toLowerCase()} de YOSO`}
            widths={[400, 700, 1000]} sizes="(max-width:600px) 50vw, (max-width:1100px) 33vw, 25vw"
            loading={i < 6 ? 'eager' : 'lazy'} />
        </span>
        <span class="rgrid__info" aria-hidden="true">
          <span class="rgrid__title" data-split>{o.title}</span>
          <span class="rgrid__tec">{o.catLabel}</span>
        </span>
      </a>
    </li>
  ))}
</ul>
```

---

## Estilos — negro, glow de acento, escalado

```css
.rgrid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: clamp(.5rem, 1.4vw, 1.25rem);
  background: var(--c-bg);                 /* negro absoluto del proyecto */
}
.rgrid__link { position: relative; display: block; isolation: isolate; }
.rgrid__media { display: block; aspect-ratio: 4/5; overflow: hidden; background: #000; }
.rgrid__media :global(img) {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform var(--dur-2) var(--ease-art), filter var(--dur-2) var(--ease-art);
  filter: saturate(.9) brightness(.86);    /* apagada en reposo; revive en hover */
}

/* Glow del color propio + escalado suave (1.03) */
.rgrid__link { transition: box-shadow var(--dur-2) var(--ease-art), transform var(--dur-2) var(--ease-art); }
.rgrid__link:hover, .rgrid__link:focus-visible, .rgrid__cell.is-revealed .rgrid__link {
  transform: scale(1.03);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 50%, transparent),
              0 18px 60px -12px color-mix(in srgb, var(--accent) 65%, transparent);
  z-index: 2;
}
.rgrid__link:hover .rgrid__media :global(img),
.rgrid__link:focus-visible .rgrid__media :global(img),
.rgrid__cell.is-revealed .rgrid__media :global(img) { filter: saturate(1.05) brightness(1); }

/* Info revelada (oculta por defecto) */
.rgrid__info {
  position: absolute; left: 0; right: 0; bottom: 0; z-index: 3;
  display: flex; justify-content: space-between; align-items: baseline; gap: 1rem;
  padding: clamp(.7rem,1.5vw,1.1rem);
  background: linear-gradient(to top, rgba(12,12,13,.85), transparent);
  opacity: 0; transform: translateY(8px);
  transition: opacity var(--dur-1) var(--ease-art), transform var(--dur-1) var(--ease-art);
}
.rgrid__link:hover .rgrid__info,
.rgrid__link:focus-visible .rgrid__info,
.rgrid__cell.is-revealed .rgrid__info { opacity: 1; transform: none; }
.rgrid__title { font-family: var(--font-display); font-size: var(--fs-h3); color: var(--c-ink); }
.rgrid__tec { font-size: var(--fs-eyebrow); letter-spacing: var(--ls-wide); text-transform: uppercase; color: var(--accent); white-space: nowrap; }

@media (max-width: 1100px) { .rgrid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px)  { .rgrid { grid-template-columns: 1fr; } }
```
- `color-mix` aplica el glow con el `--accent` de cada celda — un solo CSS, N colores.
- El estado `.is-revealed` (lo pone el JS de móvil) reusa exactamente el mismo look que `:hover`.

---

## Comportamiento JS — reveal con SplitText, tap móvil, lazy

```ts
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
gsap.registerPlugin(SplitText);

function initGrid() {
  const grid = document.querySelector<HTMLElement>('[data-rgrid]');
  if (!grid) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

  // Revelado editorial del título letra a letra al entrar en hover (desktop).
  if (!reduce && !coarse) {
    grid.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
      const split = new SplitText(el, { type: 'chars' });
      el.closest('.rgrid__link')?.addEventListener('pointerenter', () => {
        gsap.fromTo(split.chars, { yPercent: 110 }, { yPercent: 0, stagger: 0.012, duration: 0.5, ease: 'power4.out' });
      });
    });
  }

  // Móvil/táctil: tap-to-reveal. Primer tap revela; segundo tap navega.
  if (coarse) {
    grid.querySelectorAll<HTMLElement>('.rgrid__cell').forEach((cell) => {
      const link = cell.querySelector<HTMLAnchorElement>('.rgrid__link')!;
      link.addEventListener('click', (e) => {
        if (!cell.classList.contains('is-revealed')) {
          e.preventDefault();
          grid.querySelectorAll('.is-revealed').forEach((c) => c !== cell && c.classList.remove('is-revealed'));
          cell.classList.add('is-revealed');
        }
        // segundo tap (ya revelada): deja pasar la navegación
      });
    });
  }
}
document.addEventListener('astro:page-load', initGrid);
```

**Lazy loading**: `<Image>` de astro:assets ya hace `loading="lazy"` (las 6
primeras `eager` para el primer viewport). Si quieres un fade-in al entrar en
viewport, añade un `IntersectionObserver` que ponga `.is-in`:
```ts
const io = new IntersectionObserver((es) => es.forEach(e => e.isIntersecting && (e.target.classList.add('is-in'), io.unobserve(e.target))), { rootMargin: '0px 0px -8% 0px' });
grid.querySelectorAll('.rgrid__cell').forEach(c => io.observe(c));
```

---

## Errores comunes a evitar

1. **Glow con acento global** en vez del de cada obra → todas iguales, se pierde la idea. Usa `--accent` por celda + `color-mix`.
2. **Inventar el `accentColor`** → o lo asigna el cliente, o se extrae de la imagen, o es provisional con TODO. Nunca un color al azar "porque queda bien".
3. **Info siempre visible** → rompe el patrón Refik. Oculta por defecto, revela en hover/tap/focus.
4. **Sin `:focus-visible`** → inaccesible por teclado. Replica el estado hover en focus (ya está en el CSS).
5. **Hover en móvil** → no existe; implementa tap-to-reveal (primer tap revela, segundo navega).
6. **Escalado agresivo** → el brief pide 1.02–1.05. `scale(1.03)`; más es aparatoso.
7. **SplitText sin limpiar** → en táctil ni lo montes; en desktop, revierte en `astro:before-swap` (ver `gsap-cinematic-skill`).
8. **No apagar la imagen en reposo** → si todas brillan igual, el hover no destaca. `brightness(.86)` en reposo, `1` en hover.
9. **Cargar todo eager** → mata el LCP. Solo el primer viewport eager; resto lazy.

---

## Reutilización (coherencia total)

Extrae el grid a un componente único, p. ej. `src/components/RefikGrid.astro`,
que reciba la lista de items `{ slug, title, catLabel, image, accentColor, href }`
y úsalo en `/obras`, `/series`, esculturas y proyectos. Un solo patrón → misma
sensación en toda la web (lo pide la FASE 5).

---

## Integración con el resto del stack

- **Datos** (`art-portfolio-architecture-skill` / `sanity-art-cms-skill`): `accentColor` es un campo nuevo del modelo `Obra`; cuando llegue Sanity, será un campo `color` del documento (no se pierde el trabajo).
- **GSAP** (`gsap-cinematic-skill`): el revelado del título usa SplitText con `power4.out`; el escalado y glow usan `--ease-art`.
- **View Transitions** (`astro-view-transitions-skill`): cada miniatura conserva su `view-transition-name: obra-<slug>` para el morph a la ficha — compatible con este grid.
- **Tipografía** (`editorial-typography-skill`): título en Fraunces (`--fs-h3`), técnica en Inter mayúsculas con el color de acento de la obra.
- **Cursor**: este patrón NO depende del cursor custom (desactivado en el proyecto); funciona con cursor del sistema.
