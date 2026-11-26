// Plantilla de curs clínic: HD Geriatria (valoració geriàtrica).
// Les escales s'interpreten soles a partir de la puntuació (Barthel, Lawton i Brody, MNA, Pfeiffer) i l'IMC es calcula del pes i la talla.
import { L } from '../i18n/index.js';
import { joinList } from '../core/fields.js';

const o = (id, ca, es) => ({ id, label: L(ca, es) });
const pick = (opts, ids = []) => opts.filter((x) => ids.includes(x.id));
const lbl = (x, T) => T(x.label.ca, x.label.es);
const num = (v) => { const n = parseFloat(String(v).replace(',', '.')); return Number.isFinite(n) ? n : null; };

// ---------- Interpretació d'escales ----------
const barthel = (n, sex) => (n >= 100 ? (sex === 'd' ? ['autònoma', 'autónoma'] : sex === 'h' ? ['autònom', 'autónomo'] : ['autònom/a', 'autónomo/a']) : n >= 91 ? ['dependència escassa', 'dependencia escasa']
  : n >= 61 ? ['dependència moderada', 'dependencia moderada'] : n >= 21 ? ['dependència greu', 'dependencia grave'] : ['dependència total', 'dependencia total']);
// Lawton i Brody: dones 0–8, homes 0–5.
const lawton = (n, sex) => (sex === 'h'
  ? (n >= 5 ? ['independent', 'independiente'] : n >= 4 ? ['dependència lleu', 'dependencia leve'] : n >= 2 ? ['dependència moderada', 'dependencia moderada'] : n >= 1 ? ['dependència greu', 'dependencia grave'] : ['dependència total', 'dependencia total'])
  : (n >= 8 ? ['independent', 'independiente'] : n >= 6 ? ['dependència lleu', 'dependencia leve'] : n >= 4 ? ['dependència moderada', 'dependencia moderada'] : n >= 2 ? ['dependència greu', 'dependencia grave'] : ['dependència total', 'dependencia total']));
const mna = (n) => (n >= 12 ? ['estat nutricional normal', 'estado nutricional normal'] : n >= 8 ? ['risc de malnutrició', 'riesgo de malnutrición'] : ['malnutrició', 'malnutrición']);
// Pfeiffer: nombre d'errors.
const pfeiffer = (n) => (n <= 2 ? ['normal', 'normal'] : n <= 4 ? ['deteriorament cognitiu lleu', 'deterioro cognitivo leve']
  : n <= 7 ? ['deteriorament cognitiu moderat', 'deterioro cognitivo moderado'] : ['deteriorament cognitiu greu', 'deterioro cognitivo grave']);

// Yesavage (GDS-15).
const yesavage = (n) => (n <= 5 ? ['normal', 'normal'] : n <= 9 ? ['probable depressió', 'probable depresión'] : ['depressió establerta', 'depresión establecida']);
// Minimental (MMSE, 0–30).
const mmse = (n) => (n >= 24 ? ['normal', 'normal'] : n >= 19 ? ['deteriorament cognitiu lleu', 'deterioro cognitivo leve']
  : n >= 14 ? ['deteriorament cognitiu moderat', 'deterioro cognitivo moderado'] : ['deteriorament cognitiu greu', 'deterioro cognitivo grave']);

// ---------- Opcions ----------
const SEX = [o('h', 'Home', 'Hombre'), o('d', 'Dona', 'Mujer')];
const REASON = [
  o('cog', 'Valoració de deteriorament cognitiu', 'Valoración de deterioro cognitivo'),
  o('vgi', 'Valoració geriàtrica integral', 'Valoración geriátrica integral'),
  o('seg', 'Seguiment', 'Seguimiento'),
  o('caig', 'Caigudes', 'Caídas'),
  o('pes', 'Pèrdua de pes', 'Pérdida de peso'),
];
const REASON_TXT = {
  cog: ['valoració de deteriorament cognitiu', 'valoración de deterioro cognitivo'], vgi: ['valoració geriàtrica integral', 'valoración geriátrica integral'],
  seg: ['seguiment', 'seguimiento'], caig: ['valoració de caigudes', 'valoración de caídas'], pes: ['valoració de pèrdua de pes', 'valoración de pérdida de peso'],
};
const COMPANY = [o('sol', 'Sol/a', 'Solo/a'), o('fill', 'Filla', 'Hija'), o('fillm', 'Fill', 'Hijo'), o('parella', 'Parella', 'Pareja'), o('cuidador', 'Cuidador/a', 'Cuidador/a')];
const COMPANY_TXT = { fill: ['la seva filla', 'su hija'], fillm: ['el seu fill', 'su hijo'], parella: ['la seva parella', 'su pareja'], cuidador: ['el/la seu/va cuidador/a', 'su cuidador/a'] };
const SYNDROMES = [
  o('caig', 'Caigudes', 'Caídas'), o('incont', 'Incontinència', 'Incontinencia'), o('cog', 'Deteriorament cognitiu', 'Deterioro cognitivo'),
  o('dep', 'Depressió', 'Depresión'), o('polif', 'Polifarmàcia', 'Polifarmacia'), o('disf', 'Disfàgia', 'Disfagia'),
  o('desn', 'Desnutrició', 'Desnutrición'), o('ins', 'Insomni', 'Insomnio'), o('restr', 'Restrenyiment', 'Estreñimiento'),
  o('ulc', 'Úlceres per pressió', 'Úlceras por presión'), o('sens', 'Dèficit sensorial', 'Déficit sensorial'),
];
const LIVES = [o('sol', 'Sol/a al seu pis', 'Solo/a en su piso'), o('parella', 'Amb la parella', 'Con la pareja'), o('fills', 'Amb fills', 'Con hijos'), o('resid', 'Residència', 'Residencia')];
const DEPEND = [o('no', 'No', 'No'), o('tram', 'En tràmit', 'En trámite'), o('1', 'Grau 1', 'Grado 1'), o('2', 'Grau 2', 'Grado 2'), o('3', 'Grau 3', 'Grado 3')];
const SUPPORT = [o('tele', 'Teleassistència', 'Teleasistencia'), o('sad', 'SAD', 'SAD'), o('cd', 'Centre de dia', 'Centro de día'), o('priv', 'Cuidador/a privat/da', 'Cuidador/a privado/a')];
const ACTS = [o('as', 'A/S', 'A/S'), o('ecg', 'ECG', 'ECG')];
const PLAN_TYPE = [o('pres', 'Presencial', 'Presencial'), o('tel', 'Telefònica', 'Telefónica')];
const PLAN_WHEN = ['1', '3', '6', '12'].map((m) => o(m, `${m} ${m === '1' ? 'mes' : 'mesos'}`, `${m} ${m === '1' ? 'mes' : 'meses'}`));

const scoreHint = (id, fn, max) => (s) => {
  const n = num(s[id]);
  if (n == null) return null;
  const r = fn(n, s.sex);
  return L(`${n}${max ? '/' + max : ''} → ${r[0]}`, `${n}${max ? '/' + max : ''} → ${r[1]}`);
};

const valoracio = {
  id: 'val',
  label: L('Valoració', 'Valoración'),
  init: () => ({
    sex: null, reason: ['cog'], reasonExtra: '', company: null, companyOther: '',
    weight: '', height: '', barthel: '', lawton: '', mna: '', pfeiffer: '', mmse: '', yesavage: '', syndromes: [], synNote: '',
    lives: null, depend: null, support: [], socialNote: '', acts: [], actsOther: '',
    planType: 'pres', planWhen: '6', planOther: '',
  }),
  sections: [
    { title: L('Pacient', 'Paciente'), fields: [
      { type: 'chips', id: 'sex', label: L('Sexe', 'Sexo'), options: SEX },
      { type: 'chips', id: 'reason', multi: true, wide: true, label: L('Motiu', 'Motivo'), options: REASON },
      { type: 'text', id: 'reasonExtra', wide: true, label: L('Altres motius', 'Otros motivos') },
      { type: 'chips', id: 'company', wide: true, label: L('Acompanyat/da per', 'Acompañado/a por'), options: COMPANY },
      { type: 'text', id: 'companyOther', label: L('Altres (qui)', 'Otros (quién)') },
    ] },
    { title: L('Antropometria', 'Antropometría'), fields: [
      { type: 'number', id: 'weight', label: L('Pes', 'Peso'), unit: 'kg' },
      { type: 'number', id: 'height', label: L('Talla', 'Talla'), unit: 'cm' },
      { type: 'note', id: 'imcNote', wide: true, text: (s) => { const i = imc(s); return i ? L(`IMC: ${i} kg/m²`, `IMC: ${i} kg/m²`) : null; } },
    ] },
    { title: L('Escales', 'Escalas'), fields: [
      { type: 'number', id: 'barthel', label: 'Índex de Barthel (0–100)' },
      { type: 'note', id: 'bH', when: (s) => num(s.barthel) != null, text: scoreHint('barthel', barthel) },
      { type: 'number', id: 'lawton', label: L('Lawton i Brody (dones 0–8, homes 0–5)', 'Lawton y Brody (mujeres 0–8, hombres 0–5)') },
      { type: 'note', id: 'lH', when: (s) => num(s.lawton) != null, text: scoreHint('lawton', lawton) },
      { type: 'number', id: 'mna', label: L('MNA cribratge (0–14)', 'MNA cribado (0–14)') },
      { type: 'note', id: 'mH', when: (s) => num(s.mna) != null, text: scoreHint('mna', mna, 14) },
      { type: 'number', id: 'pfeiffer', label: L('Pfeiffer (errors, 0–10)', 'Pfeiffer (errores, 0–10)') },
      { type: 'note', id: 'pH', when: (s) => num(s.pfeiffer) != null, text: scoreHint('pfeiffer', pfeiffer) },
      { type: 'number', id: 'mmse', label: L('Minimental / MMSE (0–30)', 'Minimental / MMSE (0–30)') },
      { type: 'note', id: 'mmH', when: (s) => num(s.mmse) != null, text: scoreHint('mmse', mmse, 30) },
      { type: 'number', id: 'yesavage', label: L('Yesavage / GDS-15 (0–15)', 'Yesavage / GDS-15 (0–15)') },
      { type: 'note', id: 'yH', when: (s) => num(s.yesavage) != null, text: scoreHint('yesavage', yesavage, 15) },
    ] },
    { title: L('Síndromes geriàtrics', 'Síndromes geriátricos'), fields: [
      { type: 'chips', id: 'syndromes', multi: true, wide: true, label: L('Cap marcat = no en presenta', 'Ninguno marcado = no presenta'), options: SYNDROMES },
      { type: 'text', id: 'synNote', wide: true, label: L('Comentari', 'Comentario') },
    ] },
    { title: L('Situació social', 'Situación social'), fields: [
      { type: 'chips', id: 'lives', wide: true, label: L('Viu', 'Vive'), options: LIVES },
      { type: 'chips', id: 'depend', wide: true, label: L('Llei de dependència', 'Ley de dependencia'), options: DEPEND },
      { type: 'chips', id: 'support', multi: true, wide: true, label: L('Recursos', 'Recursos'), options: SUPPORT },
      { type: 'text', id: 'socialNote', wide: true, label: L('Comentari', 'Comentario') },
    ] },
    { title: L('Actuació i pla', 'Actuación y plan'), fields: [
      { type: 'chips', id: 'acts', multi: true, label: L('Realitzo', 'Realizo'), options: ACTS },
      { type: 'text', id: 'actsOther', label: L('Altres', 'Otros') },
      { type: 'chips', id: 'planType', label: L('Propera visita', 'Próxima visita'), options: PLAN_TYPE },
      { type: 'chips', id: 'planWhen', label: L('D’aquí a', 'Dentro de'), options: PLAN_WHEN },
      { type: 'text', id: 'planOther', wide: true, label: L('Altres al pla', 'Otros en el plan') },
    ] },
  ],
  render(s, T, G) {
    const out = [];
    const section = (title, lines) => { const l = lines.filter(Boolean); if (l.length) out.push('', title, ...l); };
    const scale = (name, v, fn, max) => {
      const n = num(v); if (n == null) return null;
      const r = fn(n, s.sex);
      return `${name}: ` + T(`${n}${max ? '/' + max : ''}, ${r[0]}.`, `${n}${max ? '/' + max : ''}, ${r[1]}.`);
    };

    const reasons = [...s.reason.map((r) => T(...REASON_TXT[r])), s.reasonExtra].filter(Boolean);
    out.push(T('Pacient acut a visita de Geriatria', 'Paciente acude a visita de Geriatría') + (reasons.length ? T(' per ', ' para ') + joinList(reasons, T) : '') + '.');
    if (s.company === 'sol') out.push(T(`Ve ${G('sol', 'sola', 'sol/a')}.`, `Viene ${G('solo', 'sola', 'solo/a')}.`));
    else if (s.company || s.companyOther) {
      const who = s.companyOther || T(...COMPANY_TXT[s.company]);
      out.push(T(`${G('Acompanyat', 'Acompanyada', 'Acompanyat/da')} per ${who}.`, `${G('Acompañado', 'Acompañada', 'Acompañado/a')} por ${who}.`));
    }

    const anthro = [s.weight && T(`Pes: ${s.weight} kg`, `Peso: ${s.weight} kg`), s.height && `Talla: ${s.height} cm`, imc(s) && `IMC: ${imc(s)} kg/m²`].filter(Boolean);
    section(T('ANTROPOMETRIA:', 'ANTROPOMETRÍA:'), [anthro.join('   ')]);
    section(T('VALORACIÓ FUNCIONAL:', 'VALORACIÓN FUNCIONAL:'), [
      scale(T('Índex de Barthel', 'Índice de Barthel'), s.barthel, barthel),
      scale(T('Lawton i Brody', 'Lawton y Brody'), s.lawton, lawton),
    ]);
    section(T('VALORACIÓ NUTRICIONAL:', 'VALORACIÓN NUTRICIONAL:'), [scale(T('MNA-cribratge', 'MNA-cribado'), s.mna, mna, 14)]);
    const pf = num(s.pfeiffer);
    section(T('VALORACIÓ COGNITIVA:', 'VALORACIÓN COGNITIVA:'), [
      pf != null && `Pfeiffer: ` + T(`${pf} ${pf === 1 ? 'error' : 'errors'}, ${pfeiffer(pf)[0]}.`, `${pf} ${pf === 1 ? 'error' : 'errores'}, ${pfeiffer(pf)[1]}.`),
      scale('Minimental (MMSE)', s.mmse, mmse, 30),
    ]);
    section(T('VALORACIÓ AFECTIVA:', 'VALORACIÓN AFECTIVA:'), [scale('Yesavage (GDS-15)', s.yesavage, yesavage, 15)]);

    const syn = pick(SYNDROMES, s.syndromes).map((x) => lbl(x, T).toLowerCase());
    section(T('SÍNDROMES GERIÀTRICS:', 'SÍNDROMES GERIÁTRICOS:'), [
      syn.length ? joinList(syn, T).replace(/^./, (c) => c.toUpperCase()) + '.' : T('No presenta síndromes geriàtrics.', 'No presenta síndromes geriátricos.'),
      s.synNote,
    ]);

    const social = [];
    const lives = {
      sol: T(`Viu ${G('sol', 'sola', 'sol/a')} al seu pis.`, `Vive ${G('solo', 'sola', 'solo/a')} en su piso.`),
      parella: T('Viu amb la seva parella.', 'Vive con su pareja.'), fills: T('Viu amb els seus fills.', 'Vive con sus hijos.'),
      resid: T('Viu en una residència.', 'Vive en una residencia.'),
    }[s.lives];
    if (lives) social.push(lives);
    if (s.depend === 'no') social.push(T('No té la llei de dependència.', 'No tiene la ley de dependencia.'));
    else if (s.depend === 'tram') social.push(T('Té la llei de dependència en tràmit.', 'Tiene la ley de dependencia en trámite.'));
    else if (s.depend) social.push(T(`Té la llei de dependència grau ${s.depend}.`, `Tiene la ley de dependencia grado ${s.depend}.`));
    for (const x of pick(SUPPORT, s.support)) { const n = x.id === 'sad' ? 'SAD' : lbl(x, T).toLowerCase(); social.push(T(`Té ${n}.`, `Tiene ${n}.`)); }
    if (s.socialNote) social.push(s.socialNote);
    section(T('SITUACIÓ SOCIAL:', 'SITUACIÓN SOCIAL:'), social);

    const acts = [...pick(ACTS, s.acts).map((x) => lbl(x, T)), s.actsOther].filter(Boolean);
    section(T('ACTUACIÓ:', 'ACTUACIÓN:'), [acts.length && T('Realitzo ', 'Realizo ') + joinList(acts, T) + '.']);

    const plan = [];
    if (s.planType || s.planWhen) {
      const type = s.planType === 'tel' ? T('telefònica', 'telefónica') : T('presencial', 'presencial');
      const when = s.planWhen ? T(` d'aquí ${s.planWhen} ${s.planWhen === '1' ? 'mes' : 'mesos'}`, ` dentro de ${s.planWhen} ${s.planWhen === '1' ? 'mes' : 'meses'}`) : '';
      plan.push(T(`- Visita ${type}${when}.`, `- Visita ${type}${when}.`));
    }
    if (s.planOther) plan.push('- ' + s.planOther);
    section(T('PLA:', 'PLAN:'), plan);
    return out.join('\n');
  },
};

function imc(s) {
  const w = num(s.weight), h = num(s.height);
  return w && h ? (w / (h / 100) ** 2).toFixed(1).replace('.', ',') : null;
}

const noShow = {
  id: 'noacut',
  label: L('No acut', 'No acude'),
  init: () => ({ noShowNote: '' }),
  sections: [{ title: L('No acut', 'No acude'), fields: [{ type: 'text', id: 'noShowNote', wide: true, label: L('Detall (opcional)', 'Detalle (opcional)') }] }],
  render(s, T) {
    return T('No acut a la visita programada de Geriatria', 'No acude a la visita programada de Geriatría') + (s.noShowNote ? ` (${s.noShowNote})` : '') + '.';
  },
};

export default { modes: [valoracio, noShow] };
