// Plantilla de curs clínic: HD Respiratori.
// Cada mode = { id, label, init(), sections:[{ title, fields }], render(s, T, G) → text }.
// T(ca, es) tria idioma de sortida; G(masc, fem, neutre) segons el sexe seleccionat.
import { L } from '../i18n/index.js';
import { nowHHMM } from '../core/time.js';
import { formatVitals, joinList } from '../core/fields.js';

const o = (id, ca, es, out) => ({ id, label: L(ca, es), out });
const pick = (opts, ids = []) => opts.filter((x) => ids.includes(x.id));

// ---------- Opcions ----------
const SEX = [o('h', 'Home', 'Hombre'), o('d', 'Dona', 'Mujer')];

const REASONS = [
  o('dispnea', 'Dispnea', 'Disnea'),
  o('tos', 'Tos', 'Tos'),
  o('expec', 'Expectoració', 'Expectoración'),
  o('febre', 'Febre', 'Fiebre'),
  o('control', 'Control', 'Control'),
];

const INTERVENTIONS = [
  o('analitica', 'Analítica', 'Analítica'),
  o('rx', 'RX', 'RX'),
  o('gaso', 'Gasometria arterial', 'Gasometría arterial'),
  o('ecg', 'ECG', 'ECG'),
  o('esput', 'Cultiu d’esput', 'Cultivo de esputo'),
  o('frotis', 'Frotis N/F', 'Frotis N/F'),
  o('inhal', 'Educació inhaladors', 'Educación inhaladores'),
];
const GASO_O2 = [o('aire', "A l'aire", 'Basal'), o('o2', 'Amb O2', 'Con O2')];
const INHALERS = ['Cambra + MDI', 'Accuhaler', 'Turbuhaler', 'Breezhaler', 'Ellipta', 'Spiromax', 'Respimat', 'Handihaler', 'Genuair', 'Nexthaler']
  .map((n) => o(n, n, n));

const FOLLOWUP = [
  o('metge', 'Metge habitual', 'Médico habitual'),
  o('hdr', 'HDR', 'HDR'),
  o('cex', 'CEX', 'CEX'),
  o('tel', 'Telefònic', 'Telefónico'),
];

const NEB = [
  o('vent', 'Ventolin 2 ml', 'Ventolin 2 ml'),
  o('atro', 'Atrovent 2,5 mg', 'Atrovent 2,5 mg'),
  o('bude', 'Budesonida 1 mg', 'Budesonida 1 mg'),
  o('sf', 'SF 2 cc', 'SF 2 cc', ['2 cc de sèrum fisiològic', '2 cc de suero fisiológico']),
];
const URBASON = ['20', '40', '60', '80'].map((d) => o(d, `${d} mg`, `${d} mg`));

const TRANSFER = [
  o('sala', 'Trasllat a sala', 'Traslado a sala'),
  o('pv1', 'Polivalent 1 (espera llit)', 'Polivalente 1 (espera cama)'),
];

const NOSHOW = [
  o('base', 'No acut', 'No acude'),
  o('ingres', 'Ingressat/da', 'Ingresado/a'),
  o('ucies', 'A UCIES', 'En Urgencias'),
  o('tto', 'Tractament', 'Tratamiento'),
  o('esput', 'Esput induït', 'Esputo inducido'),
  o('vacunes', 'Vacunes (serologia)', 'Vacunas (serología)'),
];

// ---------- Blocs de camps compartits ----------
const F = {
  sex: { type: 'chips', id: 'sex', label: L('Sexe', 'Sexo'), options: SEX },
  time: { type: 'time', id: 'time', label: L('Hora d’arribada', 'Hora de llegada') },
  reasons: { type: 'chips', id: 'reasons', multi: true, wide: true, label: L('Motiu', 'Motivo'), options: REASONS },
  reasonsOther: { type: 'text', id: 'reasonsOther', wide: true, label: L('Altres motius', 'Otros motivos') },
  vitals: (id) => ({ type: 'vitals', id, wide: true }),
  stable: { type: 'toggle', id: 'stable', text: L('Conscient, orientat/da i hemodinàmicament estable', 'Consciente, orientado/a y hemodinámicamente estable') },
  obs: { type: 'text', id: 'obs', wide: true, label: L('Observacions', 'Observaciones') },
  interventions: { type: 'chips', id: 'interventions', multi: true, wide: true, options: INTERVENTIONS },
  gasoO2: { type: 'chips', id: 'gasoO2', label: L('Gasometria', 'Gasometría'), options: GASO_O2, when: (s) => s.interventions.includes('gaso') },
  inhaler: { type: 'chips', id: 'inhaler', multi: true, wide: true, label: L('Sistema d’inhalador', 'Sistema de inhalador'), options: INHALERS, when: (s) => s.interventions.includes('inhal') },
  intOther: { type: 'text', id: 'intOther', wide: true, label: L('Altres intervencions', 'Otras intervenciones') },
};

const initialSections = [
  { title: L('Pacient i arribada', 'Paciente y llegada'), fields: [F.sex, F.time, F.reasons, F.reasonsOther] },
  { title: L('Valoració inicial', 'Valoración inicial'), fields: [F.vitals('v0'), F.stable, F.obs] },
  { title: L('Intervenció', 'Intervención'), fields: [F.interventions, F.gasoO2, F.inhaler, F.intOther] },
];

const initialState = () => ({
  sex: null, time: nowHHMM(), reasons: [], reasonsOther: '',
  v0: { o2: 'aire' }, stable: true, obs: '',
  interventions: [], gasoO2: 'aire', inhaler: [], intOther: '',
});

// ---------- Text compartit ----------
function renderInitial(s, T, G, { gasoAir }) {
  const reasons = [...pick(REASONS, s.reasons).map((r) => T(r.label.ca, r.label.es).toLowerCase()), s.reasonsOther].filter(Boolean);
  const out = [];
  out.push(T(`A les ${s.time || '__:__'} hores, acudeix a l'HDR`, `A las ${s.time || '__:__'} horas, acude al HDR`)
    + (reasons.length ? T(' per ', ' por ') + joinList(reasons, T) : '') + '.');
  out.push('', T('VALORACIÓ INICIAL:', 'VALORACIÓN INICIAL:'));
  const v0 = formatVitals(s.v0, T);
  if (v0) out.push(v0);
  if (s.stable) out.push(T(`Està conscient, ${G('orientat', 'orientada', 'orientat/da')} i hemodinàmicament estable.`,
    `Está consciente, ${G('orientado', 'orientada', 'orientado/a')} y hemodinámicamente estable.`));
  if (s.obs) out.push(s.obs);

  const lines = pick(INTERVENTIONS, s.interventions).map((i) => {
    switch (i.id) {
      case 'gaso': {
        const base = T('Gasometria arterial amb anestèsia local (mepivacaïna 2%)', 'Gasometría arterial con anestesia local (mepivacaína 2%)');
        if (!gasoAir) return base;
        return base + ' ' + (s.gasoO2 === 'o2' ? T('amb O2', 'con O2') : T("a l'aire", 'basal'));
      }
      case 'frotis': return T('Frotis N/F (utilitzant les mesures de protecció individual segons protocol vigent)',
        'Frotis N/F (utilizando las medidas de protección individual según protocolo vigente)');
      case 'inhal': return T('Educació d’inhaladors', 'Educación de inhaladores') + (s.inhaler.length ? T(': sistema ', ': sistema ') + s.inhaler.join(', ') : '');
      default: return T(i.label.ca, i.label.es);
    }
  });
  if (s.intOther) lines.push(s.intOther);
  if (lines.length) out.push('', T('INTERVENCIÓ:', 'INTERVENCIÓN:'), ...lines.map((l) => '- ' + l));
  return out;
}

// ---------- Modes ----------
const general = {
  id: 'general',
  label: L('General', 'General'),
  init: () => ({ ...initialState(), dischargeTime: '', followup: null, unplanned: false,
    pfPre: '', pfPost: '', neb: [], urbason: null, medOther: '' }),
  sections: [
    ...initialSections,
    { title: L('Seguiment', 'Seguimiento'), fields: [
      { type: 'time', id: 'dischargeTime', label: L('Hora d’alta', 'Hora de alta') },
      { type: 'chips', id: 'followup', label: L('Control per', 'Control por'), options: FOLLOWUP },
      { type: 'toggle', id: 'unplanned', text: L('Ve d’imprevista', 'Viene de imprevisto') },
    ] },
    { title: L('Medicació administrada', 'Medicación administrada'), fields: [
      { type: 'number', id: 'pfPre', label: L('Peak-Flow pre', 'Peak-Flow pre'), unit: 'L/min' },
      { type: 'number', id: 'pfPost', label: L('Peak-Flow post', 'Peak-Flow post'), unit: 'L/min' },
      { type: 'chips', id: 'neb', multi: true, wide: true, label: L('Nebulització', 'Nebulización'), options: NEB },
      { type: 'chips', id: 'urbason', label: 'Urbason', options: URBASON },
      { type: 'text', id: 'medOther', wide: true, label: L('Altra medicació', 'Otra medicación') },
    ] },
  ],
  render(s, T, G) {
    const out = renderInitial(s, T, G, { gasoAir: true });
    const fu = {
      metge: T('control pel seu/va metge/essa habitual', 'control por su médico/a habitual'),
      hdr: T("control a l'HDR", 'control en el HDR'),
      cex: T('control a CEX', 'control en CEX'),
      tel: T('control telefònic', 'control telefónico'),
    }[s.followup];
    out.push('', T('SEGUIMENT:', 'SEGUIMIENTO:'));
    out.push(T(`A les ${s.dischargeTime || '__:__'} hores, alta`, `A las ${s.dischargeTime || '__:__'} horas, alta`)
      + (fu ? T(' i ', ' y ') + fu : '') + '.');
    if (s.unplanned) out.push('', T(
      "Ve d’imprevista, avui l’atenem i se l’informa que per venir a visitar-se a l'HDR ha de demanar hora programada, no s’atenen visites d’imprevista.",
      'Viene de imprevisto, hoy se le atiende y se le informa de que para visitarse en el HDR debe pedir hora programada, no se atienden visitas imprevistas.'));

    const med = [];
    if (s.pfPre) med.push(`Peak-Flow pre: ${s.pfPre}`);
    if (s.neb.length) med.push(T('Nebulització: ', 'Nebulización: ') + pick(NEB, s.neb).map((n) => n.out ? T(...n.out) : T(n.label.ca, n.label.es)).join(' + '));
    if (s.pfPost) med.push(`Peak-Flow post: ${s.pfPost}`);
    if (s.urbason) med.push(`Urbason ${s.urbason} mg`);
    if (s.medOther) med.push(s.medOther);
    if (med.length) out.push('', T('MEDICACIÓ ADMINISTRADA:', 'MEDICACIÓN ADMINISTRADA:'), ...med);
    return out.join('\n');
  },
};

const ingres = {
  id: 'ingres',
  label: L('Ingrés', 'Ingreso'),
  init: () => ({ ...initialState(), admitReason: '', fullAtencio: true, v1: { o2: 'aire' },
    transfer: 'sala', ward: '', transferTime: '' }),
  sections: [
    ...initialSections,
    { title: L('Seguiment', 'Seguimiento'), fields: [
      { type: 'text', id: 'admitReason', wide: true, label: L('Ingrés hospitalari per', 'Ingreso hospitalario por') },
      { type: 'toggle', id: 'fullAtencio', text: L('Fet “full d’atenció a l’usuari”', 'Hecha “hoja de atención al usuario”') },
    ] },
    { title: L('Valoració final', 'Valoración final'), fields: [F.vitals('v1')] },
    { title: L('Trasllat', 'Traslado'), fields: [
      { type: 'chips', id: 'transfer', required: true, wide: true, options: TRANSFER },
      { type: 'text', id: 'ward', label: L('Sala', 'Sala'), when: (s) => s.transfer === 'sala' },
      { type: 'time', id: 'transferTime', label: L('Hora', 'Hora'), when: (s) => s.transfer === 'sala' },
    ] },
  ],
  render(s, T, G) {
    const out = renderInitial(s, T, G, { gasoAir: false });
    out.push('', T('SEGUIMENT:', 'SEGUIMIENTO:'));
    out.push(T(`Es decideix ingrés hospitalari per ${s.admitReason || '___'}.`, `Se decide ingreso hospitalario por ${s.admitReason || '___'}.`));
    if (s.fullAtencio) out.push(T('Fet "full d’atenció a l’usuari de l’hospital" com a seguiment d’infermeria.',
      'Realizada "hoja de atención al usuario del hospital" como seguimiento de enfermería.'));
    out.push('', T('VALORACIÓ FINAL:', 'VALORACIÓN FINAL:'));
    const v1 = formatVitals(s.v1, T);
    if (v1) out.push(v1);
    out.push(s.transfer === 'pv1'
      ? T('Trasllat al Polivalent 1 en espera de llit lliure a la sala.', 'Traslado al Polivalente 1 en espera de cama libre en la sala.')
      : T(`Trasllat a sala ${s.ward || '___'} per ingrés a les ${s.transferTime || '__:__'} hores.`,
          `Traslado a sala ${s.ward || '___'} para ingreso a las ${s.transferTime || '__:__'} horas.`));
    return out.join('\n');
  },
};

const noShow = {
  id: 'noacut',
  label: L('No acut', 'No acude'),
  init: () => ({ sex: null, reason: 'base', treatment: '' }),
  sections: [{ title: L('Motiu', 'Motivo'), fields: [
    { type: 'chips', id: 'reason', required: true, wide: true, options: NOSHOW },
    { type: 'chips', id: 'sex', label: L('Sexe', 'Sexo'), options: SEX, when: (s) => s.reason === 'ingres' },
    { type: 'text', id: 'treatment', wide: true, label: L('Tractament', 'Tratamiento'), when: (s) => s.reason === 'tto' },
  ] }],
  render(s, T, G) {
    const base = T('No acut a la visita programada a l’HDR', 'No acude a la visita programada en el HDR');
    switch (s.reason) {
      case 'ingres': return `${base} ${T(`ja que actualment es troba ${G('ingressat', 'ingressada', 'ingressat/da')} a l'hospital.`,
        `ya que actualmente se encuentra ${G('ingresado', 'ingresada', 'ingresado/a')} en el hospital.`)}`;
      case 'ucies': return `${base} ${T("ja que actualment es troba a UCIES de l'hospital.", 'ya que actualmente se encuentra en Urgencias del hospital.')}`;
      case 'tto': return `${base} ${T(`per a l’administració del tractament (${s.treatment || '___'}).`, `para la administración del tratamiento (${s.treatment || '___'}).`)}`;
      case 'esput': return T('No acut a l’HDR per a la realització d’esput induït.', 'No acude al HDR para la realización de esputo inducido.');
      case 'vacunes': return T('No acut a l’administració de les vacunes (resposta serològica a les vacunes pel diagnòstic de la deficiència d’anticossos específics).',
        'No acude a la administración de las vacunas (respuesta serológica a las vacunas para el diagnóstico de la deficiencia de anticuerpos específicos).');
      default: return base + '.';
    }
  },
};

export default { modes: [general, ingres, noShow] };
