// Plantilla de curs clínic: vacunació (carnets blau / taronja / vermell).
// Tries programa i visita → s'omplen soles les dosis d'avui → el PLA (properes dosis i data) es calcula sol.
import { L } from '../i18n/index.js';
import { VACCINES, PROGRAMS, addMonthsFmt } from '../data/vaccines.js';
import { o, noShowMode } from './kit.js';
import { program, isFixed, chosen, programVaccines, visitMonths, dosesAt, selectDueDoses, planGroups } from '../domain/vaccinePlan.js';

const nm = (v) => (typeof v === 'object' ? v : { ca: v, es: v });
const vName = (id, T) => { const n = nm(VACCINES[id].name); return T(n.ca, n.es); };
const ord = (i, T) => T(`${i + 1}a dosi`, `${i + 1}ª dosis`);
const months = (n, T) => (n === 1 ? T('1 mes', '1 mes') : T(`${n} mesos`, `${n} meses`));
const isPneumo = (id) => id === 'pn21';

const FROM = [
  o('hemato', 'Hematologia', 'Hematología'), o('reuma', 'Reumatologia', 'Reumatología'), o('digest', 'Digestiu', 'Digestivo'),
  o('derma', 'Dermatologia', 'Dermatología'), o('neuro', 'Neurologia', 'Neurología'), o('nefro', 'Nefrologia', 'Nefrología'),
  o('onco', 'Oncologia', 'Oncología'), o('cexinf', 'CEX Infeccioses', 'CEX Infecciosas'), o('tx', 'Unitat de trasplantament', 'Unidad de trasplante'),
];
const INCID = [o('no', 'Sense incidències', 'Sin incidencias'), o('si', 'Amb incidències', 'Con incidencias')];

const recompute = selectDueDoses;

const warn = (vac) => (VACCINES[vac].live ? ' ⚠' : '');
const doseOptions = (s) => dosesAt(s, s.month).map(({ key, vac, i }) => {
  const n = nm(VACCINES[vac].name), b = VACCINES[vac].brand;
  return { id: key, label: L(`${i + 1}a dosi ${n.ca} (${b})${warn(vac)}`, `${i + 1}ª dosis ${n.es} (${b})${warn(vac)}`) };
});

const programOptions = Object.entries(PROGRAMS).map(([id, p]) => ({ id, label: p.label }));
// Programes tancats: "Dia 1, Dia 2…" (ordre de visita); oberts: mes del programa.
const visitLabel = (s, m, idx) => (isFixed(s)
  ? L(`Dia ${idx + 1}`, `Día ${idx + 1}`)
  : monthLabel(m));
const monthLabel = (m) => (m === 0 ? L('Dia 0', 'Día 0') : L(m === 1 ? '1 mes' : `${m} mesos`, m === 1 ? '1 mes' : `${m} meses`));

const vacunes = {
  id: 'vac',
  label: L('Vacunació', 'Vacunación'),
  init: () => {
    const s = { program: 'onco', month: 0, vaccines: [...PROGRAMS.onco.preset], given: [], age: '', context: '',
      explained: true, incid: 'no', incidText: '', carnet: true, fullPlan: false, addNext: [], extra: '' };
    recompute(s);
    return s;
  },
  sections: [
    { title: L('Pacient i programa', 'Paciente y programa'), fields: [
      { type: 'chips', id: 'program', required: true, wide: true, label: L('Derivat/da de', 'Derivado/a de'), options: programOptions,
        onSet: (s) => { s.vaccines = [...program(s).preset]; s.month = 0; s.addNext = []; recompute(s); } },
      { type: 'note', id: 'pnote', wide: true, text: (s) => program(s)?.note },
      { type: 'chips', id: 'vaccines', multi: true, wide: true, when: (s) => !isFixed(s), label: L('Vacunes del programa', 'Vacunas del programa'),
        options: (s) => programVaccines(s).map((v) => ({ id: v, label: L(nm(VACCINES[v].name).ca + warn(v), nm(VACCINES[v].name).es + warn(v)) })),
        onSet: recompute },
      { type: 'chips', id: 'month', required: true, wide: true, label: L('Visita d’avui', 'Visita de hoy'),
        options: (s) => visitMonths(s).map((m, i) => ({ id: m, label: visitLabel(s, m, i) })), onSet: recompute },
      { type: 'number', id: 'age', label: L('Edat', 'Edad'), unit: L('anys', 'años') },
      { type: 'text', id: 'context', wide: true, label: L('Context (opcional)', 'Contexto (opcional)'), placeholder: L('Post TASPE: 21/11/24', 'Post TASPE: 21/11/24') },
    ] },
    { title: L('Administro avui', 'Administro hoy'), fields: [
      { type: 'note', id: 'fixedToday', wide: true, when: isFixed, text: (s) => {
        const d = dosesAt(s, s.month);
        return d.length ? L(d.map((x) => `${x.i + 1}a dosi ${nm(VACCINES[x.vac].name).ca} (${VACCINES[x.vac].brand})`).join(' · '), d.map((x) => `${x.i + 1}ª dosis ${nm(VACCINES[x.vac].name).es} (${VACCINES[x.vac].brand})`).join(' · ')) : null;
      } },
      { type: 'chips', id: 'given', multi: true, wide: true, when: (s) => !isFixed(s), options: doseOptions, empty: L('Cap dosi prevista per a aquesta visita', 'Ninguna dosis prevista para esta visita') },
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
      { type: 'chips', id: 'addNext', multi: true, wide: true, when: (s) => !isFixed(s), label: L('Afegir a la propera visita', 'Añadir a la próxima visita'),
        options: (s) => Object.keys(VACCINES).filter((v) => !chosen(s).includes(v)).map((v) => ({ id: v, label: L(nm(VACCINES[v].name).ca + (isPneumo(v) ? ` (${VACCINES[v].brand})` : '') + warn(v), nm(VACCINES[v].name).es + (isPneumo(v) ? ` (${VACCINES[v].brand})` : '') + warn(v)) })) },
      { type: 'toggle', id: 'fullPlan', text: L('Mostrar tot el calendari pendent', 'Mostrar todo el calendario pendiente') },
    ] },
  ],
  render(s, T) {
    const f = FROM.find((x) => x.id === program(s)?.from);
    const from = f && T(f.label.ca, f.label.es);
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
      out.push(T(`- Programo per a ${g.doses.map(lbl).join(' + ')} d'aquí a ${months(n, T)}.`,
        `- Programo para ${g.doses.map(lbl).join(' + ')} para dentro de ${months(n, T)}.`));
    }
    return out.join('\n');
  },
};

const noShow = noShowMode(["No acut a l'administració de les vacunes programades", 'No acude a la administración de las vacunas programadas']);

export default { modes: [vacunes, noShow] };
