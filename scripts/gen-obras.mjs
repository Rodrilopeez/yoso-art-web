/* ============================================================
   Genera fichas individuales de obra destacada (obra-<slug>.html)
   con ficha técnica, CTA "Consultar precio" y schema VisualArtwork,
   y enlaza cada ficha desde su tarjeta de la galería en index.html.
   Uso: node scripts/gen-obras.mjs
   ============================================================ */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Obras destacadas. Solo datos reales; lo desconocido = "Consultar".
const featured = [
  { slug: 'identity', title: 'Identity', cat: 'Arte Digital',
    tech: 'Arte digital · impresión de alta resolución', year: 'Consultar', dims: 'Varios formatos · consultar', edition: 'Edición limitada · consultar',
    desc: 'Obra emblemática de la serie onírica de YOSO. Una reflexión sobre la identidad y la singularidad del individuo, construida desde la alta resolución para el gran formato.' },
  { slug: 'veritas-and-the-wolf-pack', title: 'Veritas and the Wolf Pack', cat: 'Arte Digital',
    tech: 'Arte digital · impresión de alta resolución', year: 'Consultar', dims: 'Varios formatos · consultar', edition: 'Edición limitada · consultar',
    desc: 'Imagen surrealista de la producción digital de YOSO, donde lo simbólico y lo onírico exploran la verdad y la mirada del grupo.' },
  { slug: 'dream-of-red-wave-ii', title: 'Dream of Red Wave II', cat: 'Arte Digital',
    tech: 'Arte digital · impresión de alta resolución', year: 'Consultar', dims: 'Varios formatos · consultar', edition: 'Edición limitada · consultar',
    desc: 'Segunda pieza de la serie «Dream of Red Wave». Una visión fugaz convertida en imagen, característica del lenguaje onírico del artista.' },
  { slug: 'ecos', title: 'Ecos', cat: 'Escultura',
    tech: 'Instalación · 108 zapatos rojos, 1 negro, audio', year: '2026', dims: 'Escalera de emergencia, 5 tramos', edition: 'Obra única',
    desc: 'Instalación presentada en Hybrid Art Fair 26 (Madrid, Petit Palace Santa Bárbara, 5–8 marzo 2026). Evoca los ecos de las vidas cotidianas que persisten en un espacio común.' },
  { slug: 'soplo-de-vida', title: 'Soplo de Vida', cat: 'Escultura',
    tech: 'Maniquí CACHAREL (c. 1950), maderas nobles y latón', year: 'Consultar', dims: '67 × 175 cm · 13,5 kg', edition: 'Obra única',
    desc: 'Escultura de pared. Maniquí articulado de niño vintage de la marca CACHAREL, fabricado por BERO DESIGN (Italia), integrado en un marco de teca y samba con herrajes de latón.' },
  { slug: 'la-boda', title: 'La Boda', cat: 'Escultura',
    tech: 'Escultura', year: 'Consultar', dims: 'Consultar', edition: 'Obra única',
    desc: 'Pieza escultórica de YOSO que prolonga su indagación sobre la identidad y el rito desde el volumen y la materia.' },
];

const SITE = 'https://yoso.art';

function page(o) {
  const img = `assets/img/obra/${o.slug}.webp`;
  const imgAbs = `${SITE}/${img}`;
  const url = `${SITE}/obra-${o.slug}.html`;
  const mailto = `mailto:yosolg@gmail.com?subject=${encodeURIComponent(`[yoso.art] Consulta de obra: «${o.title}»`)}&body=${encodeURIComponent(`Hola YOSO,\n\nMe interesa la obra «${o.title}». ¿Podrías indicarme precio, formatos disponibles y condiciones de envío?\n\nGracias.`)}`;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(o.title)} — ${esc(o.cat)} de YOSO</title>
  <meta name="description" content="${esc(o.title)}: ${esc(o.cat.toLowerCase())} de YOSO. ${esc(o.tech)}. Consulta precio, formatos y disponibilidad de la obra original.">
  <link rel="canonical" href="${url}">
  <meta name="robots" content="index, follow, max-image-preview:large">
  <meta name="theme-color" content="#1a1918">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="YOSO">
  <meta property="og:title" content="${esc(o.title)} — ${esc(o.cat)} de YOSO">
  <meta property="og:description" content="${esc(o.tech)}. Consulta precio y disponibilidad de la obra original de YOSO.">
  <meta property="og:url" content="${url}">
  <meta property="og:locale" content="es_ES">
  <meta property="og:image" content="${imgAbs}">
  <meta property="og:image:alt" content="${esc(o.title)} — obra de YOSO">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${imgAbs}">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400;1,500&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/tokens.css">
  <link rel="stylesheet" href="assets/css/base.css">
  <link rel="stylesheet" href="assets/css/layout.css">
  <link rel="stylesheet" href="assets/css/sections.css">
  <script src="assets/js/analytics.js" defer></script>
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "name": ${JSON.stringify(o.title)},
    "image": ${JSON.stringify(imgAbs)},
    "url": ${JSON.stringify(url)},
    "artform": ${JSON.stringify(o.cat)},
    "artMedium": ${JSON.stringify(o.tech)},
    "creator": { "@type": "Person", "name": "YOSO", "url": "https://yoso.art/" },
    "isAccessibleForFree": false
  }
  </script>
</head>
<body>
  <a class="skip-link" href="#main">Saltar al contenido</a>
  <header class="site-header">
    <div class="container site-header__inner">
      <a href="index.html" class="brand">YOSO</a>
      <nav class="site-nav" aria-label="Navegación principal">
        <ul>
          <li><a href="sobre-yoso.html">Artista</a></li>
          <li><a href="index.html#arte-digital">Arte Digital</a></li>
          <li><a href="index.html#escultura">Escultura</a></li>
          <li><a href="index.html#fotografia">Fotografía</a></li>
          <li><a href="index.html#trayectoria">Trayectoria</a></li>
          <li><a href="index.html#contacto">Contacto</a></li>
        </ul>
      </nav>
    </div>
  </header>
  <main id="main">
    <section class="section obra">
      <div class="container">
        <p class="obra__back"><a href="index.html#${o.cat === 'Escultura' ? 'escultura' : 'arte-digital'}">← Volver a la obra</a></p>
        <div class="obra__grid">
          <figure class="obra__media">
            <img src="${img}" alt="${esc(o.title)} — ${esc(o.cat.toLowerCase())} de YOSO" width="1200" height="1200" fetchpriority="high">
          </figure>
          <div class="obra__info">
            <p class="eyebrow">${esc(o.cat)}</p>
            <h1>${esc(o.title)}</h1>
            <hr class="rule">
            <p class="obra__desc">${esc(o.desc)}</p>
            <dl class="facts">
              <div class="facts__row"><dt>Técnica</dt><dd>${esc(o.tech)}</dd></div>
              <div class="facts__row"><dt>Dimensiones</dt><dd>${esc(o.dims)}</dd></div>
              <div class="facts__row"><dt>Edición</dt><dd>${esc(o.edition)}</dd></div>
              <div class="facts__row"><dt>Año</dt><dd>${esc(o.year)}</dd></div>
              <div class="facts__row"><dt>Precio</dt><dd>Consultar · bajo solicitud</dd></div>
            </dl>
            <div class="obra__ctas">
              <a href="${mailto}" class="btn btn--gold">Consultar precio</a>
              <a href="index.html#contacto" class="btn btn--ghost">Formulario de contacto</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
  <footer class="site-footer">
    <div class="container site-footer__inner">
      <span class="brand brand--footer">YOSO</span>
      <p class="site-footer__copy">© 2026 YOSO · Ambrosio José López González · Madrid, España</p>
      <ul class="site-footer__links">
        <li><a href="https://www.instagram.com/yoso_arts/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
        <li><a href="https://x.com/yoso_arts" target="_blank" rel="noopener noreferrer">Twitter / X</a></li>
        <li><a href="https://platform.wise.art/artist/0x0845376a4c47530d082a315cFD3F2e66d9A6BA98" target="_blank" rel="noopener noreferrer">WISe.ART</a></li>
      </ul>
    </div>
  </footer>
</body>
</html>
`;
}

// 1) Escribir las fichas
for (const o of featured) {
  writeFileSync(join(ROOT, `obra-${o.slug}.html`), page(o), 'utf8');
}

// 2) Enlazar cada ficha desde su tarjeta en index.html
let idx = readFileSync(join(ROOT, 'index.html'), 'utf8');
let linked = 0;
for (const o of featured) {
  const re = new RegExp(`(<img src="assets/img/obra/${o.slug}\\.webp"[^>]*>\\s*</button>\\s*<figcaption class="work__cap">)([\\s\\S]*?)(</figcaption>)`);
  if (re.test(idx)) {
    idx = idx.replace(re, (m, a, mid, c) =>
      `${a}${mid}<a class="work__ficha" href="obra-${o.slug}.html">Ver ficha</a>${c}`);
    linked++;
  }
}
writeFileSync(join(ROOT, 'index.html'), idx, 'utf8');
console.log(`Fichas generadas: ${featured.length}. Enlazadas en galería: ${linked}.`);
