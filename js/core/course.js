// Motor del curs clínic: funció pura (sense DOM) que converteix plantilla + estat en text.
// La fan servir l'editor (pantalla i portapapers) i els tests.

/** Línia de títol de secció: "SEGUIMENT:", "VALORACIÓ INICIAL:"… */
export const HEADING = /^[A-ZÀ-ÜÇ' ]+:$/;

/** Selector d'idioma de sortida: T('català', 'castellano'). */
export const makeT = (lang) => (ca, es) => (lang === 'es' ? es : ca);
/** Selector de gènere segons el sexe del pacient: G('masc', 'fem', 'neutre'). */
export const makeG = (sex) => (masc, fem, both) => (sex === 'h' ? masc : sex === 'd' ? fem : both);

/**
 * Omple a l'estat compartit els valors inicials que falten d'un mode
 * (l'estat és comú a tots els modes: canviar de pestanya no perd dades).
 */
export function ensureState(data, mode) {
  for (const [k, v] of Object.entries(mode.init())) if (!(k in data)) data[k] = v;
  return data;
}

/**
 * @param {{ unitName: string, mode: { render: Function }, state: object, lang: 'ca'|'es' }} p
 * @returns {{ text: string, lines: { text: string, bold: boolean }[] }}
 *   La primera línia és sempre el nom de l'HD en majúscules (norma del projecte).
 */
export function buildCourse({ unitName, mode, state, lang }) {
  const body = mode.render(state, makeT(lang), makeG(state.sex)).trim();
  const text = `${unitName.toUpperCase()}\n\n${body}`;
  const lines = text.split('\n').map((line, i) => ({ text: line, bold: i === 0 || HEADING.test(line) }));
  return { text, lines };
}
