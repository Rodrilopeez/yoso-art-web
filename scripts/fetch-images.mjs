/* ============================================================
   Descarga las obras de yoso.art, las optimiza a WebP con sharp
   y reescribe index.html / sobre-yoso.html a rutas locales.
   Genera además una imagen Open Graph 1200×630.
   Uso: npm run images
   ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { allWorks, BASE } from './works-data.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'assets', 'img', 'obra');
mkdirSync(OUT, { recursive: true });

const works = allWorks();

// 1) Validar slugs únicos
const seen = new Map();
for (const w of works) {
  if (seen.has(w.slug)) throw new Error(`Slug duplicado: ${w.slug} (${w.title} / ${seen.get(w.slug)})`);
  seen.set(w.slug, w.title);
}

async function download(url) {
  const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (yoso-art-web build)' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} en ${url}`);
  return Buffer.from(await r.arrayBuffer());
}

const MAX = 1200, Q = 80;
let identityBuf = null;
const urlToLocal = new Map();

for (const w of works) {
  const buf = await download(w.url);
  const dest = join(OUT, `${w.slug}.webp`);
  await sharp(buf)
    .rotate()
    .resize({ width: MAX, height: MAX, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: Q })
    .toFile(dest);
  urlToLocal.set(w.url, `assets/img/obra/${w.slug}.webp`);
  if (w.slug === 'identity') identityBuf = buf;
  process.stdout.write('.');
}
console.log(`\nOptimizadas ${works.length} obras → assets/img/obra/`);

// 2) Imagen Open Graph 1200×630 (cover) a partir de "Identity"
if (identityBuf) {
  await sharp(identityBuf)
    .resize(1200, 630, { fit: 'cover', position: 'attention' })
    .jpeg({ quality: 82 })
    .toFile(join(ROOT, 'assets', 'img', 'og-yoso.jpg'));
  console.log('OG 1200×630 → assets/img/og-yoso.jpg');
}

// 3) Reescritura del HTML
const OG = 'https://yoso.art/assets/img/og-yoso.jpg';
function rewrite(file) {
  let h = readFileSync(file, 'utf8');
  // Metadatos sociales y JSON-LD "image" → OG absoluta
  h = h.replace(/(property="og:image" content=")[^"]*(")/g, `$1${OG}$2`);
  h = h.replace(/(name="twitter:image" content=")[^"]*(")/g, `$1${OG}$2`);
  h = h.replace(/("image":\s*")https:\/\/yoso\.art\/wp-content\/uploads\/[^"]*(")/g, `$1${OG}$2`);
  // Imágenes de obra / hero → rutas locales relativas
  for (const [url, local] of urlToLocal) {
    h = h.split(`"${url}"`).join(`"${local}"`);
    h = h.split(`'${url}'`).join(`'${local}'`);
  }
  writeFileSync(file, h, 'utf8');
  // Comprobar que no queda ningún hotlink de obra
  const left = (h.match(/https:\/\/yoso\.art\/wp-content\/uploads\//g) || []).length;
  console.log(`${file.split(/[\\/]/).pop()}: hotlinks wp-content restantes = ${left}`);
}
rewrite(join(ROOT, 'index.html'));
rewrite(join(ROOT, 'sobre-yoso.html'));
console.log('Reescritura completada.');
