// Plantilla de curs clínic: HD Polivalent (1 i 2).
// Tractaments i proves: js/data/treatments.js. Estructura genèrica d'infusió / procediment;
// els passos específics per tractament es poden afegir a la taula de tractaments.
import { L } from '../i18n/index.js';
import { nowHHMM } from '../core/time.js';
import { formatVitals, joinList } from '../core/fields.js';
import { TREATMENTS, getTreatment } from '../data/treatments.js';

const o = (id, ca, es) => ({ id, label: L(ca, es) });
const pick = (opts, ids = []) => opts.filter((x) => ids.includes(x.id));
const lbl = (x, T) => T(x.label.ca, x.label.es);
const hhmm = (v) => v || '__:__';

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
const TOLERANCE = [
  o('ok', 'Bona tolerància', 'Buena tolerancia'),
  o('reac', 'Reacció', 'Reacción'),
];
const PREP = [
  o('dejuni', 'Dejuni comprovat', 'Ayuno comprobado'),
  o('ci', 'Consentiment signat', 'Consentimiento firmado'),
  o('alergies', 'Al·lèrgies revisades', 'Alergias revisadas'),
  o('acomp', 'Ve acompanyat/da', 'Viene acompañado/a'),
];
const POST = [
  o('oral', 'Tolerància oral', 'Tolerancia oral'),
  o('diuresi', 'Diüresi espontània', 'Diuresis espontánea'),
  o('aposit', 'Apòsit net i sec', 'Apósito limpio y seco'),
  o('dolor', 'Sense dolor', 'Sin dolor'),
];

// ---------- Camps compartits ----------
const F = {
  time: { type: 'time', id: 'time', label: L('Hora d’arribada', 'Hora de llegada') },
  sex: { type: 'chips', id: 'sex', label: L('Sexe', 'Sexo'), options: [o('h', 'Home', 'Hombre'), o('d', 'Dona', 'Mujer')] },
  v0: { type: 'vitals', id: 'v0', wide: true },
  stable: { type: 'toggle', id: 'stable', text: L('Conscient, orientat/da i hemodinàmicament estable', 'Consciente, orientado/a y hemodinámicamente estable') },
  access: { type: 'chips', id: 'access', label: L('Accés venós', 'Acceso venoso'), options: ACCESS },
  gauge: { type: 'chips', id: 'gauge', label: L('Calibre', 'Calibre'), options: GAUGE, when: (s) => s.access === 'vvp' },
  site: { type: 'chips', id: 'site', label: L('Localització', 'Localización'), options: SITE, wide: true, when: (s) => s.access === 'vvp' },
  lab: { type: 'toggle', id: 'lab', text: L('Extracció d’analítica', 'Extracción de analítica') },
  v1: { type: 'vitals', id: 'v1', wide: true },
  dischargeTime: { type: 'time', id: 'dischargeTime', label: L('Hora d’alta', 'Hora de alta') },
  removeVvp: { type: 'toggle', id: 'removeVvp', text: L('Retirada de via perifèrica', 'Retirada de vía periférica'), when: (s) => s.access === 'vvp' },
  next: { type: 'text', id: 'next', wide: true, label: L('Propera visita', 'Próxima visita') },
  obs: { type: 'text', id: 'obs', wide: true, label: L('Observacions', 'Observaciones') },
};

const baseState = () => ({
  time: nowHHMM(), sex: null, v0: { o2: 'aire' }, stable: true,
  access: 'vvp', gauge: '22', site: null, lab: false,
  v1: { o2: 'aire' }, dischargeTime: '', removeVvp: true, next: '', obs: '',
});

// ---------- Text compartit ----------
function head(s, T, G, what) {
  const out = [T(`A les ${hhmm(s.time)} hores, acudeix a l'Hospital de Dia ${what}.`, `A las ${hhmm(s.time)} horas, acude al Hospital de Día ${what}.`)];
  const v0 = formatVitals(s.v0, T);
  out.push('', T('VALORACIÓ INICIAL:', 'VALORACIÓN INICIAL:'));
  if (v0) out.push(v0);
  if (s.stable) out.push(T(`Està conscient, ${G('orientat', 'orientada', 'orientat/da')} i hemodinàmicament estable.`,
    `Está consciente, ${G('orientado', 'orientada', 'orientado/a')} y hemodinámicamente estable.`));
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
function tail(s, T) {
  const out = ['', T('VALORACIÓ FINAL:', 'VALORACIÓN FINAL:')];
  const v1 = formatVitals(s.v1, T);
  if (v1) out.push(v1);
  if (s.access === 'vvp' && s.removeVvp) out.push(T('Es retira via perifèrica sense incidències.', 'Se retira vía periférica sin incidencias.'));
  if (s.obs) out.push(s.obs);
  out.push('', T('SEGUIMENT:', 'SEGUIMIENTO:'));
  out.push(T(`A les ${hhmm(s.dischargeTime)} hores, alta.`, `A las ${hhmm(s.dischargeTime)} horas, alta.`)
    + (s.next ? ' ' + T(`Propera visita: ${s.next}.`, `Próxima visita: ${s.next}.`) : ''));
  return out;
}

// ---------- Modes ----------
const tractament = {
  id: 'tto',
  label: L('Tractament', 'Tratamiento'),
  init: () => ({ ...baseState(), tto: null, dose: '', premed: [], start: '', end: '', tolerance: 'ok', reaction: '' }),
  sections: [
    { title: L('Tractament', 'Tratamiento'), fields: [
      { type: 'pick', id: 'tto', wide: true, options: TTOS },
      { type: 'text', id: 'dose', label: L('Dosi', 'Dosis') },
      F.time,
    ] },
    { title: L('Valoració inicial', 'Valoración inicial'), fields: [F.v0, F.stable] },
    { title: L('Intervenció', 'Intervención'), fields: [
      F.access, F.gauge, F.site, F.lab,
      { type: 'chips', id: 'premed', multi: true, wide: true, label: L('Premedicació', 'Premedicación'), options: PREMED },
      { type: 'time', id: 'start', label: L('Inici infusió', 'Inicio infusión') },
      { type: 'time', id: 'end', label: L('Final infusió', 'Final infusión') },
      { type: 'chips', id: 'tolerance', label: L('Tolerància', 'Tolerancia'), options: TOLERANCE },
      { type: 'text', id: 'reaction', wide: true, label: L('Descripció de la reacció i actuació', 'Descripción de la reacción y actuación'), when: (s) => s.tolerance === 'reac' },
    ] },
    { title: L('Valoració final i alta', 'Valoración final y alta'), fields: [F.v1, F.removeVvp, F.dischargeTime, F.next, F.obs] },
  ],
  render(s, T, G) {
    const tto = getTreatment(s.tto);
    const name = tto ? lbl(tto, T) : '___';
    const out = head(s, T, G, T(`per a l’administració de ${name}`, `para la administración de ${name}`));
    const items = [accessLine(s, T)];
    if (s.lab) items.push(T('Extracció d’analítica', 'Extracción de analítica'));
    if (s.premed.length) items.push(T('Premedicació: ', 'Premedicación: ') + pick(PREMED, s.premed).map((x) => lbl(x, T)).join(', '));
    let adm = T(`Administració de ${name}`, `Administración de ${name}`) + (s.dose ? ` ${s.dose}` : '') + T(' segons pauta', ' según pauta');
    if (s.start || s.end) adm += T(` (inici ${hhmm(s.start)} h, final ${hhmm(s.end)} h)`, ` (inicio ${hhmm(s.start)} h, final ${hhmm(s.end)} h)`);
    items.push(adm);
    if (s.tolerance === 'ok') items.push(T('Bona tolerància, sense incidències', 'Buena tolerancia, sin incidencias'));
    if (s.tolerance === 'reac') items.push(T('Reacció durant la infusió', 'Reacción durante la infusión') + (s.reaction ? `: ${s.reaction}` : ''));
    out.push('', T('INTERVENCIÓ:', 'INTERVENCIÓN:'), ...items.filter(Boolean).map((x) => '- ' + x));
    return [...out, ...tail(s, T)].join('\n');
  },
};

const prova = {
  id: 'proc',
  label: L('Prova / procediment', 'Prueba / procedimiento'),
  init: () => ({ ...baseState(), proc: null, prep: ['dejuni', 'ci'], outTime: '', backTime: '', post: [] }),
  sections: [
    { title: L('Prova', 'Prueba'), fields: [{ type: 'pick', id: 'proc', wide: true, options: PROCS }, F.time, F.sex] },
    { title: L('Valoració inicial', 'Valoración inicial'), fields: [F.v0, F.stable] },
    { title: L('Preparació', 'Preparación'), fields: [
      { type: 'chips', id: 'prep', multi: true, wide: true, options: PREP },
      F.access, F.gauge, F.site, F.lab,
      { type: 'time', id: 'outTime', label: L('Surt a la prova', 'Sale a la prueba') },
      { type: 'time', id: 'backTime', label: L('Torna de la prova', 'Vuelve de la prueba') },
    ] },
    { title: L('Post-prova', 'Post-prueba'), fields: [
      { type: 'chips', id: 'post', multi: true, wide: true, options: POST },
      F.v1, F.removeVvp, F.dischargeTime, F.next, F.obs,
    ] },
  ],
  render(s, T, G) {
    const p = getTreatment(s.proc);
    const name = p ? lbl(p, T).toLowerCase() : '___';
    const out = head(s, T, G, T(`per a la realització de ${name}`, `para la realización de ${name}`));
    const prep = pick(PREP, s.prep).map((x) => {
      if (x.id === 'acomp') return T(`Ve ${G('acompanyat', 'acompanyada', 'acompanyat/da')}`, `Viene ${G('acompañado', 'acompañada', 'acompañado/a')}`);
      return lbl(x, T);
    });
    const items = [...prep, accessLine(s, T)];
    if (s.lab) items.push(T('Extracció d’analítica', 'Extracción de analítica'));
    if (s.outTime) items.push(T(`A les ${s.outTime} hores surt a realitzar-se la prova`, `A las ${s.outTime} horas sale a realizarse la prueba`));
    if (s.backTime) items.push(T(`A les ${s.backTime} hores torna de la prova`, `A las ${s.backTime} horas vuelve de la prueba`));
    out.push('', T('INTERVENCIÓ:', 'INTERVENCIÓN:'), ...items.filter(Boolean).map((x) => '- ' + x));
    const post = pick(POST, s.post).map((x) => lbl(x, T));
    if (post.length) out.push('', T('POST-PROVA:', 'POST-PRUEBA:'), joinList(post, T) + '.');
    return [...out, ...tail(s, T)].join('\n');
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
