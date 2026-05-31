/* Datos de obra de YOSO (fuente única). [título, ruta en wp-content]. */
export const BASE = 'https://yoso.art/wp-content/uploads/';

export const digital = [
  ['Identity', '2022/10/IdentiL1024srgb72ppp.webp'],
  ['Judas', '2024/03/Judas3.png'],
  ["Cardinals' Dance", '2023/10/CARDENALES512x512srgb150ppp.webp'],
  ['Your Home, Your Land', '2023/06/Your-Home-512x512srgb150ppp.jpg'],
  ['Mr. and Mrs. Europe Go on Vacation', '2024/07/LVva512x512srgb150fisico.webp'],
  ['Mr. and Mrs. Europe Come Back from Vacation', '2024/07/LVvuelve512x512srgb150fisico.webp'],
  ['Michelagnolo', '2024/06/DAVID512x512srgb150ppp.jpg'],
  ['Tattoo', '2024/07/TATTOO512x512srgb150pppfisico.webp'],
  ['Eve', '2022/10/Eva512x512srgb72ppp.webp'],
  ['Adam', '2022/10/ADAN-COMBI-INVER-L50-2560-150.webp'],
  ['Meat', '2022/12/CARNE512x512srgb72ppp.webp'],
  ['Dream of Red Wave I', '2022/10/Sueno11024x1024srgb72ppp.webp'],
  ['Dream of Red Wave II', '2022/10/Sueno2512x512srgb72ppp.webp'],
  ['Veritas and the Wolf Pack', '2022/10/Veritas11024x1024srgb72ppp.webp'],
  ['Newborn White on Blue', '2022/11/RecienBA512x512srgb150ppp70pc.png'],
  ['Newborn Red on Yellow', '2022/11/RecienRA512x512srgb150ppp70pc.png'],
  ['Newborn Blue on Red', '2024/06/RecienNacidorojo512x512srgb150ppp.png'],
  ['Cargo Ships in the Bay', '2024/09/MERCANTES2_512srgb150ppp.jpg'],
  ['Starlings in Orange', '2022/10/Estor11024x1024srgb72ppp.png'],
  ['New Gods I', '2022/10/NDI512x512srgb72ppp.webp'],
  ['New Gods II', '2022/10/NDII512x512srgb72ppp.webp'],
  ['Family Portrait on Sofa', '2025/12/RETRATO512x512srgb150ppp.webp'],
  ['Withered Flower', '2025/06/SUIZA512x512srgb150ppp.webp'],
  ['Tank Young Man', '2022/10/TanqueL512srgb72ppp.webp'],
  ['August Wind', '2022/10/Viento11024x1024srgb72ppp.webp'],
  ['Alone', '2022/10/Sola512x512srgb72ppp.webp'],
  ['99 Hearts', '2022/10/99cor512x512srgb72ppp30pc.webp'],
  ['Bishop Bending Down', '2023/08/Obispo-Yoso-512x512-1.png'],
  ['Expansion', '2023/07/Expansion512x512srgb150ppp.webp'],
  ['Miage Glacier', '2025/06/AOSTA512x512srgb150ppp.jpg'],
  ['Floats', '2024/12/FLOTA512x512rgb150ppp.jpg'],
  ['WC', '2022/10/WC11024x1024srgb72ppp.png'],
];

export const photos = [
  ['January Landscape', '2022/11/Marib-SS-003_1080.webp'],
  ['Calm', '2022/11/12A_1553_1080.webp'],
  ['Golden Cage', '2022/11/badajoz003472wm30_1080.webp'],
  ['On the Beach', '2022/11/PLAYA_1080.webp'],
  ['Looking', '2022/11/36A_0408monos_1080.webp'],
  ['Sunset Fishing', '2022/11/MyanmarUBeinpescador-2_1080.webp'],
  ['Rough Water', '2022/11/DSC_0633_1080.webp'],
  ['Fire', '2022/11/Incendio-2009-07-14-118_1080.webp'],
  ['Full Moon', '2022/11/DSC_0019_1080.webp'],
  ['Constellation', '2022/11/DSC_0278_1080.webp'],
  ['Fair 1', '2022/11/DSC_0992_1080.webp'],
  ['Gold', '2022/11/27_4_0879_1080.webp'],
  ['In the Fog', '2022/11/DSC_0059_1080.webp'],
  ['Roman Sky', '2022/11/DSC_0084brillo_1080.webp'],
  ['Do Bigger Things', '2022/11/DSC_0213_1080.webp'],
  ['Landscape with Sail', '2022/11/DSC_0029_1080.webp'],
  ['Fishing in Gray', '2022/11/DSC_0455_1080.webp'],
  ['The End of Spider-Man', '2022/11/VENE_112b11_1080.webp'],
  ['Mimicry', '2022/11/DSC_0343b_1080.webp'],
  ['Shangri-La', '2022/11/DSC_0050_1080.webp'],
];

export const sculpture = [
  ['Ecos', '2026/03/ECOS-WEB-5DEF.webp', 'Instalación · 108 zapatos rojos, 1 negro, audio · 2026'],
  ['Soplo de Vida', '2022/10/CACHL30MAX-scaled.jpg', 'Maniquí CACHAREL (c. 1950), maderas nobles y latón · 67 × 175 cm'],
  ['La Boda', '2022/09/CALAVERAS-DEF-SOLO-NOVIA-MULTIPLI-L30.png', 'Escultura'],
];

export function slugify(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Devuelve todas las obras con {title, path, url, slug, meta, cat}. */
export function allWorks() {
  const map = (arr, cat) => arr.map((it) => ({
    title: it[0], path: it[1], url: BASE + it[1], slug: slugify(it[0]),
    meta: it[2] || null, cat,
  }));
  return [...map(digital, 'digital'), ...map(sculpture, 'escultura'), ...map(photos, 'foto')];
}
