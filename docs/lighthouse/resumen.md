# Lighthouse — antes / después (móvil)

Medición con Lighthouse 13.3 (Chromium, emulación móvil).
- **Antes:** `https://yoso.art/` (WordPress en producción).
- **Después:** build estático de este repositorio servido por HTTP local.

## Puntuaciones por categoría

| Categoría | Antes (yoso.art) | Después (build) |
|---|---|---|
| Rendimiento | 68 | **95** |
| Accesibilidad | 100 | **100** |
| Buenas prácticas | 96 | **100** |
| SEO | 92 | **100** |

## Métricas (Core Web Vitals y afines)

| Métrica | Antes | Después |
|---|---|---|
| First Contentful Paint | 2,8 s | **1,8 s** |
| Largest Contentful Paint | 6,0 s | **2,8 s** |
| Speed Index | 6,1 s | **1,8 s** |
| Total Blocking Time | 70 ms | **0 ms** |
| Cumulative Layout Shift | 0 | 0 |

## Notas

- La auditoría SEO original puntuó la web en **42/100** con su propia metodología
  ponderada (sin meta description, sin H1, sin OG, sin schema). El build aplica esas
  correcciones; Lighthouse SEO pasa a **100**.
- El fallo de accesibilidad detectado durante el desarrollo (contraste de color del oro de
  marca y de los textos tenues) se corrigió antes de cerrar el bloque: **color-contrast AA
  sin incidencias**.
- Reproducir: servir el build (`node scripts/serve.mjs`) y ejecutar
  `npx lighthouse http://localhost:8099/`. Los informes JSON completos no se versionan por
  peso (ver `.gitignore`).
