// Contracte d'una plantilla (només documentació: JSDoc perquè l'editor ajudi en escriure'n una de nova).
// Els tests (tests/unit.test.js → validateTemplate) comproven que totes el compleixen.

/** @typedef {{ ca: string, es: string } | string} Bilingual */
/** @typedef {(ca: string, es: string) => string} TFn  Tria l'idioma de sortida. */
/** @typedef {(masc: string, fem: string, neutre: string) => string} GFn  Tria segons el sexe del pacient. */

/**
 * @typedef {object} Field
 * @property {'time'|'chips'|'pick'|'number'|'text'|'textarea'|'translated'|'toggle'|'vitals'|'note'} type
 * @property {string} id                 Clau a l'estat.
 * @property {Bilingual} [label]
 * @property {boolean} [wide]            Ocupa tota l'amplada.
 * @property {boolean} [multi]           chips: selecció múltiple.
 * @property {boolean} [required]        chips: no es pot desmarcar.
 * @property {object[]|((s: object) => object[])} [options]  chips/pick: [{ id, label }].
 * @property {(s: object) => boolean} [when]                 Només es mostra si retorna true.
 * @property {(s: object, value: any) => void} [onSet]       Efecte en canviar (p. ex. omplir altres camps).
 */

/**
 * @typedef {object} Mode  Una pestanya (General, Ingrés, No acut…).
 * @property {string} id
 * @property {Bilingual} label
 * @property {() => object} init                              Valors inicials (l'estat es comparteix entre modes).
 * @property {{ title: Bilingual, when?: (s: object) => boolean, fields: Field[] }[]} sections
 * @property {(s: object, T: TFn, G: GFn) => string} render   Text del CC (sense la capçalera de l'HD).
 */

/** @typedef {{ modes: Mode[] }} Template */

export {};
