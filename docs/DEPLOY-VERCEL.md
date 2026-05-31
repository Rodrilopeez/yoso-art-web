# Desplegar el rediseño (Astro) en Vercel

El rediseño vive en la rama **`rediseno/astro`**. La web estática sigue intacta en `main`
y en GitHub Pages. Vercel sirve a raíz, así que no hay que tocar el código.

## Pasos (una sola vez, ~2 minutos)

1. Entra en <https://vercel.com> y **Sign up / Log in con GitHub** (cuenta `Rodrilopeez`).
2. **Add New… → Project** e **Import** el repositorio `yoso-art-web`.
3. Vercel detecta **Astro** automáticamente. Deja:
   - Framework Preset: **Astro**
   - Build Command: `astro build`
   - Output Directory: `dist`
   (Ya están fijados en `vercel.json`.)
4. Antes de desplegar, abre **Settings → Git → Production Branch** y cámbiala a
   **`rediseno/astro`** (para que la producción de Vercel sea el rediseño, no `main`).
   - Alternativa: deja `main` como producción y usa la **URL de preview** que Vercel genera
     automáticamente para la rama `rediseno/astro` en cada push.
5. **Deploy**. En ~1 min tendrás una URL del tipo `https://yoso-art-web.vercel.app`.

## Notas

- Cada push a `rediseno/astro` generará un nuevo despliegue automático.
- No se necesita adaptador: el sitio es **estático** (`output: 'static'`).
- Las cabeceras de caché de `/_astro/*` e `/img/*` ya están configuradas en `vercel.json`.
- Cuando se decida que el rediseño sustituye a yoso.art, se apunta el dominio `yoso.art`
  en **Settings → Domains** de Vercel (y se ajusta el DNS).

## Comprobación tras el primer deploy

- Hero WebGL con displacement reactivo al cursor.
- `/obras` con filtros y `/obras/[slug]` con zoom.
- Scroll suave (Lenis) y “Obra destacada” con scroll horizontal *pinned*.
