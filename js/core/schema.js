// Validació estructural de plantilles: detecta errors de configuració abans que arribin a la pantalla.
import { FIELD_TYPES } from './fields.js';

const isBilingual = (x) => typeof x === 'string' || (x && typeof x.ca === 'string' && typeof x.es === 'string');

/** Retorna la llista d'errors (buida si la plantilla és correcta). */
export function validateTemplate(name, tpl) {
  const errors = [];
  const err = (m) => errors.push(`${name}: ${m}`);
  if (!Array.isArray(tpl?.modes) || !tpl.modes.length) return [`${name}: no té modes`];
  const modeIds = new Set();
  for (const m of tpl.modes) {
    const where = `mode "${m.id}"`;
    if (!m.id || modeIds.has(m.id)) err(`${where}: id buit o repetit`);
    modeIds.add(m.id);
    if (!isBilingual(m.label)) err(`${where}: etiqueta no bilingüe`);
    if (typeof m.init !== 'function' || typeof m.render !== 'function') err(`${where}: falta init() o render()`);
    const state = m.init?.() ?? {};
    const ids = new Set();
    for (const sec of m.sections ?? []) {
      if (!isBilingual(sec.title)) err(`${where}: secció sense títol bilingüe`);
      for (const f of sec.fields ?? []) {
        if (!FIELD_TYPES.includes(f.type)) err(`${where}: tipus de camp desconegut "${f.type}" (${f.id})`);
        if (!f.id) err(`${where}: camp sense id`);
        else if (ids.has(f.id)) err(`${where}: id de camp repetit "${f.id}"`);
        ids.add(f.id);
        if (f.label != null && !isBilingual(f.label)) err(`${where}: etiqueta no bilingüe a "${f.id}"`);
        if (f.type !== 'note' && f.type !== 'vitals' && !(f.id in state)) err(`${where}: "${f.id}" no té valor inicial a init()`);
        const opts = typeof f.options === 'function' ? null : f.options;
        if (opts) {
          const oids = opts.map((x) => x.id);
          if (new Set(oids).size !== oids.length) err(`${where}: opcions repetides a "${f.id}"`);
          if (opts.some((x) => !isBilingual(x.label))) err(`${where}: opció no bilingüe a "${f.id}"`);
        }
      }
    }
  }
  return errors;
}
