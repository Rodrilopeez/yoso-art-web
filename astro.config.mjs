// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Dominio final previsto (canonical, sitemap, OG absolutos).
  site: 'https://yoso.art',
  // Salida estática (galería sin backend de runtime).
  output: 'static',
  image: {
    // Formatos modernos para la obra (astro:assets).
    // El servicio por defecto usa sharp.
  },
  build: {
    inlineStylesheets: 'auto',
  },
  // Sitemap dinámico de todas las rutas estáticas (incluye obras/[slug]).
  // Sale en /sitemap-index.xml; se referencia desde public/robots.txt.
  integrations: [
    sitemap({
      // Excluimos endpoints/recursos sin valor de indexación si los hubiera.
      filter: (page) => !page.includes('/og/'),
    }),
  ],
});
