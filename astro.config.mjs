// @ts-check
import { defineConfig } from 'astro/config';

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
});
