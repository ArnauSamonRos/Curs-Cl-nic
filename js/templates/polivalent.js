// Plantilla de curs clínic: HD Polivalent (1 i 2).
// Tractaments i proves: js/data/treatments.js. Estructura genèrica d'infusió / procediment;
// els passos específics per tractament es poden afegir a la taula de tractaments.
import { L } from '../i18n/index.js';
import { nowHHMM, addMinutes } from '../core/time.js';
import { formatVitals, joinList } from '../core/text.js';
import { TREATMENTS, getTreatment } from '../data/treatments.js';
import { o, pick, lbl, hhmm, SEX, SIDE, phrases } from './kit.js';


const TTOS = TREATMENTS.filter((x) => x.kind === 'tto');
const PROCS = TREATMENTS.filter((x) => x.kind === 'proc');

const ACCESS = [
  o('vvp', 'Via perifèrica', 'Vía periférica'),
  o('pac', 'Port-a-cath', 'Port-a-cath'),
  o('picc', 'PICC', 'PICC'),
];
const GAUGE = ['18', '20', '22', '24'].map((g) => o(g, `${g}G`, `${g}G`));
const SITE = [
  o('bd', 'Braç dret', 'Brazo derecho'),
  o('be', 'Braç esquerre', 'Brazo izquierdo'),
  o('md', 'Mà dreta', 'Mano derecha'),
  o('me', 'Mà esquerra', 'Mano izquierda'),
];
const PREMED = [
  o('para', 'Paracetamol 1 g EV', 'Paracetamol 1 g EV'),
  o('dexclor', 'Dexclorfeniramina 5 mg EV', 'Dexclorfeniramina 5 mg EV'),
  o('metil', 'Metilprednisolona 100 mg EV', 'Metilprednisolona 100 mg EV'),
  o('hidro', 'Hidrocortisona 100 mg EV', 'Hidrocortisona 100 mg EV'),
];
const PREP = [
  o('dejuni', 'Dejuni comprovat', 'Ayuno comprobado'),
  o('ci', 'Consentiment signat', 'Consentimiento firmado'),
  o('alergies', 'Al·lèrgies revisades', 'Alergias revisadas'),
];
const COMPANY = [o('si', 'Acompanyat/da', 'Acompañado/a'), o('no', 'Sol/a', 'Solo/a')];
const INCIDENTS = [o('no', 'Sense incidències', 'Sin incidencias'), o('si', 'Amb incidències', 'Con incidencias')];
const VITALS_SHOW = ['ta', 'fc', 'temp'];
const POST = [
  o('oral', 'Tolerància oral', 'Tolerancia oral'),
  o('diuresi', 'Diüresi espontània', 'Diuresis espontánea'),
  o('aposit', 'Apòsit net i sec', 'Apósito limpio y seco'),
  o('dolor', 'Sense dolor', 'Sin dolor'),
];

// ---------- Camps compartits ----------
const F = {
  time: { type: 'time', id: 'time', label: L('Hora d’arribada', 'Hora de llegada') },
  sex: { type: 'chips', id: 'sex', label: L('Sexe', 'Sexo'), options: SEX },
  company: { type: 'chips', id: 'company', label: L('Acompanyant', 'Acompañante'), options: COMPANY },
  incidents: { type: 'chips', id: 'incidents', required: true, label: L('Incidències', 'Incidencias'), options: INCIDENTS },
  incidentText: { type: 'text', id: 'incidentText', wide: true, label: L('Què ha passat i actuació', 'Qué ha pasado y actuación'), when: (s) => s.incidents === 'si' },
  v0: { type: 'vitals', id: 'v0', wide: true, show: VITALS_SHOW },
  stable: { type: 'toggle', id: 'stable', text: L('Conscient, orientat/da i hemodinàmicament estable', 'Consciente, orientado/a y hemodinámicamente estable') },
  access: { type: 'chips', id: 'access', label: L('Accés venós', 'Acceso venoso'), options: ACCESS },
  gauge: { type: 'chips', id: 'gauge', label: L('Calibre', 'Calibre'), options: GAUGE, when: (s) => s.access === 'vvp' },
  site: { type: 'chips', id: 'site', label: L('Localització', 'Localización'), options: SITE, wide: true, when: (s) => s.access === 'vvp' },
  lab: { type: 'toggle', id: 'lab', text: L('Extracció d’analítica', 'Extracción de analítica') },
  finalOn: { type: 'toggle', id: 'finalOn', text: L('Valoració final (constants)', 'Valoración final (constantes)') },
  v1: { type: 'vitals', id: 'v1', wide: true, show: VITALS_SHOW, when: (s) => s.finalOn },
  dischargeTime: { type: 'time', id: 'dischargeTime', label: L('Hora d’alta', 'Hora de alta') },
  removeVvp: { type: 'toggle', id: 'removeVvp', text: L('Retirada de via perifèrica', 'Retirada de vía periférica'), when: (s) => s.access === 'vvp' },
  next: { type: 'text', id: 'next', wide: true, label: L('Propera visita', 'Próxima visita') },
  obs: { type: 'text', id: 'obs', wide: true, label: L('Observacions', 'Observaciones') },
};

const baseState = () => ({
  time: nowHHMM(), sex: null, company: null, incidents: 'no', incidentText: '', v0: { o2: 'aire' }, stable: true,
  access: 'vvp', gauge: '22', site: null, lab: false,
  finalOn: false, v1: { o2: 'aire' }, dischargeTime: '', removeVvp: true, next: '', obs: '',
});

// ---------- Text compartit ----------
function head(s, T, G, what) {
  const out = [T(`A les ${hhmm(s.time)} hores, acudeix a l'Hospital de Dia ${what}.`, `A las ${hhmm(s.time)} horas, acude al Hospital de Día ${what}.`)];
  const v0 = formatVitals(s.v0, T);
  out.push('', T('VALORACIÓ INICIAL:', 'VALORACIÓN INICIAL:'));
  if (v0) out.push(v0);
  if (s.stable) out.push(phrases.stable(T, G));
  return out;
}
function accessLine(s, T) {
  if (s.access === 'vvp') {
    const site = pick(SITE, [s.site])[0];
    return T('Canalització de via perifèrica', 'Canalización de vía periférica')
      + (s.gauge ? ` ${s.gauge}G` : '') + (site ? T(' a ', ' en ') + lbl(site, T).toLowerCase() : '');
  }
  if (s.access === 'pac') return T('Punció de port-a-cath amb agulla gripper', 'Punción de port-a-cath con aguja gripper');
  if (s.access === 'picc') return T('Ús de PICC, comprovat permeable', 'Uso de PICC, comprobado permeable');
  return null;
}
function incidentLine(s, T) {
  return s.incidents === 'si'
    ? T('Incidències', 'Incidencias') + (s.incidentText ? `: ${s.incidentText}` : '')
    : T('Sense incidències', 'Sin incidencias');
}
function tail(s, T, G) {
  const out = [];
  const v1 = s.finalOn ? formatVitals(s.v1, T) : '';
  if (v1) out.push('', T('VALORACIÓ FINAL:', 'VALORACIÓN FINAL:'), v1);
  out.push('', T('SEGUIMENT:', 'SEGUIMIENTO:'));
  if (s.access === 'vvp' && s.removeVvp) out.push(T('Es retira via perifèrica sense incidències.', 'Se retira vía periférica sin incidencias.'));
  if (s.obs) out.push(s.obs);
  const comp = s.company === 'si' ? T(` ${G('acompanyat', 'acompanyada', 'acompanyat/da')}`, ` ${G('acompañado', 'acompañada', 'acompañado/a')}`)
    : s.company === 'no' ? T(` ${G('sol', 'sola', 'sol/a')}`, ` ${G('solo', 'sola', 'solo/a')}`) : '';
  out.push(T(`A les ${hhmm(s.dischargeTime)} hores, alta${comp}.`, `A las ${hhmm(s.dischargeTime)} horas, alta${comp}.`)
    + (s.next ? ' ' + T(`Propera visita: ${s.next}.`, `Próxima visita: ${s.next}.`) : ''));
  return out;
}

// ---------- Modes ----------
const tractament = {
  id: 'tto',
  label: L('Tractament', 'Tratamiento'),
  init: () => ({ ...baseState(), tto: null, dose: '', premedOn: false, premed: [], premedOther: '', start: '', durMin: '', end: '' }),
  sections: [
    { title: L('Tractament', 'Tratamiento'), fields: [
      // En triar el tractament, s'omple la durada prevista de l'organitzador de llits.
      { type: 'pick', id: 'tto', wide: true, options: TTOS, onSet: (s, id) => { s.durMin = String(getTreatment(id)?.dur ?? ''); } },
      { type: 'text', id: 'dose', label: L('Quantitat / dosi', 'Cantidad / dosis') },
      F.time, F.sex, F.company,
    ] },
    { title: L('Valoració inicial', 'Valoración inicial'), fields: [F.v0, F.stable] },
    { title: L('Administració', 'Administración'), fields: [
      F.access, F.gauge, F.site, F.lab,
      { type: 'toggle', id: 'premedOn', text: L('Premedicació', 'Premedicación') },
      { type: 'chips', id: 'premed', multi: true, wide: true, options: PREMED, when: (s) => s.premedOn },
      { type: 'text', id: 'premedOther', wide: true, label: L('Altra premedicació', 'Otra premedicación'), when: (s) => s.premedOn },
      { type: 'time', id: 'start', label: L('Hora inici', 'Hora inicio') },
      { type: 'number', id: 'durMin', label: L('Durada', 'Duración'), unit: 'min' },
      { type: 'time', id: 'end', label: L('Hora final (buit = inici + durada)', 'Hora final (vacío = inicio + duración)') },
      F.incidents, F.incidentText,
    ] },
    { title: L('Alta', 'Alta'), fields: [F.finalOn, F.v1, F.removeVvp, F.dischargeTime, F.next, F.obs] },
  ],
  render(s, T, G) {
    const tto = getTreatment(s.tto);
    const name = tto ? lbl(tto, T) : '___';
    const out = head(s, T, G, T(`per a l’administració de ${name}`, `para la administración de ${name}`));
    const items = [accessLine(s, T)];
    if (s.lab) items.push(T('Extracció d’analítica', 'Extracción de analítica'));
    const premed = s.premedOn ? [...pick(PREMED, s.premed).map((x) => lbl(x, T)), s.premedOther].filter(Boolean) : [];
    if (premed.length) items.push(T('Premedicació: ', 'Premedicación: ') + premed.join(', ') + '.');
    items.push(T(`Administració de ${name}`, `Administración de ${name}`) + (s.dose ? ` ${s.dose}` : '') + '.');
    const end = s.end || addMinutes(s.start, s.durMin);
    const timing = [];
    if (s.start) timing.push(T(`inici ${s.start} h`, `inicio ${s.start} h`));
    if (end) timing.push(`final ${end} h`);
    if (s.durMin) timing.push(T(`durada ${s.durMin} min`, `duración ${s.durMin} min`));
    if (timing.length) items.push(timing.join(', ').replace(/^./, (c) => c.toUpperCase()) + '.');
    items.push(incidentLine(s, T) + '.');
    out.push('', T('INTERVENCIÓ:', 'INTERVENCIÓN:'), ...items.filter(Boolean).map((x) => '- ' + x));
    return [...out, ...tail(s, T, G)].join('\n');
  },
};

// ---------- Proves: CC abans, després o complet ----------
const PHASE = [o('pre', 'Abans de la prova', 'Antes de la prueba'), o('post', 'Després de la prova', 'Después de la prueba'), o('all', 'Complet', 'Completo')];
const LEAVE = [
  o('peu', 'Caminant', 'Caminando'),
  o('cadira', 'Cadira de rodes', 'Silla de ruedas'),
  o('ambulancia', 'Ambulància', 'Ambulancia'),
  o('sala', 'Ingrés a sala', 'Ingreso en sala'),
];
const PROC_VITALS = ['ta', 'fc', 'sat', 'temp'];
const hasPre = (s) => s.phase !== 'post';
const hasPost = (s) => s.phase !== 'pre';

const prova = {
  id: 'proc',
  label: L('Prova / procediment', 'Prueba / procedimiento'),
  init: () => ({ ...baseState(), phase: 'all', proc: null, prep: ['dejuni', 'ci'], procVvp: true, side: null,
    outTime: '', backTime: '', vPost: { o2: 'aire' }, seenByDoctor: false, post: [], leave: null }),
  sections: [
    { title: L('Prova', 'Prueba'), fields: [
      { type: 'chips', id: 'phase', required: true, wide: true, label: L('Curs clínic', 'Curso clínico'), options: PHASE },
      { type: 'pick', id: 'proc', wide: true, label: L('Tipus de prova', 'Tipo de prueba'), options: PROCS },
      F.sex, F.company,
    ] },
    { title: L('Abans de la prova', 'Antes de la prueba'), when: hasPre, fields: [
      F.time,
      { type: 'vitals', id: 'v0', wide: true, show: PROC_VITALS }, F.stable,
      { type: 'chips', id: 'prep', multi: true, wide: true, options: PREP },
      { type: 'toggle', id: 'procVvp', text: L('Col·locació de VVP', 'Colocación de VVP') },
      { ...F.gauge, when: (s) => s.procVvp },
      { type: 'chips', id: 'side', label: L('Extremitat', 'Extremidad'), options: SIDE, when: (s) => s.procVvp },
      F.lab,
      { type: 'time', id: 'outTime', label: L('Surt a la prova', 'Sale a la prueba') },
    ] },
    { title: L('Després de la prova', 'Después de la prueba'), when: hasPost, fields: [
      { type: 'time', id: 'backTime', label: L('Hora de tornada', 'Hora de vuelta') },
      { type: 'toggle', id: 'seenByDoctor', text: L('Valorat/da pel metge/essa', 'Valorado/a por el médico/a') },
      { type: 'vitals', id: 'vPost', wide: true, show: PROC_VITALS },
      { type: 'chips', id: 'post', multi: true, wide: true, options: POST },
      { ...F.incidents, label: L('Complicacions', 'Complicaciones') }, F.incidentText,
    ] },
    { title: L('Alta', 'Alta'), when: hasPost, fields: [
      { type: 'toggle', id: 'removeVvp', text: L('Retirada de VVP', 'Retirada de VVP'), when: (s) => s.procVvp },
      F.dischargeTime,
      { type: 'chips', id: 'leave', wide: true, label: L('Com marxa', 'Cómo se va'), options: LEAVE },
      F.next, F.obs,
    ] },
  ],
  render(s, T, G) {
    const p = getTreatment(s.proc);
    const name = p ? lbl(p, T).toLowerCase() : '___';
    const comp = s.company === 'si' ? phrases.accompanied(T, G)
      : s.company === 'no' ? phrases.alone(T, G) : '';
    const out = [];

    if (hasPre(s)) {
      out.push(T(`A les ${hhmm(s.time)} hores, acudeix a l'Hospital de Dia per a la realització de ${name}`,
        `A las ${hhmm(s.time)} horas, acude al Hospital de Día para la realización de ${name}`)
        + (comp && !hasPost(s) ? `, ${comp}` : '') + '.');
      out.push('', T('VALORACIÓ INICIAL:', 'VALORACIÓN INICIAL:'));
      const v0 = formatVitals(s.v0, T);
      if (v0) out.push(v0);
      if (s.stable) out.push(phrases.stable(T, G));
      const items = pick(PREP, s.prep).map((x) => lbl(x, T));
      if (s.procVvp) {
        const side = pick(SIDE, [s.side])[0];
        items.push(T('Col·locació de VVP', 'Colocación de VVP') + (s.gauge ? ` ${s.gauge}G` : '') + (side ? T(' a ', ' en ') + lbl(side, T) : ''));
      }
      if (s.lab) items.push(T('Extracció d’analítica', 'Extracción de analítica'));
      if (s.outTime) items.push(T(`A les ${s.outTime} hores surt a realitzar-se la prova`, `A las ${s.outTime} horas sale a realizarse la prueba`));
      out.push('', T('PREPARACIÓ:', 'PREPARACIÓN:'), ...items.map((x) => '- ' + x));
    }

    if (hasPost(s)) {
      if (out.length) out.push('');
      out.push(hasPre(s)
        ? T(`A les ${hhmm(s.backTime)} hores, torna de la prova.`, `A las ${hhmm(s.backTime)} horas, vuelve de la prueba.`)
        : T(`A les ${hhmm(s.backTime)} hores, torna a l'Hospital de Dia després de la realització de ${name}.`,
            `A las ${hhmm(s.backTime)} horas, vuelve al Hospital de Día tras la realización de ${name}.`));
      out.push('', T('VALORACIÓ POST-PROVA:', 'VALORACIÓN POST-PRUEBA:'));
      const vp = formatVitals(s.vPost, T);
      if (vp) out.push(vp);
      if (s.seenByDoctor) out.push(T(`${G('Valorat', 'Valorada', 'Valorat/da')} pel metge/essa.`, `${G('Valorado', 'Valorada', 'Valorado/a')} por el médico/a.`));
      const post = pick(POST, s.post).map((x) => lbl(x, T));
      if (post.length) out.push(joinList(post, T) + '.');
      out.push(s.incidents === 'si'
        ? T('Complicacions', 'Complicaciones') + (s.incidentText ? `: ${s.incidentText}` : '') + '.'
        : T('Sense complicacions.', 'Sin complicaciones.'));

      out.push('', T('SEGUIMENT:', 'SEGUIMIENTO:'));
      if (s.procVvp && s.removeVvp) out.push(T('Es retira VVP sense incidències.', 'Se retira VVP sin incidencias.'));
      if (s.obs) out.push(s.obs);
      const leave = {
        peu: T('Marxa caminant', 'Se va caminando'),
        cadira: T('Marxa en cadira de rodes', 'Se va en silla de ruedas'),
        ambulancia: T('Marxa en ambulància', 'Se va en ambulancia'),
        sala: T('Puja a sala per ingrés', 'Sube a sala para ingreso'),
      }[s.leave];
      let alta = T(`A les ${hhmm(s.dischargeTime)} hores, alta.`, `A las ${hhmm(s.dischargeTime)} horas, alta.`);
      if (leave || comp) alta += ' ' + (leave || T('Marxa', 'Se va')) + (comp ? ` ${comp}` : '') + '.';
      if (s.next) alta += ' ' + T(`Propera visita: ${s.next}.`, `Próxima visita: ${s.next}.`);
      out.push(alta);
    }
    return out.join('\n');
  },
};

const noShow = {
  id: 'noacut',
  label: L('No acut', 'No acude'),
  init: () => ({ tto: null }),
  sections: [{ title: L('Tractament o prova programada', 'Tratamiento o prueba programada'),
    fields: [{ type: 'pick', id: 'tto', wide: true, options: TREATMENTS }] }],
  render(s, T) {
    const x = getTreatment(s.tto);
    const name = x ? (x.kind === 'proc' ? lbl(x, T).toLowerCase() : lbl(x, T)) : null;
    const base = T('No acut a la visita programada a l’Hospital de Dia', 'No acude a la visita programada en el Hospital de Día');
    if (!x) return base + '.';
    return base + (x.kind === 'proc'
      ? T(` per a la realització de ${name}.`, ` para la realización de ${name}.`)
      : T(` per a l’administració de ${name}.`, ` para la administración de ${name}.`));
  },
};

export default { modes: [tractament, prova, noShow] };
