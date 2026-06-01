---
name: webgl-displacement-skill
description: >-
  Patrones de OGL (WebGL) para distorsión y crossfade de imágenes de obra en
  yoso-art-web. Úsala SIEMPRE que la tarea toque el canvas del hero, una galería
  con efecto fluido, o la imagen de una obra individual con distorsión reactiva
  al cursor o al scroll. Triggers: "WebGL", "OGL", "shader", "displacement",
  "distorsión de imagen", "efecto refik anadol", "hero canvas", "crossfade de
  obras", "uniform de intensidad", "ripple en la imagen", "textura de la obra",
  "fallback WebGL", "GLSL", "fragment shader", "imagen reactiva al ratón",
  "efecto líquido en la obra". También cuando se edite src/components/Hero.astro
  o se cree un componente de imagen con canvas. Aplica el estándar visual de
  refikanadol.com a la obra de YOSO.
---

# WebGL Displacement — Distorsión de obra con OGL

Cómo distorsionar y fundir imágenes de obra de YOSO con WebGL (OGL 1.0.11) de
forma que se vea como refikanadol.com: la imagen "respira", reacciona al cursor
y al scroll, y se funde entre piezas sin cortes. Siempre con fallback a imagen
estática y respetando `prefers-reduced-motion`.

**Regla fundamental: el WebGL es una mejora progresiva, nunca un requisito.**
La obra debe verse perfecta con CSS puro primero (`background-image` o
`<Image>` de astro:assets). El canvas se monta encima y solo si arranca. Si OGL
falla, si no hay contexto WebGL, o si el usuario pidió menos movimiento, el
usuario ve la imagen nítida sin saber que faltó nada.

---

## Cuándo activarte

- Se edita o referencia [src/components/Hero.astro](../../../src/components/Hero.astro) (ya tiene un displacement/crossfade OGL — reutiliza su shader, no reinventes).
- Se quiere un efecto fluido en una tarjeta de galería ([src/components/Featured.astro](../../../src/components/Featured.astro)) o en la imagen grande de una obra ([src/pages/obras/[slug].astro](../../../src/pages/obras/[slug].astro)).
- Aparecen las palabras shader / displacement / OGL / ripple / crossfade / distorsión.

Si la tarea es solo animación DOM (no píxeles de imagen), NO es esta skill →
es `gsap-cinematic-skill`.

---

## El stack real de este proyecto (no asumas otro)

- **OGL 1.0.11** ya instalado (`package.json`). Importación dinámica: `await import('ogl')`.
- Output **estático** (`astro.config.mjs`), `site: https://yoso.art`. No hay runtime de servidor: todo el WebGL es client-side.
- Imágenes de obra: locales en `assets/img/obra/<slug>.webp` servidas con `astro:assets` (ver [src/lib/obras.ts](../../../src/lib/obras.ts)). Para el hero hay copias en `public/img/hero/*.webp` (rutas públicas, cargables por `new Image()`).
- Tokens de movimiento en [src/styles/tokens.css](../../../src/styles/tokens.css): usa `--ease-art` (`cubic-bezier(0.22,1,0.36,1)`) y `--dur-2` para los fundidos CSS del canvas.
- Patrón de ciclo de vida: View Transitions activas (`ClientRouter` en `Base.astro`). **Arranca en `astro:page-load`, limpia en `astro:before-swap`.** Nunca en `DOMContentLoaded`.

---

## Patrón base — el shader de displacement reutilizable

El hero ya define el shader canónico del proyecto. Su pieza clave es la función
`cover()` en GLSL, que resuelve el aspect-ratio responsive (equivale a
`object-fit: cover`). **Reutilízala siempre** — es el error nº1 olvidarla y que
la obra salga estirada.

```glsl
// cover(): mapea uv para que la textura llene el canvas sin deformar la obra.
// res = resolución del canvas en px, img = resolución natural de la imagen.
vec2 cover(vec2 uv, vec2 res, vec2 img){
  vec2 r = vec2(
    min((res.x/res.y)/(img.x/img.y), 1.0),
    min((res.y/res.x)/(img.y/img.x), 1.0)
  );
  return vec2(uv.x*r.x + (1.0-r.x)*0.5, uv.y*r.y + (1.0-r.y)*0.5);
}
```

Uniforms estándar del proyecto (mantén estos nombres para que el shader sea
intercambiable entre hero, galería y ficha):

| uniform | tipo | qué controla |
|---|---|---|
| `uTexA` / `uTexB` | `sampler2D` | textura actual y siguiente (crossfade) |
| `uResA` / `uResB` / `uRes` | `vec2` | resolución natural de cada imagen y del canvas |
| `uMouse` | `vec2` | posición de cursor normalizada (0–1), `y` invertida |
| `uStrength` | `float` | **intensidad** del displacement (0 = quieto) |
| `uDir` | `vec2` | **dirección** del desplazamiento (p. ej. del scroll) |
| `uProgress` | `float` | 0→1 del crossfade entre A y B |
| `uTime` | `float` | reloj para el ondulado ambiental |

---

## Receta A — Imagen de obra individual reactiva al cursor (ficha)

Para la obra grande de `/obras/[slug]`. Una sola textura, displacement radial
bajo el puntero (el efecto "refik" aplicado a una pieza). Mejora progresiva: el
`<Image>` de astro:assets se renderiza primero; el canvas se superpone.

Crea un componente reutilizable `src/components/WebGLImage.astro`:

```astro
---
/**
 * Imagen de obra con displacement WebGL reactivo al cursor (mejora progresiva).
 * La <img>/<Image> de fondo SIEMPRE se ve; el canvas se monta encima si OGL
 * arranca y solo cuando entra en viewport (equivalente vanilla a client:visible).
 */
interface Props { src: string; alt: string; width: number; height: number; }
const { src, alt, width, height } = Astro.props;
---
<figure class="glimg" data-glimg style={`aspect-ratio:${width}/${height}`}>
  <img src={src} alt={alt} width={width} height={height} loading="lazy" decoding="async" />
  <canvas class="glimg__c" data-glimg-canvas data-src={src} data-res={`${width},${height}`} aria-hidden="true"></canvas>
</figure>

<style>
  .glimg { position: relative; overflow: hidden; margin: 0; background: var(--c-bg-2); }
  .glimg img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .glimg__c { position: absolute; inset: 0; width: 100%; height: 100%;
    opacity: 0; transition: opacity var(--dur-2) var(--ease-art); pointer-events: none; }
  .glimg__c.is-on { opacity: 1; }
  @media (prefers-reduced-motion: reduce) { .glimg__c { display: none; } }
</style>

<script>
  import { mountDisplacement } from '../lib/webgl-displacement';
  function boot() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll<HTMLElement>('[data-glimg]').forEach((fig) => {
      const canvas = fig.querySelector<HTMLCanvasElement>('[data-glimg-canvas]');
      if (!canvas || canvas.dataset.booted) return;
      // Equivalente a client:visible: solo arranca al entrar en viewport.
      const io = new IntersectionObserver((entries, obs) => {
        for (const e of entries) if (e.isIntersecting) {
          canvas.dataset.booted = '1';
          mountDisplacement(canvas);   // limpio en astro:before-swap dentro del lib
          obs.disconnect();
        }
      }, { rootMargin: '200px' });
      io.observe(fig);
    });
  }
  document.addEventListener('astro:page-load', boot);
</script>
```

La lógica WebGL va en un módulo reutilizable `src/lib/webgl-displacement.ts`
(misma carga de textura, `cover()` y bucle que el hero, pero con una sola
textura y con limpieza registrada):

```ts
// src/lib/webgl-displacement.ts
export async function mountDisplacement(canvas: HTMLCanvasElement) {
  const [w, h] = (canvas.dataset.res ?? '1,1').split(',').map(Number);
  try {
    const { Renderer, Triangle, Program, Mesh, Texture } = await import('ogl');
    const renderer = new Renderer({ canvas, dpr: Math.min(window.devicePixelRatio, 2), alpha: false });
    const gl = renderer.gl;

    const tex = new Texture(gl, { generateMipmaps: false });
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = canvas.dataset.src!;
    img.onload = () => { tex.image = img; canvas.classList.add('is-on'); };

    const program = new Program(gl, {
      vertex: `attribute vec2 uv; attribute vec2 position; varying vec2 vUv;
               void main(){ vUv = uv; gl_Position = vec4(position,0.0,1.0); }`,
      fragment: `
        precision highp float;
        uniform sampler2D uTex; uniform vec2 uRes; uniform vec2 uImg;
        uniform vec2 uMouse; uniform float uStrength; uniform vec2 uDir; uniform float uTime;
        varying vec2 vUv;
        vec2 cover(vec2 uv, vec2 res, vec2 img){
          vec2 r = vec2(min((res.x/res.y)/(img.x/img.y),1.0), min((res.y/res.x)/(img.y/img.x),1.0));
          return vec2(uv.x*r.x+(1.0-r.x)*0.5, uv.y*r.y+(1.0-r.y)*0.5);
        }
        void main(){
          float d = distance(vUv, uMouse);
          float infl = smoothstep(0.40, 0.0, d) * uStrength;     // halo bajo el cursor
          vec2 ripple = vec2(sin(d*46.0 - uTime*3.0)) * 0.010 * infl;
          vec2 push   = uDir * 0.04 * uStrength;                  // dirección (scroll)
          vec2 uvc = cover(vUv, uRes, uImg) + ripple + push;
          gl_FragColor = vec4(texture2D(uTex, uvc).rgb, 1.0);
        }`,
      uniforms: {
        uTex: { value: tex }, uRes: { value: [1,1] }, uImg: { value: [w,h] },
        uMouse: { value: [0.5,0.5] }, uStrength: { value: 0 }, uDir: { value: [0,0] }, uTime: { value: 0 },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      renderer.setSize(r.width, r.height);
      program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
    };
    resize(); window.addEventListener('resize', resize);

    const tgt = { x: 0.5, y: 0.5 }, cur = { x: 0.5, y: 0.5 }; let strength = 0;
    canvas.parentElement!.style.pointerEvents = 'none';        // no robes clics a la <a> de la ficha
    window.addEventListener('pointermove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = 1 - (e.clientY - rect.top) / rect.height;
      if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;
      strength = Math.min(1, strength + Math.hypot(nx - tgt.x, ny - tgt.y) * 6);
      tgt.x = nx; tgt.y = ny;
    }, { passive: true });

    let t0 = performance.now(), raf = 0;
    const loop = (t: number) => {
      const dt = (t - t0) / 1000; t0 = t;
      cur.x += (tgt.x - cur.x) * 0.08; cur.y += (tgt.y - cur.y) * 0.08; strength *= 0.94;
      program.uniforms.uMouse.value = [cur.x, cur.y];
      program.uniforms.uStrength.value = strength;
      program.uniforms.uTime.value += dt;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    // Limpieza obligatoria con View Transitions (evita fugas y canvas zombi).
    const cleanup = () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize);
      gl.getExtension('WEBGL_lose_context')?.loseContext(); };
    document.addEventListener('astro:before-swap', cleanup, { once: true });
  } catch (err) {
    console.warn('[webgl-displacement] no disponible, queda la imagen estática.', err);
  }
}
```

Conexión al scroll (opcional): alimenta `uDir`/`uStrength` desde la velocidad de
Lenis para que la obra "se arrastre" al hacer scroll. Lenis está expuesto como
`window.__lenis` (ver `Base.astro`):

```ts
(window as any).__lenis?.on('scroll', ({ velocity }: { velocity: number }) => {
  program.uniforms.uDir.value = [0, Math.sign(velocity)];
  strength = Math.min(1, Math.abs(velocity) * 0.02);
});
```

---

## Receta B — Crossfade entre obras (hero / galería)

Ya implementado en `Hero.astro`: dos texturas (`uTexA`/`uTexB`), `uProgress`
animado con GSAP, ondulado de transición. Para una galería, reaprovecha ese
shader y dispara `go()` con hover en vez de con `setInterval`. **No dupliques el
shader**: si vas a usarlo en 2+ sitios, extráelo al `lib/webgl-displacement.ts`
y que el hero también lo importe.

---

## Optimización de texturas (obligatorio)

- **Tamaño de la imagen ≈ tamaño en pantalla**, no la original de 4000px. Para el hero ≤2000px de lado; para tarjetas ≤1000px. WebP ya es el formato del proyecto.
- `dpr: Math.min(window.devicePixelRatio, 2)` — nunca dpr 3 (móviles): cuadruplica píxeles a pintar.
- `generateMipmaps: false` salvo que minifiques mucho la textura.
- Una textura por imagen, **precargada** antes de mostrar el canvas (`onload` → `is-on`). Nunca pintes un canvas con textura vacía (sale negro un frame).
- Texturas no-power-of-two: OGL las admite con `CLAMP_TO_EDGE` (por defecto). No fuerces `REPEAT`.

---

## Errores comunes a evitar

1. **Olvidar `cover()`** → la obra sale estirada en pantallas no cuadradas. Siempre mapea el uv con la resolución natural de la imagen.
2. **No registrar `astro:before-swap`** → al navegar con View Transitions queda un canvas con su `requestAnimationFrame` vivo: fuga de memoria y contextos WebGL agotados (el navegador corta a partir de ~16). Limpia SIEMPRE, incluido `loseContext()`.
3. **Arrancar en `DOMContentLoaded`** → no se vuelve a ejecutar tras una transición de página. Usa `astro:page-load`.
4. **No tener fallback** → si OGL lanza, la obra debe quedar visible. El canvas va *encima* de la imagen y solo opacas a 1 cuando la textura cargó. Nunca pongas la imagen como `display:none` esperando al canvas.
5. **Robar los clics** → en la ficha la imagen suele estar dentro de un botón/enlace de zoom. Pon `pointer-events: none` en el canvas para no bloquear la interacción.
6. **`dpr` sin tope** → en móvil retina mata el framerate. Cap a 2.
7. **Ignorar `prefers-reduced-motion`** → ni siquiera montes el WebGL; oculta el canvas por CSS y deja la imagen. Es accesibilidad, no opcional.
8. **Cargar OGL estáticamente** (`import { Renderer } from 'ogl'` arriba del módulo) → entra en el bundle inicial de todas las páginas. Usa `await import('ogl')` para que solo lo descargue quien ve el efecto.

---

## Integración con el resto del stack

- **Astro islands / `client:visible`**: este proyecto es vanilla (sin React/Vue), así que el equivalente de `client:visible` es el `IntersectionObserver` de la Receta A (arranca el WebGL al entrar en viewport). Si en el futuro se añade un framework de islas, el componente puede envolverse y usar `client:visible` directamente; el `lib/webgl-displacement.ts` se reutiliza igual.
- **GSAP** (`gsap-cinematic-skill`): anima `uProgress`/`uStrength` con `gsap.to({v:0}, …)` y `onUpdate`, no con bucles manuales, cuando quieras easings curados.
- **Lenis** (`smooth-scroll-orchestration-skill`): lee `window.__lenis` para alimentar dirección/intensidad desde el scroll virtual.
- **Sanity** (`sanity-art-cms-skill`): cuando las imágenes vengan del CDN de Sanity, pásalas por su transform (`?w=2000&fm=webp&q=80`) y recuerda `img.crossOrigin = 'anonymous'` (ya está) para poder subirlas como textura sin tainted canvas.
- **View Transitions** (`astro-view-transitions-skill`): el ciclo `page-load` / `before-swap` de arriba es el contrato; respétalo en cualquier canvas nuevo.
