// Lògica pura del calendari vacunal (sense DOM ni text): què toca avui i què es programa.
// Estat mínim: { program, vaccines, month, given, addNext }.
import { PROGRAMS } from '../data/vaccines.js';

export const program = (s) => PROGRAMS[s.program];
export const isFixed = (s) => !!program(s)?.fixed;
const sched = (s) => program(s)?.schedule ?? {};

/** Vacunes del programa que estan seleccionades. */
export const chosen = (s) => (s.vaccines ?? []).filter((v) => sched(s)[v]);
/** Vacunes del programa (seleccionades o no). */
export const programVaccines = (s) => Object.keys(sched(s));
/** Mesos en què hi ha visita (ordenats). */
export const visitMonths = (s) => [...new Set(chosen(s).flatMap((v) => sched(s)[v]))].sort((a, b) => a - b);

/** Dosis previstes al mes m: [{ key: 'vac:i', vac, i, off }]. */
export const dosesAt = (s, m) => chosen(s)
  .flatMap((vac) => sched(s)[vac].map((off, i) => ({ key: `${vac}:${i}`, vac, i, off })))
  .filter((d) => d.off === m);

/** Marca com a administrades totes les dosis previstes per a la visita actual. */
export function selectDueDoses(s) {
  s.given = dosesAt(s, s.month).map((d) => d.key);
  if (isFixed(s)) s.addNext = [];
}

/**
 * Pla de properes visites: [{ off, doses: [{ vac, i }] }], off = mes absolut del programa.
 * - Les dosis futures mantenen el seu mes.
 * - Si avui no es posa una dosi prevista, aquesta passa a la propera visita
 *   i les dosis següents d'aquella vacuna es desplacen amb el mateix interval.
 * - Les vacunes afegides des del pla comencen a la propera visita amb el seu calendari.
 */
export function planGroups(s) {
  const S = sched(s), M = s.month;
  const futureOffs = chosen(s).flatMap((v) => S[v]).filter((off) => off > M);
  const next = futureOffs.length ? Math.min(...futureOffs) : M + 1;
  const items = [];

  for (const vac of chosen(s)) {
    const offs = S[vac];
    const k = offs.findIndex((off, i) => off === M && !s.given.includes(`${vac}:${i}`));
    offs.forEach((off, i) => {
      if (k !== -1 && i >= k) items.push({ vac, i, off: next + (off - offs[k]) });
      else if (off > M) items.push({ vac, i, off });
    });
  }
  for (const vac of s.addNext ?? []) {
    if (chosen(s).includes(vac)) continue;
    const offs = S[vac] ?? [0];
    offs.forEach((off, i) => items.push({ vac, i, off: next + (off - offs[0]) }));
  }

  const groups = new Map();
  for (const d of items) {
    if (!groups.has(d.off)) groups.set(d.off, []);
    groups.get(d.off).push({ vac: d.vac, i: d.i });
  }
  return [...groups.keys()].sort((a, b) => a - b).map((off) => ({ off, doses: groups.get(off) }));
}
