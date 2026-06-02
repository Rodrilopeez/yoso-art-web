---
name: cyrcle-symmetric-nav-skill
description: >-
  Navegación simétrica con logo central tipo Cyrcle para yoso-art-web. Úsala
  SIEMPRE que la tarea toque la barra de navegación, el header, su layout, el
  estado sticky o el menú móvil. Triggers: "navegación", "nav", "header",
  "barra", "menú", "logo central", "nav simétrica", "items a izquierda y
  derecha", "sticky header", "fondo al hacer scroll", "hamburguesa", "menú
  móvil", "logo centrado en mobile", "estado activo", "aria-current",
  "navegación accesible". También al editar src/components/Header.astro o crear
  una barra nueva. Patrón de cyrcle.com aplicado a yoso.art con identidad propia
  (no copia).
---

# Cyrcle Symmetric Nav — Navegación con logo central

La barra de yoso.art: el logotipo **YOSO en el centro**, las secciones repartidas
simétricamente a izquierda y derecha, sticky con un cambio sutil de fondo al
hacer scroll (de transparente sobre el hero a oscuro semitransparente). En móvil,
hamburguesa manteniendo el logo centrado. Accesible con teclado y con estados
activos claros.

**Regla fundamental: el equilibrio visual es el efecto.** El logo va ópticamente
centrado y los grupos de enlaces pesan parecido a cada lado. Sticky discreto:
transparente cuando flota sobre la obra, oscuro al separarse de ella — nunca un
bloque opaco pesado que tape el hero.

---

## Patrón extraído de Cyrcle (comportamiento, no copia)

- **Logo centrado** como ancla y enlace a inicio.
- **Navegación bilateral**: un grupo de secciones a la izquierda, otro a la derecha del logo.
- Aplicado a yoso: fondo transparente→`rgba(12,12,13,.78)` con `backdrop-filter` al scrollear (ya existe ese patrón en el Header actual), tipografía Inter mayúsculas, acento oro en el activo.

---

## Estructura: tres columnas (izq · logo · der)

Reparte los enlaces existentes ([Header.astro](../../../src/components/Header.astro)
hoy: Obras, Series, Exposiciones, Sobre, Diario, Contacto) en dos mitades. El
logo va absolutamente centrado para no descuadrarse aunque los lados pesen algo
distinto.

```astro
---
const left  = [{ href: '/obras', label: 'Obras' }, { href: '/series', label: 'Series' }, { href: '/exposiciones', label: 'Exposiciones' }];
const right = [{ href: '/sobre', label: 'Sobre' }, { href: '/diario', label: 'Diario' }, { href: '/contacto', label: 'Contacto' }];
const path = Astro.url.pathname.replace(/\/$/, '') || '/';
const isActive = (href: string) => path === href || path.startsWith(href + '/');
---
<header class="nav" data-header transition:persist="site-header">
  <div class="nav__inner">
    <nav class="nav__side nav__side--left" aria-label="Navegación (izquierda)">
      <ul>{left.map((l) => <li><a href={l.href} aria-current={isActive(l.href) ? 'page' : undefined}>{l.label}</a></li>)}</ul>
    </nav>

    <a href="/inicio" class="nav__brand" aria-label="YOSO — inicio">YOSO</a>

    <nav class="nav__side nav__side--right" aria-label="Navegación (derecha)">
      <ul>{right.map((l) => <li><a href={l.href} aria-current={isActive(l.href) ? 'page' : undefined}>{l.label}</a></li>)}</ul>
    </nav>

    <button class="nav__toggle" type="button" aria-expanded="false" aria-controls="m-menu" data-menu-toggle>
      <span class="visually-hidden">Abrir menú</span><span class="nav__bars" aria-hidden="true"><i></i><i></i></span>
    </button>
  </div>

  <div class="nav__overlay" id="m-menu" data-menu hidden>
    <nav aria-label="Navegación móvil">
      <ul>{[...left, ...right].map((l) => <li><a href={l.href} aria-current={isActive(l.href) ? 'page' : undefined}>{l.label}</a></li>)}</ul>
    </nav>
  </div>
</header>
```
El logo enlaza a `/inicio` (la home real tras el gate), no a `/` (que redirige).

---

## Estilos — simetría y sticky sutil

```css
.nav { position: fixed; inset: 0 0 auto 0; z-index: var(--z-nav);
  transition: background var(--dur-1) var(--ease-art), border-color var(--dur-1) var(--ease-art);
  border-bottom: 1px solid transparent; }
.nav::before { content: ''; position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(to bottom, rgba(12,12,13,.55), transparent);
  opacity: 1; transition: opacity var(--dur-1) var(--ease-art); }
.nav[data-scrolled] { background: rgba(12,12,13,.78); backdrop-filter: blur(14px); border-bottom-color: var(--c-line); }
.nav[data-scrolled]::before { opacity: 0; }

/* Rejilla de 3 columnas: el logo ópticamente centrado pase lo que pase a los lados */
.nav__inner { position: relative; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  padding: clamp(.9rem,2vw,1.5rem) var(--gutter); gap: clamp(1rem,3vw,2.5rem); }
.nav__side ul { display: flex; gap: clamp(1rem,2.2vw,2.2rem); }
.nav__side--left ul { justify-content: flex-end; }
.nav__side--right ul { justify-content: flex-start; }
.nav__brand { grid-column: 2; font-family: var(--font-display); font-weight: var(--fw-semi);
  font-size: 1.4rem; letter-spacing: .18em; color: var(--c-ink); text-align: center; }

.nav__side a { font-size: var(--fs-eyebrow); letter-spacing: var(--ls-wide); text-transform: uppercase;
  color: var(--c-ink-dim); padding-block: .4rem; position: relative; }
.nav__side a:hover, .nav__side a[aria-current='page'] { color: var(--c-ink); }
.nav__side a[aria-current='page']::after { content: ''; position: absolute; left: 0; right: 0; bottom: 0; height: 1px; background: var(--c-accent); }

/* Móvil: logo centrado + hamburguesa; lados ocultos */
.nav__toggle { display: none; grid-column: 3; justify-self: end; background: none; border: 0; cursor: pointer; padding: .5rem; }
.nav__bars { display: block; width: 26px; }
.nav__bars i { display: block; height: 1px; background: var(--c-ink); margin: 6px 0; transition: transform var(--dur-1) var(--ease-art), opacity var(--dur-1) var(--ease-art); }
.nav[data-open] .nav__bars i:nth-child(1) { transform: translateY(3.5px) rotate(45deg); }
.nav[data-open] .nav__bars i:nth-child(2) { transform: translateY(-3.5px) rotate(-45deg); }
.nav__overlay { position: fixed; inset: 0; z-index: -1; background: var(--c-bg); display: grid; place-items: center; opacity: 0; transition: opacity var(--dur-2) var(--ease-art); }
.nav[data-open] .nav__overlay { opacity: 1; z-index: 1; }
.nav__overlay ul { display: grid; gap: var(--sp-5); text-align: center; }
.nav__overlay a { font-family: var(--font-display); font-size: clamp(2rem,8vw,3.2rem); color: var(--c-ink); }
.nav__overlay a[aria-current='page'] { color: var(--c-accent-2); }

@media (max-width: 860px) {
  .nav__side { display: none; }
  .nav__inner { grid-template-columns: 1fr auto 1fr; }  /* logo sigue en la col central */
  .nav__brand { grid-column: 2; }
  .nav__toggle { display: block; }
}
```
La clave de la simetría: `grid-template-columns: 1fr auto 1fr`. El logo (`auto`)
queda centrado aunque un lado tenga más texto; los `1fr` laterales empujan por
igual. En móvil se mantiene el centro y solo aparece la hamburguesa a la derecha.

---

## Comportamiento (sticky + menú + persistencia)

El header se **persiste** entre páginas (`transition:persist`), así que su script
debe resincronizar estado activo, scroll y cierre de menú en cada navegación
(mismo contrato que ya aplicamos en el Header actual).

```ts
const header = document.querySelector<HTMLElement>('[data-header]');
const onScroll = () => header && (window.scrollY > 40
  ? header.setAttribute('data-scrolled', '') : header.removeAttribute('data-scrolled'));
onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const menu = document.querySelector<HTMLElement>('[data-menu]');
function setMenu(open: boolean) {
  if (!header || !toggle || !menu) return;
  header.toggleAttribute('data-open', open);
  toggle.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
  (window as any).__lenis?.[open ? 'stop' : 'start']?.();   // congela el scroll de fondo
  document.body.style.overflow = open ? 'hidden' : '';
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

// Header persistido: re-sincroniza activo/scroll/menú en cada navegación.
function syncActive() {
  const p = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll<HTMLAnchorElement>('[data-header] .nav__side a, [data-header] .nav__overlay a').forEach((a) => {
    const href = a.getAttribute('href') || '';
    const active = p === href || p.startsWith(href + '/');
    active ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
  });
}
document.addEventListener('astro:page-load', () => { syncActive(); setMenu(false); onScroll(); });
```

---

## Accesibilidad (no negociable)

- **Teclado**: foco visible (`:focus-visible` global ya da outline oro); orden de tabulación natural izq→logo→der→toggle.
- **`aria-current="page"`** en el enlace activo (los dos lados y el overlay).
- **Menú móvil**: `aria-expanded` en el toggle, `aria-controls` al overlay, cierre con `Esc`, foco gestionado, scroll de fondo bloqueado (`lenis.stop()` + `overflow`).
- **Dos `<nav>`** con `aria-label` distinto (izquierda/derecha) para que el lector los distinga; o uno solo si prefieres — pero etiqueta siempre.
- **Contraste**: enlaces atenuados (`--c-ink-dim`) sobre el hero pueden fallar AA; el degradado `::before` superior ayuda. Verifica contraste sobre la obra real.

---

## Errores comunes a evitar

1. **Centrar el logo con flexbox y `margin:auto`** → se descuadra si los lados pesan distinto. Usa `grid 1fr auto 1fr`.
2. **Sticky opaco y pesado** → tapa el hero. Transparente sobre la obra, oscuro semitransparente al scrollear (patrón `data-scrolled`).
3. **No resincronizar el header persistido** → estado activo congelado y menú abierto tras navegar. `syncActive()` + `setMenu(false)` en `astro:page-load`.
4. **Logo a `/`** → `/` redirige (gate); enlázalo a `/inicio`.
5. **Hamburguesa que mueve el logo** → en móvil mantén el logo en la columna central; el toggle va a la derecha sin empujarlo.
6. **Bloquear scroll solo con `overflow:hidden`** → Lenis lo ignora. `lenis.stop()/start()` (ver `smooth-scroll-orchestration-skill`).
7. **Olvidar `aria-current`/`aria-expanded`** → inaccesible. Estados ARIA siempre.

---

## Integración con el resto del stack

- **View Transitions** (`astro-view-transitions-skill`): el header va con `transition:persist="site-header"` para no parpadear entre páginas; por eso necesita `syncActive()` en `page-load`.
- **Smooth scroll** (`smooth-scroll-orchestration-skill`): el menú móvil congela Lenis al abrir; el sticky lee `window.scrollY`.
- **Splash gate** (`splash-gate-skill`): la nav NO aparece en `/entrada`; vive en `/inicio` y el resto del sitio. El logo apunta a `/inicio`.
- **Tipografía** (`editorial-typography-skill`): logo en Fraunces, enlaces en Inter mayúsculas con tracking; activo en oro.
