// Plantilla de curs clínic: vacunació (carnets blau / taronja / vermell).
// Tries programa i visita → s'omplen soles les dosis d'avui → el PLA (properes dosis i data) es calcula sol.
import { L } from '../i18n/index.js';
import { VACCINES, PROGRAMS, addMonthsFmt } from '../data/vaccines.js';

const o = (id, ca, es) => ({ id, label: L(ca, es) });
const nm = (v) => (typeof v === 'object' ? v : { ca: v, es: v });
const vName = (id, T) => { const n = nm(VACCINES[id].name); return T(n.ca, n.es); };
const ord = (i, T) => T(`${i + 1}a dosi`, `${i + 1}ª dosis`);
const months = (n, T) => (n === 1 ? T('1 mes', '1 mes') : T(`${n} mesos`, `${n} meses`));
const isPneumo = (id) => id === 'pn20' || id === 'pn21';

const FROM = [
  o('hemato', 'Hematologia', 'Hematología'), o('reuma', 'Reumatologia', 'Reumatología'), o('digest', 'Digestiu', 'Digestivo'),
  o('derma', 'Dermatologia', 'Dermatología'), o('neuro', 'Neurologia', 'Neurología'), o('nefro', 'Nefrologia', 'Nefrología'),
  o('onco', 'Oncologia', 'Oncología'), o('infec', 'Infeccioses', 'Infecciosas'), o('tx', 'Unitat de trasplantament', 'Unidad de trasplante'),
];
const INCID = [o('no', 'Sense incidències', 'Sin incidencias'), o('si', 'Amb incidències', 'Con incidencias')];

// ---------- Lògica del calendari ----------
const program = (s) => PROGRAMS[s.program];
const sched = (s) => program(s)?.schedule ?? {};
const chosen = (s) => (s.vaccines ?? []).filter((v) => sched(s)[v]);
const visitMonths = (s) => [...new Set(chosen(s).flatMap((v) => sched(s)[v]))].sort((a, b) => a - b);
// Dosis previstes per al mes M: [{ key, vac, i }]
const dosesAt = (s, m) => chosen(s).flatMap((vac) => sched(s)[vac].map((off, i) => ({ key: `${vac}:${i}`, vac, i, off }))).filter((d) => d.off === m);
const recompute = (s) => { s.given = dosesAt(s, s.month).map((d) => d.key); };

// Pla: dosis futures agrupades per mes; les d'avui no administrades passen a la propera visita.
function planGroups(s) {
  const future = chosen(s).flatMap((vac) => sched(s)[vac].map((off, i) => ({ vac, i, off }))).filter((d) => d.off > s.month);
  const missed = dosesAt(s, s.month).filter((d) => !s.given.includes(d.key));
  const groups = new Map();
  for (const d of future) { if (!groups.has(d.off)) groups.set(d.off, []); groups.get(d.off).push(d); }
  const offs = [...groups.keys()].sort((a, b) => a - b);
  if (missed.length) {
    const next = offs[0] ?? s.month + 1;
    if (!groups.has(next)) { groups.set(next, []); offs.unshift(next); }
    groups.get(next).unshift(...missed);
  }
  return offs.map((off) => ({ off, doses: groups.get(off) }));
}

const warn = (vac) => (VACCINES[vac].live ? ' ⚠' : '');
const doseOptions = (s) => dosesAt(s, s.month).map(({ key, vac, i }) => {
  const n = nm(VACCINES[vac].name), b = VACCINES[vac].brand;
  return { id: key, label: L(`${i + 1}a dosi ${n.ca} (${b})${warn(vac)}`, `${i + 1}ª dosis ${n.es} (${b})${warn(vac)}`) };
});

const programOptions = Object.entries(PROGRAMS).map(([id, p]) => ({ id, label: p.label }));
const monthLabel = (m) => (m === 0 ? L('Dia 0', 'Día 0') : L(m === 1 ? '1 mes' : `${m} mesos`, m === 1 ? '1 mes' : `${m} meses`));

const vacunes = {
  id: 'vac',
  label: L('Vacunació', 'Vacunación'),
  init: () => {
    const s = { program: 'bio', month: 0, vaccines: [...PROGRAMS.bio.preset], given: [], age: '', from: null, fromOther: '', context: '',
      explained: true, incid: 'no', incidText: '', carnet: true, fullPlan: false, footer: true, extra: '' };
    recompute(s);
    return s;
  },
  sections: [
    { title: L('Programa', 'Programa'), fields: [
      { type: 'chips', id: 'program', required: true, wide: true, label: L('Carnet', 'Carnet'), options: programOptions,
        onSet: (s) => { s.vaccines = [...program(s).preset]; s.month = 0; recompute(s); } },
      { type: 'note', id: 'pnote', wide: true, text: (s) => program(s)?.note },
      { type: 'chips', id: 'vaccines', multi: true, wide: true, label: L('Vacunes del programa', 'Vacunas del programa'),
        options: (s) => Object.keys(sched(s)).map((v) => ({ id: v, label: L(nm(VACCINES[v].name).ca + warn(v), nm(VACCINES[v].name).es + warn(v)) })),
        onSet: recompute },
      { type: 'chips', id: 'month', required: true, wide: true, label: L('Visita d’avui', 'Visita de hoy'),
        options: (s) => visitMonths(s).map((m) => ({ id: m, label: monthLabel(m) })), onSet: recompute },
    ] },
    { title: L('Pacient', 'Paciente'), fields: [
      { type: 'number', id: 'age', label: L('Edat', 'Edad'), unit: L('anys', 'años') },
      { type: 'chips', id: 'from', wide: true, label: L('Derivat/da de', 'Derivado/a de'), options: FROM },
      { type: 'text', id: 'fromOther', label: L('Altre servei', 'Otro servicio') },
      { type: 'text', id: 'context', wide: true, label: L('Context (opcional)', 'Contexto (opcional)'), placeholder: L('Post TASPE: 21/11/24', 'Post TASPE: 21/11/24') },
    ] },
    { title: L('Administro avui', 'Administro hoy'), fields: [
      { type: 'chips', id: 'given', multi: true, wide: true, options: doseOptions, empty: L('Cap dosi prevista per a aquesta visita', 'Ninguna dosis prevista para esta visita') },
      { type: 'text', id: 'extra', wide: true, label: L('Altres vacunes administrades', 'Otras vacunas administradas') },
      { type: 'toggle', id: 'explained', text: L('Explico pauta + possibles EA. Accepta', 'Explico pauta + posibles EA. Acepta') },
      { type: 'chips', id: 'incid', required: true, label: L('Incidències immediates', 'Incidencias inmediatas'), options: INCID },
      { type: 'text', id: 'incidText', wide: true, label: L('Què ha passat', 'Qué ha pasado'), when: (s) => s.incid === 'si' },
      { type: 'toggle', id: 'carnet', text: L('Entrego carnet i registro', 'Entrego carnet y registro') },
    ] },
    { title: L('Pla', 'Plan'), fields: [
      { type: 'note', id: 'pnext', wide: true, text: (s) => {
        const g = planGroups(s)[0];
        return g ? L(`Propera visita d'aquí a ${g.off - s.month === 1 ? '1 mes' : `${g.off - s.month} mesos`} (${addMonthsFmt(Date.now(), g.off - s.month)})`,
          `Próxima visita dentro de ${g.off - s.month === 1 ? '1 mes' : `${g.off - s.month} meses`} (${addMonthsFmt(Date.now(), g.off - s.month)})`)
          : L('Programa completat: no queden dosis', 'Programa completado: no quedan dosis');
      } },
      { type: 'toggle', id: 'fullPlan', text: L('Mostrar tot el calendari pendent', 'Mostrar todo el calendario pendiente') },
      { type: 'toggle', id: 'footer', text: L('“Assistència per immunització”', '“Asistencia por inmunización”') },
    ] },
  ],
  render(s, T) {
    const from = s.fromOther || (FROM.find((x) => x.id === s.from) && T(...Object.values(FROM.find((x) => x.id === s.from).label)));
    const out = [];
    let p = T('Pacient', 'Paciente') + (s.age ? T(` de ${s.age} anys`, ` de ${s.age} años`) : '')
      + T(" que acut a l'HD", ' que acude al HD');
    if (from) p += T(` derivat ${/^[aeiouhàèéíòóú]/i.test(from) ? "d'" : 'de '}${from}`, ` derivado de ${from}`);
    p += s.month === 0 ? T(' per iniciar la vacunació.', ' para iniciar vacunación.') : T(' per continuar la vacunació.', ' para continuar vacunación.');
    out.push(p);
    if (s.context) out.push(s.context);
    if (s.explained) out.push('', T('Explico pauta de vacunació + possibles EA + com alleujar-los. Accepta.', 'Explico pauta de vacunación + posibles EA + cómo aliviarlos. Acepta.'));

    const given = dosesAt(s, s.month).filter((d) => s.given.includes(d.key));
    const adm = given.map((d) => `- ${ord(d.i, T)} ${vName(d.vac, T)}: ${VACCINES[d.vac].brand}`);
    if (s.extra) adm.push('- ' + s.extra);
    if (adm.length) {
      out.push('', T('ADMINISTRO:', 'ADMINISTRO:'), ...adm);
      out.push(s.incid === 'si' ? T('Incidències', 'Incidencias') + (s.incidText ? `: ${s.incidText}` : '') + '.' : T('Sense incidències immediates.', 'Sin incidencias inmediatas.'));
    }
    if (s.carnet) out.push('', T('Entrego carnet vacunal i registro en l’apartat corresponent.', 'Entrego carnet vacunal y registro en apartado correspondiente.'));

    const groups = planGroups(s);
    const shown = s.fullPlan ? groups : groups.slice(0, 1);
    const lbl = (d) => `${ord(d.i, T)} ${isPneumo(d.vac) ? VACCINES[d.vac].brand : vName(d.vac, T)}`;
    out.push('', T('PLA:', 'PLAN:'));
    if (!shown.length) out.push(T('- Programa de vacunació completat.', '- Programa de vacunación completado.'));
    for (const g of shown) {
      const n = g.off - s.month;
      out.push(T(`- Programo per a ${g.doses.map(lbl).join(' + ')} d'aquí a ${months(n, T)} (${addMonthsFmt(Date.now(), n)}).`,
        `- Programo para ${g.doses.map(lbl).join(' + ')} para dentro de ${months(n, T)} (${addMonthsFmt(Date.now(), n)}).`));
    }
    if (s.footer) out.push('', T('Assistència per immunització', 'Asistencia por inmunización'));
    return out.join('\n');
  },
};

const noShow = {
  id: 'noacut',
  label: L('No acut', 'No acude'),
  init: () => ({ noShowNote: '' }),
  sections: [{ title: L('No acut', 'No acude'), fields: [{ type: 'text', id: 'noShowNote', wide: true, label: L('Detall (opcional)', 'Detalle (opcional)') }] }],
  render(s, T) {
    return T("No acut a l'administració de les vacunes programades", 'No acude a la administración de las vacunas programadas') + (s.noShowNote ? ` (${s.noShowNote})` : '') + '.';
  },
};

export default { modes: [vacunes, noShow] };
