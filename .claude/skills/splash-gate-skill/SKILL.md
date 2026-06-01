---
name: splash-gate-skill
description: >-
  Pantalla de entrada (splash gate) cinematográfica tipo Cyrcle para
  yoso-art-web. Úsala SIEMPRE que la tarea toque la landing de entrada, el botón
  Enter, la transición de entrada al home, o la lógica de "ya entré". Triggers:
  "splash", "gate", "pantalla de entrada", "landing", "/entrada", "/welcome",
  "botón Enter", "intro fullscreen", "cortina de entrada", "mask reveal",
  "clip-path transition", "ya entré", "sessionStorage entrada", "redirigir a
  inicio", "audio toggle", "obra fullscreen de bienvenida". También al crear la
  ruta de entrada o coordinar la transición a /inicio. Patrón de Cyrcle aplicado
  a yoso.art con identidad propia (no copia).
---

# Splash Gate — Pantalla de entrada cinematográfica

La puerta de entrada de yoso.art: una obra de YOSO a pantalla completa, el
nombre del artista y un botón **Enter** centrado con tipografía editorial. Al
pulsar, una transición cinematográfica (mask reveal con clip-path) da paso a
`/inicio`. Una vez dentro, no se vuelve a mostrar en la sesión.

**Regla fundamental: el gate es una capa de bienvenida, nunca una cárcel.** Si
el usuario ya entró (sessionStorage), o llega por enlace profundo a una obra, o
pide menos movimiento, debe llegar al contenido sin fricción. El gate enamora la
primera vez; no estorba las siguientes.

---

## Patrón extraído de Cyrcle (comportamiento, no copia)

- **Separación limpia** entre la puerta de entrada y el sitio: el gate es una ruta propia, sin la nav del sitio.
- **Media fullscreen** de bienvenida (en Cyrcle, vídeo; en yoso, la obra signature de mayor resolución).
- **Botón Enter** como única acción primaria, centrado.
- **Toggle de audio** opcional sobre la media.
- Lo aplicamos con la identidad de yoso: fondo `--c-bg` (#0c0c0d), oro `--c-accent`, Fraunces display, ease `--ease-art`.

---

## Arquitectura de rutas

```
/            → redirector: si ya entró → /inicio, si no → /entrada
/entrada     → el splash gate (esta skill)
/inicio      → home con contenido (antes era /)
```

`/` no puede redirigir en servidor según sessionStorage (es estático): usa una
página mínima con script cliente que decide y hace `location.replace`.

```astro
---
// src/pages/index.astro  → redirector (sin contenido visible)
---
<!doctype html>
<html lang="es"><head><meta charset="utf-8" />
  <meta name="robots" content="noindex" />
  <link rel="canonical" href="https://yoso.art/inicio" />
  <script is:inline>
    // Decide antes de pintar para evitar parpadeo.
    const entered = sessionStorage.getItem('yoso_entered');
    location.replace(entered ? '/inicio' : '/entrada');
  </script>
  <noscript><meta http-equiv="refresh" content="0; url=/inicio" /></noscript>
</head><body></body></html>
```
- `is:inline` para que corra antes del render (no esperes a hidratación).
- `noscript` lleva a `/inicio` (sin JS no hay gate posible).
- Marca `/` como `noindex` y canónica a `/inicio` (la home indexable es `/inicio`, no la puerta).

---

## La ruta /entrada (el gate)

Página independiente que **no usa el Base layout completo** (sin Header, sin
Footer, sin loader): el gate es su propio mundo. Reaprovecha tokens y fuentes.

```astro
---
// src/pages/entrada.astro
import { Image } from 'astro:assets';
import { getObra } from '../lib/obras';
const signature = getObra('SLUG_DE_LA_OBRA_SIGNATURE'); // definido en FASE 1 con el cliente
import '@fontsource-variable/fraunces';
import '@fontsource-variable/inter';
import '../styles/tokens.css';
import '../styles/global.css';
---
<!doctype html>
<html lang="es"><head>
  <meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>YOSO — Entrar</title>
  <meta name="robots" content="noindex, follow" />
  <link rel="canonical" href="https://yoso.art/inicio" />
</head>
<body class="gate-body">
  <main class="gate" data-gate>
    <div class="gate__media">
      {signature && <Image src={signature.image} alt="" widths={[1280, 1920, 2560]} sizes="100vw" loading="eager" fetchpriority="high" />}
      <div class="gate__scrim" aria-hidden="true"></div>
    </div>

    <header class="gate__top"><span class="gate__brand">YOSO</span></header>

    <div class="gate__center">
      <p class="eyebrow">Arte digital · Escultura · Fotografía</p>
      <button type="button" class="gate__enter" data-gate-enter>
        <span>Entrar</span>
      </button>
    </div>

    <button type="button" class="gate__audio" data-gate-audio aria-pressed="false" aria-label="Activar sonido" hidden>♪</button>
  </main>
</body></html>
```
Notas:
- La obra signature va `loading="eager"` + `fetchpriority="high"`: es el LCP del gate.
- El botón dice "Entrar" (es ES); tipografía Inter mayúsculas tracking ancho o Fraunces, según dirección de arte.
- El toggle de audio queda `hidden` salvo que haya pista de sonido real (no inventes audio).

---

## La transición al pulsar Enter (cinematográfica)

Dos patrones; elige uno por dirección de arte:

### A) Mask reveal con clip-path (recomendado)
La obra se "abre" revelando el home detrás. Como es navegación entre páginas,
combínalo con View Transitions: anima la salida del gate y navega.

```ts
import gsap from 'gsap';

function enter() {
  sessionStorage.setItem('yoso_entered', '1');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { location.href = '/inicio'; return; }

  const gate = document.querySelector<HTMLElement>('[data-gate]')!;
  // Cortina circular que se cierra desde el botón (o clip vertical).
  gsap.timeline({ onComplete: () => { location.href = '/inicio'; } })
    .to(gate.querySelector('.gate__center'), { autoAlpha: 0, y: -20, duration: 0.4, ease: 'power2.in' })
    .to(gate, {
      clipPath: 'inset(0 0 100% 0)',           // se abre por arriba; usa circle() para iris
      duration: 0.9, ease: 'power4.inOut',
    }, '-=0.1');
}
document.querySelector('[data-gate-enter]')?.addEventListener('click', enter);
```
Para que `/inicio` reciba el testigo y NO vuelva a animar su loader, marca el
flag antes de navegar (el loader respeta `yoso_loaded`/`yoso_entered`).

### B) Zoom out / escalado
El gate se aleja (`scale` + `autoAlpha`) revelando el home. Más simple, menos
"wow". Mismo manejo de sessionStorage y reduced-motion.

> Si en el futuro se usa el `ViewTransitions`/`navigate()` de Astro para una
> transición compartida real (la obra del gate → hero de /inicio), comparte un
> `view-transition-name` entre ambas (ver `astro-view-transitions-skill`).

---

## Estilos base del gate

```css
.gate-body { margin: 0; background: var(--c-bg); cursor: default; }
.gate { position: fixed; inset: 0; overflow: hidden; clip-path: inset(0 0 0% 0); }
.gate__media { position: absolute; inset: 0; }
.gate__media :global(img) { width: 100%; height: 100%; object-fit: cover; }
.gate__scrim { position: absolute; inset: 0;
  background: radial-gradient(120% 80% at 50% 60%, transparent 30%, rgba(12,12,13,.75) 100%); }
.gate__top { position: absolute; top: clamp(1.2rem,3vw,2rem); left: 0; right: 0; text-align: center; }
.gate__brand { font-family: var(--font-display); font-weight: var(--fw-semi); letter-spacing: .22em; color: var(--c-ink); }
.gate__center { position: absolute; left: 0; right: 0; bottom: clamp(3rem,10vh,7rem);
  display: grid; justify-items: center; gap: var(--sp-5); text-align: center; }
.gate__enter { background: none; border: 1px solid var(--c-ink-dim); color: var(--c-ink);
  padding: 1rem 2.6rem; font-family: var(--font-sans); font-size: var(--fs-eyebrow);
  letter-spacing: var(--ls-wider); text-transform: uppercase; cursor: pointer;
  transition: background var(--dur-1) var(--ease-art), color var(--dur-1) var(--ease-art), border-color var(--dur-1) var(--ease-art); }
.gate__enter:hover, .gate__enter:focus-visible { background: var(--c-accent); color: var(--c-bg); border-color: var(--c-accent); }
```

---

## Accesibilidad (no negociable)

- **Foco al cargar**: lleva el foco al botón Enter (`autofocus` o `.focus()`), para que se pueda entrar con Enter del teclado.
- **`prefers-reduced-motion`**: sin transición; `location.href='/inicio'` directo.
- **Audio**: arranca SIEMPRE en silencio; el sonido solo tras gesto del usuario (toggle). Nunca autoplay con sonido (lo bloquean los navegadores y es hostil).
- **`noindex`** en `/` y `/entrada`; la home indexable es `/inicio`.
- La media del gate es decorativa → `alt=""`.

---

## Errores comunes a evitar

1. **Atrapar al usuario** sin escape ni memoria → marca `sessionStorage` al entrar y respeta el redirect de `/`.
2. **Redirigir en servidor por sessionStorage** → imposible en estático. Decisión en script `is:inline` cliente.
3. **Parpadeo del gate** para quien ya entró → el redirector de `/` corre `is:inline` antes de pintar (`location.replace`, no `href`, para no ensuciar el historial).
4. **Indexar el gate** → diluye SEO. `noindex` + canónica a `/inicio`.
5. **Autoplay con sonido** → bloqueado y hostil. Silencio por defecto, toggle manual.
6. **Animar y navegar a la vez sin esperar** → el `location.href` debe ir en el `onComplete` de la timeline (o reduce-motion directo).
7. **Cargar la obra signature sin prioridad** → es el LCP del gate: `eager` + `fetchpriority="high"`, tamaño adecuado (no la original de varios MB).
8. **Meter Header/Footer/loader del sitio en el gate** → rompe la separación. El gate es su propio documento.

---

## Integración con el resto del stack

- **View Transitions** (`astro-view-transitions-skill`): para una transición compartida obra-gate → hero-inicio, usa `view-transition-name` y `navigate()`.
- **GSAP** (`gsap-cinematic-skill`): la cortina usa `clip-path` + `power4.inOut`; mismo lenguaje de movimiento.
- **Loader** (`cinematic-loader-skill`): marca el flag de entrada antes de navegar para que `/inicio` no muestre además el loader (coordina `yoso_entered`/`yoso_loaded`).
- **Tipografía** (`editorial-typography-skill`): marca y botón usan `--font-display`/`--font-sans` y los tokens de tracking.
- **Nav** (`cyrcle-symmetric-nav-skill`): el gate NO lleva nav; la nav simétrica aparece ya en `/inicio`.
