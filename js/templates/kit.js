// Kit comú de les plantilles: opcions, helpers de text i frases repetides entre HD.
// Una plantilla només ha d'importar d'aquí; així totes redacten igual.
import { L } from '../i18n/index.js';

// ---------- Opcions ----------
/** Opció de xip bilingüe. `out` (opcional): text alternatiu per al CC [ca, es]. */
export const o = (id, ca, es, out) => ({ id, label: L(ca, es), ...(out ? { out } : {}) });
/** Opcions seleccionades, en l'ordre de la llista d'opcions. */
export const pick = (opts, ids = []) => opts.filter((x) => ids.includes(x.id));
/** Etiqueta d'una opció en l'idioma de sortida. */
export const lbl = (x, T) => T(x.label.ca, x.label.es);

export const SEX = [o('h', 'Home', 'Hombre'), o('d', 'Dona', 'Mujer')];
/** Extremitat superior dreta/esquerra (ESI en castellà). */
export const SIDE = [o('esd', 'ESD', 'ESD'), o('ese', 'ESE', 'ESI')];

// ---------- Helpers de text ----------
export const hhmm = (v) => v || '__:__';
export const cap = (s) => s.replace(/^./, (c) => c.toUpperCase());
/** Número des d'un text ("36,5" → 36.5) o null. */
export const num = (v) => { const n = parseFloat(String(v ?? '').replace(',', '.')); return Number.isFinite(n) ? n : null; };
/** Línies no buides d'un text de diverses línies. */
export const lines = (txt) => (txt || '').split('\n').map((l) => l.trim()).filter(Boolean);
/** Línies com a llista "- …" (respecta guions/punts que ja hi hagi). */
export const bullets = (txt) => lines(txt).map((l) => '- ' + l.replace(/^[-*•]\s*/, ''));

/**
 * Constructor de curs clínic per seccions: les seccions buides no surten.
 *   const doc = createDoc(); doc.line('…'); doc.section('PLA:', ['- …']); return doc.toString();
 */
export function createDoc() {
  const out = [];
  return {
    line(...l) { out.push(...l.filter((x) => x != null && x !== false)); return this; },
    gap() { if (out.length && out.at(-1) !== '') out.push(''); return this; },
    section(title, body) {
      const b = body.filter((x) => x != null && x !== false && x !== '');
      if (b.length) { this.gap(); out.push(title, ...b); }
      return this;
    },
    toString: () => out.join('\n'),
  };
}

// ---------- Frases compartides ----------
export const phrases = {
  /** "Està conscient, orientada i hemodinàmicament estable." */
  stable: (T, G) => T(`Està conscient, ${G('orientat', 'orientada', 'orientat/da')} i hemodinàmicament estable.`,
    `Está consciente, ${G('orientado', 'orientada', 'orientado/a')} y hemodinámicamente estable.`),
  accompanied: (T, G) => T(G('acompanyat', 'acompanyada', 'acompanyat/da'), G('acompañado', 'acompañada', 'acompañado/a')),
  alone: (T, G) => T(G('sol', 'sola', 'sol/a'), G('solo', 'sola', 'solo/a')),
  /** Incidències/complicacions: "Sense incidències." o "Incidències: …". */
  incidents: (has, detail, T, kind = 'inc') => {
    const w = kind === 'comp' ? [T('Complicacions', 'Complicaciones'), T('Sense complicacions', 'Sin complicaciones')]
      : [T('Incidències', 'Incidencias'), T('Sense incidències', 'Sin incidencias')];
    return has ? w[0] + (detail ? `: ${detail}` : '') : w[1];
  },
};

// ---------- Modes reutilitzables ----------
/** Mode "No acut" genèric: frase base + detall opcional. */
export function noShowMode(base) {
  return {
    id: 'noacut',
    label: L('No acut', 'No acude'),
    init: () => ({ noShowNote: '' }),
    sections: [{ title: L('No acut', 'No acude'), fields: [{ type: 'text', id: 'noShowNote', wide: true, label: L('Detall (opcional)', 'Detalle (opcional)') }] }],
    render: (s, T) => T(...base) + (s.noShowNote ? ` (${s.noShowNote})` : '') + '.',
  };
}
