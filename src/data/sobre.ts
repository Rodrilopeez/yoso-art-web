/**
 * Contenido editorial de la página /sobre (dossier del artista YOSO).
 * Fuente: contenido real facilitado por el cliente (no inventar). Para actualizar
 * cuando YOSO gane nuevos premios/exponga, edita los arrays de abajo.
 */

export const identity = {
  artistName: 'Yoso',
  realName: 'Ambrosio López González',
  city: 'Madrid',
};

/** Statement — 4 párrafos textuales de la web original. */
export const statement: string[] = [
  'Artista multidisciplinar, centrado en la creación digital, fotografía y escultura, tras desarrollarme en la arquitectura y el diseño.',
  'Obras con frecuencia inspiradas en sueños y visiones fugaces, lo que les confiere un carácter enigmático y en ocasiones surrealista, que invita a la reflexión.',
  'El arte concebido como un instrumento de análisis del ser humano, un intento de aproximación al concepto de identidad y a la singularidad del individuo desde nuevas perspectivas.',
  'Obsesión por el detalle plasmada en altas resoluciones que permiten grandes formatos.',
];

export interface Award {
  name: string;
  place?: string;
  result: string;       // etiqueta: "Finalista", "Mención de Honor", "Ganador", …
  winner?: boolean;     // true → badge GANADOR en oro
  note?: string;        // caption opcional
}
export interface YearGroup<T> { year: string; items: T[] }

/** Premios y convocatorias (más reciente → más antiguo). */
export const premios: YearGroup<Award>[] = [
  { year: '2026', items: [
    { name: 'Sestante Art Prize', place: 'Cascaes-Lisboa', result: 'Ganador', winner: true },
    { name: 'Certamen Nacional de Pintura Fundación Jorge Alió', place: 'Alicante', result: 'Finalista' },
  ]},
  { year: '2025', items: [
    { name: 'Silicon Valley Int. Contemporary Art Competition', place: 'Fremont, EE.UU.', result: 'Mención de Honor' },
    { name: 'Premios WISeArt a la Excelencia', place: 'Ginebra, Suiza', result: 'Ganador · 2.º Premio', winner: true },
    { name: 'Competición Forte di Bard', place: 'Valle de Aosta, Italia', result: 'Finalista' },
    { name: 'Premio de Pintura Universidad de Murcia', result: 'Finalista' },
    { name: 'Bienal Internacional de Andorra', result: 'Programa oficial' },
    { name: 'J+ Art Awards', place: 'Bali, Indonesia', result: 'Finalista' },
  ]},
  { year: '2024', items: [
    { name: 'ARTE LAGUNA Prize 23.24', place: 'Venecia', result: 'Finalista' },
    { name: 'Certamen Nacional de Pintura RCM', place: 'Málaga', result: 'Finalista' },
    { name: 'ARTE LAGUNA WORLD', place: 'Venecia', result: 'Selección de Comisarios Internacionales 2023–2024' },
    { name: 'Premio Fundación Amedeo Modigliani', place: 'Roma', result: 'Finalista' },
    { name: 'No Name Collective Art Magazine', place: 'Londres', result: 'Ganador · Challenge 2024', winner: true },
  ]},
  { year: '2023', items: [
    { name: 'Premio de Arte Digital Jaume Graells', place: 'Igualada, Barcelona', result: 'Ganador', winner: true },
    { name: 'Bienal de Valencia', place: 'Museo de la Ciudad', result: 'Mención de Honor' },
    { name: 'NASDAQ Tower, Times Square', place: 'Nueva York', result: 'Seleccionado',
      note: 'Consulado General de España y Wise Art — «los artistas españoles más destacados».' },
  ]},
];

export interface Show { name: string; place?: string; note?: string }

/** Ferias y muestras. */
export const ferias: YearGroup<Show>[] = [
  { year: '2026', items: [
    { name: 'Hybrid Art Fair', place: 'Petit Palace Santa Bárbara, Madrid', note: 'Programa «Displaced»' },
  ]},
  { year: '2025', items: [
    { name: 'MACRO ART 2025', place: 'Ciudad de Panamá' },
    { name: 'IX Art Battalion', place: 'Madrid' },
    { name: 'PhygitArt 25', place: 'Palazzo Magherini Graziani, San Giustino PG, Italia' },
    { name: 'NOW Fest — El Jardí Digital 2025', place: 'Puerto de Tarragona' },
    { name: 'Arte Laguna Prize · 20 Aniversario', place: 'Shanghái' },
  ]},
  { year: '2024', items: [
    { name: "ART MADRID'24", place: 'Palacio de Cibeles, Madrid' },
    { name: 'The Kishin Alwani Foundation', place: 'Gibraltar' },
    { name: '45.ª Muestra Internacional de Arte Contemporáneo', place: 'Castillo de Montesquiu, Barcelona', note: 'Diputación de Barcelona y Circuit Artístic' },
  ]},
];

/** Exposiciones individuales. */
export const individuales: YearGroup<Show>[] = [
  { year: '2024', items: [
    { name: 'Abartium Gallery', place: 'Vic, Barcelona' },
    { name: 'XAPO Bank Gallery', place: 'Gibraltar' },
    { name: 'SO Hotel', place: 'Sotogrande, Cádiz' },
    { name: 'Ayuntamiento de Igualada', place: 'Barcelona' },
  ]},
];

/** Selección de exposiciones colectivas. */
export const colectivas: YearGroup<Show>[] = [
  { year: '2026', items: [
    { name: 'Mesa Contemporary Arts Museum', place: 'Mesa, AZ, EE.UU.' },
  ]},
  { year: '2025', items: [
    { name: 'El Martinete TFAG', place: 'Marbella' },
    { name: "CICA Museum · «Breath 25»", place: 'Gimpo, Corea del Sur' },
    { name: 'Aeropuerto de Milán Malpensa · «A mountain of…signs»', place: 'Italia' },
  ]},
  { year: '2024', items: [
    { name: 'Art Space Gallery', place: 'Gibraltar' },
    { name: 'The Fusion Art Gallery', place: 'Marbella' },
    { name: 'The Canvas 3.0', place: 'World Trade Center, Nueva York' },
  ]},
  { year: '2023', items: [
    { name: 'Galería Uxval Gochez', place: 'Barcelona' },
  ]},
];

export interface Press { name: string; note?: string; url?: string; date?: string }

/** Publicaciones y prensa. */
export const prensa: YearGroup<Press>[] = [
  { year: '2025', items: [
    { name: "Entrevista · Diari d'Andorra", date: '4/10/2025',
      url: 'https://www.diariandorra.ad/la-contra/251004/yoso-les-glaceres-son-gegants-vius-estan-caient-l-oblit_181322.html' },
  ]},
  { year: '2024', items: [
    { name: 'Aedra Fine Arts', place: 'Jersey City, NJ, EE.UU.', note: 'Seleccionado para el catálogo «Finale» 2024' } as Press,
  ]},
];
