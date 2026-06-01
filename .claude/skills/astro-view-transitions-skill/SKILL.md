---
name: astro-view-transitions-skill
description: >-
  Transiciones entre páginas en Astro nativo (ViewTransitions/ClientRouter) para
  yoso-art-web. Úsala SIEMPRE que la tarea toque la navegación entre páginas, el
  morph de miniatura a obra, la persistencia de header/audio, o el ciclo de vida
  de scripts entre rutas. Triggers: "view transitions", "ClientRouter",
  "transición entre páginas", "transition:name", "transition:persist",
  "transition:animate", "morph", "miniatura crece a hero", "elemento
  compartido", "shared element", "fade entre páginas", "persistir header",
  "astro:page-load", "astro:before-swap", "astro:after-swap", "SPA en Astro",
  "navegación sin recarga", "el script no se reejecuta". También al crear páginas
  o coordinar GSAP/Lenis con la navegación. Transiciones tipo cyrcle.com.
---

# Astro View Transitions — Navegación cinematográfica entre páginas

Cómo encadenar las páginas de yoso-art-web sin recargas duras: la miniatura de
una obra **crece hasta el hero** de su ficha, el header persiste, y todo se
funde con elegancia. Usa el `ClientRouter` nativo de Astro (ya activo) más
`transition:name` compartidos y el ciclo de vida de eventos.

**Regla fundamental: el `ClientRouter` mantiene el documento vivo entre páginas,
así que cada script debe (re)inicializarse en `astro:page-load` y limpiarse en
`astro:before-swap`.** Este es el contrato que ya respetan Hero, Featured,
Cursor, Loader y el Lenis de Base. Cualquier script nuevo lo cumple o se rompe en
la segunda navegación.

---

## Cuándo activarte

- Crear el morph miniatura→ficha, un fade entre páginas, o persistir un elemento.
- Una animación/efecto "funciona en recarga pero no al navegar" → casi siempre es el ciclo de vida.
- Editar [src/layouts/Base.astro](../../../src/layouts/Base.astro) (donde vive `<ClientRouter />`) o coordinar GSAP/Lenis con la navegación.

Si es la sincronía del scroll en sí → `smooth-scroll-orchestration-skill`.
Si es la micro-animación interna (SplitText, Flip) → `gsap-cinematic-skill`.

---

## Estado actual

- `<ClientRouter />` **ya está** en `Base.astro` (línea 59): las navegaciones son transiciones, no recargas.
- El ciclo `astro:page-load` / `astro:before-swap` ya lo usan Hero, Featured, Cursor, Loader, contacto, ficha y el Lenis de Base.
- **Aún NO hay** ningún `transition:name` ni `transition:persist`: las páginas se cruzan con el fade por defecto, sin morph de elemento compartido ni persistencia de header. Eso es lo que añade esta skill.

---

## Patrón estrella — la miniatura crece hasta el hero de la ficha

El gesto distintivo de una web de artista. La imagen de la tarjeta en `/obras` y
la imagen grande en `/obras/[slug]` comparten un **mismo `transition:name`**
derivado del slug; el navegador interpola entre ambas posiciones/tamaños.

En la tarjeta ([obras/index.astro](../../../src/pages/obras/index.astro) y [Featured.astro](../../../src/components/Featured.astro)):
```astro
<a href={`/obras/${o.slug}`} class="obra-card__link">
  <span class="obra-card__media">
    <Image src={o.image} alt={…}
      style={`view-transition-name: obra-${o.slug}`} />
  </span>
</a>
```
En la ficha ([obras/[slug].astro](../../../src/pages/obras/[slug].astro)), la misma imagen lleva el **mismo nombre**:
```astro
<Image src={obra.image} alt={…}
  style={`view-transition-name: obra-${obra.slug}`} />
```
- El nombre **debe ser único por página**: por eso `obra-${slug}` (no un nombre fijo compartido por todas las tarjetas, que rompería el morph).
- Astro acepta tanto la directiva `transition:name="..."` como el CSS `view-transition-name`. Para nombres **dinámicos por slug** usa el `style` con `view-transition-name` (la directiva es para nombres estáticos).
- Solo **un** elemento con cada nombre puede estar visible a la vez; al navegar, el de origen y el de destino se emparejan por nombre. Perfecto para 1 tarjeta → 1 hero.

Afinado del morph:
```css
/* duración/curva del morph, coherente con --ease-art */
::view-transition-group(*) { animation-duration: 0.6s; animation-timing-function: cubic-bezier(0.22,1,0.36,1); }
@media (prefers-reduced-motion: reduce) { ::view-transition-group(*) { animation: none; } }
```

---

## Fade entre páginas y animaciones por defecto

Astro trae presets aplicables a cualquier elemento o a `<html>`:
```astro
---
import { fade } from 'astro:transitions';
---
<main transition:animate={fade({ duration: '0.4s' })}> … </main>
```
- Para un fade global suave, aplica `transition:animate` en el contenedor de página o personaliza `::view-transition-old(root)` / `::view-transition-new(root)` en CSS.
- Mantén las duraciones en la franja del proyecto (0.4–0.6s) y el ease `--ease-art`. Lento y deliberado, no instantáneo.

---

## Persistir header / navegación / loader

El header no debe parpadear ni re-animar en cada navegación. Con `transition:persist`
el elemento **sobrevive** al swap (mantiene estado y DOM):
```astro
<!-- en Base.astro -->
<Header transition:persist />
```
- Persistir el header evita re-montar su JS (menú móvil, scroll-state) en cada página.
- **No persistas el `<Loader />`**: debe poder volver a ocultarse/mostrarse según su lógica (primera visita), no congelarse.
- Si persistes un componente con script propio, su `astro:page-load` **no** se vuelve a disparar (no se re-monta); usa `transition:persist` solo cuando quieras justamente eso.
- Para un nombre estable de persistencia entre rutas con distinto árbol, usa `transition:persist="header"`.

---

## El ciclo de vida (memorízalo)

| Evento | Cuándo | Úsalo para |
|---|---|---|
| `astro:before-preparation` | antes de pedir la nueva página | spinners de carga lenta |
| `astro:after-preparation` | nuevo DOM listo, aún no visible | — |
| `astro:before-swap` | justo antes de intercambiar el DOM | **limpiar**: kill GSAP/ScrollTrigger, `lenis.destroy()`, `cancelAnimationFrame`, `loseContext()` de WebGL |
| `astro:after-swap` | DOM ya intercambiado, antes de pintar | restaurar scroll arriba, re-leer tema |
| `astro:page-load` | página lista y visible (también en carga inicial) | **(re)inicializar todo**: Lenis, ScrollTrigger, SplitText, cursor, WebGL |

Plantilla para cualquier componente nuevo con efecto:
```ts
let ctx: any;
function init() {
  ctx = gsap.context(() => { /* tweens, ScrollTriggers */ });
}
document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', () => ctx?.revert());   // mata todo lo del context
```

Micro-animación **dentro** de una transición de página (p. ej. un detalle que
entra tras el swap): dispárala en `astro:after-swap`, no en `page-load` (que
llega después del primer paint).

---

## Fallback en navegadores sin soporte

- Donde la View Transitions API no existe (Firefox antiguo, etc.), Astro hace una navegación normal con un cross-fade básico; **nada se rompe**. No bloquees por soporte.
- Los eventos `astro:page-load`/`before-swap` se disparan igual con el fallback de Astro, así que tu init/cleanup sigue funcionando.
- Respeta `prefers-reduced-motion`: anula las animaciones de `::view-transition-*` (el contenido cambia sin morph). Ya cubierto arriba.

---

## Errores comunes a evitar

1. **Script que solo corre en `DOMContentLoaded`/inline** → funciona en recarga, muere al navegar. Usa `astro:page-load`. (Es el bug nº1 con ClientRouter.)
2. **No limpiar en `before-swap`** → ScrollTriggers, Lenis y canvas WebGL zombis acumulándose por navegación: fugas y jank. Mata todo (ver tabla).
3. **`transition:name` duplicado visible** → dos elementos con el mismo nombre a la vez = el morph falla o salta. Nombre único por slug; solo uno visible.
4. **Nombre dinámico con la directiva estática** → `transition:name={expr}` con slug puede no resolver; para dinámico usa `style="view-transition-name: obra-…"`.
5. **Persistir el Loader** → se congela y no vuelve a aparecer correctamente. Persiste header/nav, no el loader.
6. **Asumir que `page-load` re-dispara en un componente `persist`** → no se re-monta, su init no corre de nuevo. Si necesitas re-init, no lo persistas.
7. **Animaciones de transición largas** → cortan la sensación de rapidez. 0.4–0.6s y `--ease-art`.
8. **Olvidar reduced-motion** → morphs para quien pidió menos movimiento. Anula `::view-transition-*`.
9. **Manipular `scrollTop` a mano durante el swap** → pelea con Lenis. Deja que Lenis se recree en `page-load` (ver `smooth-scroll-orchestration-skill`).

---

## Integración con el resto del stack

- **Lenis** (`smooth-scroll-orchestration-skill`): se destruye en `before-swap` y se recrea + `ScrollTrigger.refresh()` en `page-load`. Ese refresh es obligatorio porque el documento persiste.
- **GSAP** (`gsap-cinematic-skill`): usa `gsap.context()` + `ctx.revert()` en `before-swap` para matar tweens/triggers de la página saliente; `SplitText.revert()` antes de re-split.
- **WebGL** (`webgl-displacement-skill`): `cancelAnimationFrame` + `loseContext()` en `before-swap`, re-init en `page-load`. Sin esto agotas los contextos WebGL navegando.
- **Arquitectura** (`art-portfolio-architecture-skill`): el `slug` estable es la clave del `transition:name`; si cambia un slug, el morph se rompe y hay que redirigir.
- **Cursor** (`custom-cursor-skill`): vive en `Base` (fuera del `<main>` que se intercambia); el magnetismo se re-ata en `page-load`. Considera `transition:persist` en el nodo del cursor para que no parpadee.
