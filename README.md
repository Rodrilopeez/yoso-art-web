# Yoso Art — Web

Reconstrucción de la web del artista **YOSO** (Ambrosio José López González) como activo
comercial profesional, aplicando de forma íntegra las recomendaciones de dos auditorías
(negocio + SEO). Sitio estático, mobile-first, accesible (WCAG AA) y optimizado para SEO
técnico y conversión.

## Fuentes del proyecto

| Fuente | Referencia |
| --- | --- |
| Web actual (a mejorar) | <https://yoso.art/> |
| Instagram (identidad de marca) | <https://www.instagram.com/yoso_arts/> |
| Auditoría de negocio | `kit-auditoria-negocio/auditoria-negocio-yosoart.html` |
| Auditoría SEO | `kit-auditoria-seo/auditoria-seo-yoso-art.html` |

## El artista

YOSO — nombre artístico de **Ambrosio José López González** (Vitoria, 1959; arquitecto por
la UPM; afincado en Madrid). Arte digital, escultura y fotografía. Obra de carácter onírico
y surrealista centrada en la identidad humana. Trayectoria internacional: Arte Laguna
(Venecia), Torre NASDAQ Times Square (NY), WISe.ART (Ginebra), Art Madrid, CICA Museum
(Corea), Sestante Art Prize (Lisboa), entre otros.

- Email: `yosolg@gmail.com` · Tel: `+34 627 515 759` · Madrid, España
- Instagram: [@yoso_arts](https://www.instagram.com/yoso_arts/) · X: [@yoso_arts](https://x.com/yoso_arts)
- WISe.ART (NFT/Web3): perfil de artista en Ethereum

## Stack detectado

- **Web actual:** WordPress + tema **Uncode** + **WooCommerce 10.7** + **WPML** (ES/EN/FR) +
  **Slider Revolution** 6.7.38. Hosting nginx + CDN (SiteGround). Técnicamente correcta en la
  base (HTTPS, sitemap, hreflang, WebP, robots.txt) pero **sin meta description, sin H1, sin
  Open Graph, sin schema** y **sin precios ni sistema de compra visible**.
- **Este repositorio:** reconstrucción **estática** (HTML5 semántico + CSS + JS vanilla),
  sin dependencias de build, desplegable en hosting estático / GitHub Pages.

## Identidad visual (de referencia de marca)

- **Paleta:** blanco `#ffffff`, crema `#f6f4f0`, negro cálido `#1a1918`, oro `#b8905a` /
  `#d4ac78`, borde `#e4e0d8`.
- **Tipografías:** *Playfair Display* (display), *Cormorant Garamond* (acento itálica),
  *DM Sans* (cuerpo).
- **Tono:** editorial, sobrio, de galería. *"El arte no se explica, se siente."*

## Estado actual

🟢 **Build completo en `mejoras/auditoria`.** Home + "Sobre YOSO" + 6 fichas de obra, con SEO
técnico, conversión, galerías accesibles, rendimiento (Lighthouse móvil 95/100/100/100) y
analítica GA4 instrumentada. Detalle en [`docs/informe-final.md`](docs/informe-final.md),
seguimiento en [`docs/plan-de-trabajo.md`](docs/plan-de-trabajo.md) y [`CHANGELOG.md`](CHANGELOG.md).

Pendiente: backend de formularios, ID de GA4, precios reales, EN/FR y despliegue.

## Metodología

Cambios **uno a uno**: cita de la recomendación → inspección → plan → OK → ejecución →
verificación → commit atómico → push a `origin/mejoras/auditoria` → resumen. Cada cambio se
mapea a su recomendación de origen en [`CHANGELOG.md`](CHANGELOG.md).

## Ramas

- `main` — estado estable.
- `mejoras/auditoria` — rama de trabajo (todos los cambios se aplican aquí).
