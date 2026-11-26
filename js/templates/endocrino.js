// Plantilla de curs clínic: HD Endocrí.
// Basada en els CC reals de l'HD: educació diabetològica (ETD), debut/inici d'insulina,
// descompensació aguda, tractament EV i no acut. Totes les seccions són opcionals:
// només surt al text el que s'omple o es marca.
import { L } from '../i18n/index.js';
import { nowHHMM, addMinutes } from '../core/time.js';
import { formatVitals, joinList } from '../core/fields.js';

const o = (id, ca, es) => ({ id, label: L(ca, es) });
const pick = (opts, ids = []) => opts.filter((x) => ids.includes(x.id));
const lbl = (x, T) => T(x.label.ca, x.label.es);
const hhmm = (v) => v || '__:__';
const lines = (txt) => (txt || '').split('\n').map((l) => l.trim()).filter(Boolean);
const bullets = (txt) => lines(txt).map((l) => (/^[-*•]/.test(l) ? l.replace(/^[-*•]\s*/, '- ') : '- ' + l));

// ---------- Opcions ----------
const VISIT = [o('prog', 'Programada', 'Programada'), o('imp', 'Imprevista', 'Imprevista'), o('noprog', 'No programada', 'No programada')];
const SEX = [o('h', 'Home', 'Hombre'), o('d', 'Dona', 'Mujer')];
const MEALS = [
  ['mEsm', L('Esmorzar', 'Desayuno')], ['mMig', L('Mig matí', 'Media mañana')], ['mDin', L('Dinar', 'Comida')],
  ['mBer', L('Berenar', 'Merienda')], ['mSop', L('Sopar', 'Cena')], ['mRes', L('Ressopó', 'Recena')],
];
const FOOD_EDU = [
  o('tres', '3 àpats principals', '3 comidas principales'), o('plat', 'Mètode del plat', 'Método del plato'),
  o('ch', 'Identificació i distribució dels CH', 'Identificación y distribución de los HC'), o('quart', '¼ del plat CH', '¼ del plato HC'),
  o('grups', 'Grups d’aliments', 'Grupos de alimentos'), o('sucre', 'Evitar sucres simples', 'Evitar azúcares simples'),
];
const GLU = [
  ['gDyo', 'DYO'], ['gPp', 'PP'], ['gCda', 'CDA'], ['gPd', 'PD'], ['gCna', 'CNA'], ['gPs', 'PS'], ['gNit', L('Nit', 'Noche')],
];

const SELF = [
  o('ok', 'Tècnica correcta', 'Técnica correcta'), o('ini', 'Educació inicial (entrega glucòmetre)', 'Educación inicial (entrega glucómetro)'),
  o('ref', 'Es reforça la tècnica', 'Se refuerza la técnica'), o('nollib', 'No porta la llibreta', 'No trae la libreta'),
];
const INS_MODE = [o('val', 'Valoració de la tècnica', 'Valoración de la técnica'), o('ini', 'Educació inicial', 'Educación inicial')];
const INS_CHECK = [
  o('cons', 'Conservació', 'Conservación'), o('rot', 'Rotació', 'Rotación'), o('agu', 'Canvi d’agulles', 'Cambio de agujas'),
  o('purga', 'Purga', 'Purga'), o('plec', 'Plec cutani', 'Pliegue cutáneo'), o('temps', 'Temps d’espera', 'Tiempo de espera'),
];
const INS_EXTRA = [
  o('abd', 'Rota només a l’abdomen', 'Rota solo en abdomen'), o('full', 'Full de zones entregat', 'Hoja de zonas entregada'),
  o('agu2', 'Canvi d’agulla cada 2 dies', 'Cambio de aguja cada 2 días'), o('fam', 'L’administra un familiar', 'La administra un familiar'),
  o('pauta', 'Pauta correctora explicada', 'Pauta correctora explicada'), o('autoaj', 'Autoajustament explicat', 'Autoajuste explicado'),
];
const HYPO = [
  o('coneix', 'Coneix concepte, símptomes i tractament', 'Conoce concepto, síntomas y tratamiento'),
  o('explica', 'S’expliquen signes i símptomes', 'Se explican signos y síntomas'),
  o('porta', 'Porta HC d’emergència', 'Lleva HC de emergencia'), o('dona', 'Donem HC d’emergència', 'Damos HC de emergencia'),
  o('glucago', 'Glucagó entregat i explicat', 'Glucagón entregado y explicado'),
];
const MATERIAL = [
  o('gluco', 'Glucòmetre', 'Glucómetro'), o('tires', 'Tires reactives', 'Tiras reactivas'), o('sensor', 'Sensor', 'Sensor'),
  o('rapida', 'Insulina ràpida', 'Insulina rápida'), o('lenta', 'Insulina lenta', 'Insulina lenta'), o('agulles', 'Agulles', 'Agujas'),
  o('diari', 'Diari / llibreta de controls', 'Diario / libreta de controles'), o('peticio', 'Petició de tires i agulles al CAP', 'Petición de tiras y agujas al CAP'),
  o('ceto', 'Tires de cetones', 'Tiras de cetonas'), o('pautamod', 'Pauta de modificació d’insulina', 'Pauta de modificación de insulina'),
  o('glucago', 'Glucagó', 'Glucagón'), o('fullzones', 'Full informatiu de zones', 'Hoja informativa de zonas'),
];
const PLAN = [
  o('telef', 'Seguiment telefònic', 'Seguimiento telefónico'), o('nomes', 'No donem més visites d’infermeria', 'No damos más visitas de enfermería'),
  o('medavui', 'Visita avui amb l’equip mèdic', 'Visita hoy con el equipo médico'),
];
const SIDE = [o('esd', 'ESD', 'ESD'), o('ese', 'ESE', 'ESI')];
const ACUTE_ACT = [
  o('med', 'Valorat/da per l’equip mèdic', 'Valorado/a por el equipo médico'), o('as', 'Analítica (AS)', 'Analítica (AS)'),
  o('vvp', 'Col·locació de VVP', 'Colocación de VVP'), o('insul', 'Insulina SC segons indicació mèdica', 'Insulina SC según indicación médica'),
];
const OUTCOME = [
  o('alta', 'Alta amb pauta', 'Alta con pauta'), o('ingres', 'Ingrés', 'Ingreso'),
  o('voluntaria', 'Marxa abans d’acabar (pactat amb metge)', 'Se va antes de acabar (pactado con médico)'),
];

// ---------- Camps compartits ----------
const F = {
  visit: { type: 'chips', id: 'visit', label: L('Visita', 'Visita'), options: VISIT },
  sex: { type: 'chips', id: 'sex', label: L('Sexe', 'Sexo'), options: SEX },
  tto: { type: 'textarea', id: 'tto', wide: true, rows: 4, label: L('Tractament actual (una línia per fàrmac)', 'Tratamiento actual (una línea por fármaco)'), placeholder: L('Abasaglar 0-0-14\nMetformina 850 mg 1-0-1', 'Abasaglar 0-0-14\nMetformina 850 mg 1-0-1') },
  ttoNote: { type: 'text', id: 'ttoNote', wide: true, label: L('Adherència / canvis fets pel pacient', 'Adherencia / cambios hechos por el paciente') },
};

// La presentació del pacient s'enganxa del curs del metge; només es tradueix si cal.
const patientSection = { title: L('Pacient', 'Paciente'), fields: [
  F.visit, F.sex,
  { type: 'translated', id: 'medText', wide: true, rows: 5, label: L('Text del metge (Ctrl+V)', 'Texto del médico (Ctrl+V)'),
    placeholder: L('Enganxa aquí la presentació del pacient…', 'Pega aquí la presentación del paciente…') },
] };

const baseState = () => ({
  visit: 'prog', sex: null, medText: '', medTextTr: '', medTextTrLang: null, tto: '', ttoNote: '',
});

// ---------- Text compartit ----------
function header(s, T) {
  const out = [T('Visita ', 'Visita ') + lbl(pick(VISIT, [s.visit])[0] ?? VISIT[0], T).toLowerCase()];
  const lang = T('ca', 'es');
  const txt = (s.medTextTrLang === lang ? s.medTextTr : s.medText) || '';
  const body = txt.split('\n').map((l) => l.trimEnd());
  while (body.length && !body[0]) body.shift();
  while (body.length && !body.at(-1)) body.pop();
  if (body.length) out.push('', ...body);
  return out;
}
function treatment(s, T) {
  const tl = bullets(s.tto);
  if (!tl.length && !s.ttoNote) return [];
  return ['', T('TRACTAMENT ACTUAL:', 'TRATAMIENTO ACTUAL:'), ...tl, ...(s.ttoNote ? [s.ttoNote] : [])];
}

// ---------- Mode: visita d'educació / seguiment ----------
const educacio = {
  id: 'edu',
  label: L('Educació / seguiment', 'Educación / seguimiento'),
  init: () => ({
    ...baseState(),
    gDyo: '', gPp: '', gCda: '', gPd: '', gCna: '', gPs: '', gNit: '', gluNote: '',
    mEsm: '', mMig: '', mDin: '', mBer: '', mSop: '', mRes: '', foodEdu: ['tres', 'plat'], foodNote: '',
    self: null, selfNote: '',
    insMode: null, insCheck: INS_CHECK.map((x) => x.id), insExtra: [], insWhat: '', insNote: '',
    hypo: [], sensor: false, sensorNote: '', material: [], weight: '', activity: '',
    planMed: '', planInf: '', plan: [], planChange: '', planOther: '',
  }),
  sections: [
    patientSection,
    { title: L('Tractament actual', 'Tratamiento actual'), fields: [F.tto, F.ttoNote] },
    { title: L('Perfil glucèmic (mg/dL)', 'Perfil glucémico (mg/dL)'), fields: [
      ...GLU.map(([id, label]) => ({ type: 'text', id, label, placeholder: '120-135-140' })),
      { type: 'text', id: 'gluNote', wide: true, label: L('Comentari', 'Comentario') },
    ] },
    { title: L('Alimentació', 'Alimentación'), fields: [
      ...MEALS.map(([id, label]) => ({ type: 'text', id, label })),
      { type: 'chips', id: 'foodEdu', multi: true, wide: true, label: L('Es reforça', 'Se refuerza'), options: FOOD_EDU },
      { type: 'text', id: 'foodNote', wide: true, label: L('Comentari', 'Comentario') },
    ] },
    { title: L('Autoanàlisi', 'Autoanálisis'), fields: [
      { type: 'chips', id: 'self', wide: true, options: SELF },
      { type: 'text', id: 'selfNote', wide: true, label: L('Comentari', 'Comentario') },
    ] },
    { title: L('Administració d’insulina', 'Administración de insulina'), fields: [
      { type: 'chips', id: 'insMode', wide: true, options: INS_MODE },
      { type: 'chips', id: 'insCheck', multi: true, wide: true, label: L('Correcte (desmarca el que s’ha de reforçar)', 'Correcto (desmarca lo que hay que reforzar)'), options: INS_CHECK, when: (s) => s.insMode === 'val' },
      { type: 'text', id: 'insWhat', wide: true, label: L('Insulina entregada', 'Insulina entregada'), placeholder: 'Lantus', when: (s) => s.insMode === 'ini' },
      { type: 'chips', id: 'insExtra', multi: true, wide: true, label: L('A més', 'Además'), options: INS_EXTRA, when: (s) => !!s.insMode },
      { type: 'text', id: 'insNote', wide: true, label: L('Comentari', 'Comentario'), when: (s) => !!s.insMode },
    ] },
    { title: L('Hipoglucèmies', 'Hipoglucemias'), fields: [{ type: 'chips', id: 'hypo', multi: true, wide: true, options: HYPO }] },
    { title: L('Altres', 'Otros'), fields: [
      { type: 'toggle', id: 'sensor', text: L('Sensor (col·locació i vinculació)', 'Sensor (colocación y vinculación)') },
      { type: 'text', id: 'sensorNote', wide: true, label: L('Comentari sensor', 'Comentario sensor'), when: (s) => s.sensor },
      { type: 'chips', id: 'material', multi: true, wide: true, label: L('Material entregat', 'Material entregado'), options: MATERIAL },
      { type: 'number', id: 'weight', label: L('Pes', 'Peso'), unit: 'kg' },
      { type: 'text', id: 'activity', wide: true, label: L('Activitat física', 'Actividad física') },
    ] },
    { title: L('Pla', 'Plan'), fields: [
      { type: 'text', id: 'planMed', label: L('Visita mèdica (data)', 'Visita médica (fecha)'), placeholder: '12/06/2026' },
      { type: 'text', id: 'planInf', label: L('Visita infermeria (data)', 'Visita enfermería (fecha)'), placeholder: '10/06/2026' },
      { type: 'chips', id: 'plan', multi: true, wide: true, options: PLAN },
      { type: 'text', id: 'planChange', wide: true, label: L('Modificació del tractament', 'Modificación del tratamiento'), placeholder: L('Abasaglar a 0-0-21', 'Abasaglar a 0-0-21') },
      { type: 'textarea', id: 'planOther', wide: true, rows: 2, label: L('Altres (una línia per punt)', 'Otros (una línea por punto)') },
    ] },
  ],
  render(s, T, G) {
    const out = [...header(s, T, G), ...treatment(s, T)];

    const glu = GLU.filter(([id]) => s[id]).map(([id, label]) => `${typeof label === 'string' ? label : T(label.ca, label.es)}: ${s[id]}`);
    if (glu.length || s.gluNote) out.push('', T('PERFIL GLUCÈMIC:', 'PERFIL GLUCÉMICO:'), ...glu.map((x) => '- ' + x), ...(s.gluNote ? [s.gluNote] : []));

    const meals = MEALS.filter(([id]) => s[id]).map(([id, label]) => `${T(label.ca, label.es)}: ${s[id]}`);
    const edu = pick(FOOD_EDU, s.foodEdu).map((x) => lbl(x, T).toLowerCase());
    if (meals.length || s.foodNote || (edu.length && meals.length)) {
      out.push('', T('ALIMENTACIÓ:', 'ALIMENTACIÓN:'), ...meals);
      if (s.foodNote) out.push(s.foodNote);
      if (edu.length) out.push(T('Es reforça: ', 'Se refuerza: ') + joinList(edu, T) + '.');
    }

    const self = {
      ok: T('No presenta problemes en la tècnica. Registra correctament els controls a la llibreta.', 'No presenta problemas en la técnica. Registra correctamente los controles en la libreta.'),
      ini: T("S'entreguen glucòmetre i tires reactives. S'explica la tècnica d'autocontrol de glucèmia capil·lar i s'entrega una llibreta per registrar els resultats.",
        'Se entregan glucómetro y tiras reactivas. Se explica la técnica de autocontrol de glucemia capilar y se entrega una libreta para registrar los resultados.'),
      ref: T("Es realitza educació sobre com fer l'autocontrol.", 'Se realiza educación sobre cómo hacer el autocontrol.'),
      nollib: T('No porta la llibreta amb els controls.', 'No trae la libreta con los controles.'),
    }[s.self];
    if (self || s.selfNote) out.push('', T('AUTOANÀLISI:', 'AUTOANÁLISIS:'), ...[self, s.selfNote].filter(Boolean));

    if (s.insMode) {
      out.push('', T("ADMINISTRACIÓ D'INSULINA:", 'ADMINISTRACIÓN DE INSULINA:'));
      const ex = new Set(s.insExtra);
      if (ex.has('fam')) out.push(T("L'administració de la insulina la realitza un familiar.", 'La administración de la insulina la realiza un familiar.'));
      if (s.insMode === 'ini') {
        out.push(T(`S'entreguen ${s.insWhat ? 'insulina ' + s.insWhat : 'insulina'} i agulles. S'explica la tècnica d'administració i es fa una simulació amb pell sintètica; ho realitza correctament. S'informa que les insulines que no s'estiguin utilitzant s'han de conservar a la nevera.`,
          `Se entregan ${s.insWhat ? 'insulina ' + s.insWhat : 'insulina'} y agujas. Se explica la técnica de administración y se realiza una simulación con piel sintética; lo realiza correctamente. Se informa que las insulinas que no se estén utilizando deben conservarse en la nevera.`));
      } else {
        const ok = new Set(s.insCheck);
        const parts = [];
        parts.push(ok.has('cons') ? T('Conservació correcta.', 'Conservación correcta.') : T('Es reforça la correcta conservació de la insulina.', 'Se refuerza la correcta conservación de la insulina.'));
        if (ex.has('abd')) parts.push(T("Realitza la rotació només a l'abdomen; es reforça la necessitat d'utilitzar altres zones d'injecció.", 'Realiza la rotación solo en el abdomen; se refuerza la necesidad de utilizar otras zonas de inyección.'));
        else parts.push(ok.has('rot') ? T("Realitza una rotació adequada de les zones d'injecció.", 'Realiza una rotación adecuada de las zonas de inyección.') : T("Es reforça la rotació de les zones d'injecció.", 'Se refuerza la rotación de las zonas de inyección.'));
        const rest = [
          ['agu', T("canvi d'agulles correcte", 'cambio de agujas correcto'), T("canvi d'agulles", 'cambio de agujas')],
          ['purga', T('purga correcta', 'purga correcta'), T('purga', 'purga')],
          ['plec', T('plec cutani correcte', 'pliegue cutáneo correcto'), T('plec cutani', 'pliegue cutáneo')],
          ['temps', T("temps d'espera adequat", 'tiempo de espera adecuado'), T("temps d'espera", 'tiempo de espera')],
        ];
        const good = rest.filter(([k]) => ok.has(k)).map((r) => r[1]);
        const bad = rest.filter(([k]) => !ok.has(k)).map((r) => r[2]);
        if (good.length) parts.push(joinList(good, T).replace(/^./, (c) => c.toUpperCase()) + '.');
        if (bad.length) parts.push(T('Es reforça: ', 'Se refuerza: ') + joinList(bad, T) + '.');
        out.push(parts.join(' '));
      }
      if (ex.has('full')) out.push(T("S'entrega full informatiu amb les zones d'administració.", 'Se entrega hoja informativa con las zonas de administración.'));
      if (ex.has('agu2')) out.push(T("Es recomana canviar l'agulla cada 2 dies.", 'Se recomienda cambiar la aguja cada 2 días.'));
      if (ex.has('pauta')) out.push(T('Expliquem i comprovem que el pacient i familiars entenen com utilitzar la pauta correctora de la insulina ràpida.', 'Explicamos y comprobamos que el paciente y familiares entienden cómo utilizar la pauta correctora de la insulina rápida.'));
      if (ex.has('autoaj')) out.push(T("S'explica l'autoajustament de la insulina basal.", 'Se explica el autoajuste de la insulina basal.'));
      if (s.insNote) out.push(s.insNote);
    }

    const hy = new Set(s.hypo);
    if (hy.size) {
      out.push('', T('HIPOGLUCÈMIES:', 'HIPOGLUCEMIAS:'));
      if (hy.has('coneix')) out.push(T('Coneix el concepte, la simptomatologia i el tractament de les hipoglucèmies.', 'Conoce el concepto, la sintomatología y el tratamiento de las hipoglucemias.'));
      if (hy.has('explica')) out.push(T("S'expliquen els signes i símptomes d'hipoglucèmia i el seu tractament.", 'Se explican los signos y síntomas de hipoglucemia y su tratamiento.'));
      if (hy.has('porta')) out.push(T("Porta hidrats de carboni d'emergència.", 'Lleva hidratos de carbono de emergencia.'));
      if (hy.has('dona')) out.push(T("Donem hidrats de carboni d'emergència.", 'Damos hidratos de carbono de emergencia.'));
      if (hy.has('glucago')) out.push(T("S'entrega glucagó i se n'explica la preparació i la conservació.", 'Se entrega glucagón y se explica su preparación y conservación.'));
    }

    if (s.sensor) out.push('', T('SENSOR:', 'SENSOR:'), T("S'explica el sensor i la seva col·locació; es col·loca correctament el sensor i es vincula.", 'Se explica el sensor y su colocación; se coloca correctamente el sensor y se vincula.'), ...(s.sensorNote ? [s.sensorNote] : []));
    const mat = pick(MATERIAL, s.material).map((x) => '- ' + lbl(x, T));
    if (mat.length) out.push('', T('MATERIAL ENTREGAT:', 'MATERIAL ENTREGADO:'), ...mat);
    if (s.weight) out.push('', T(`Pes: ${s.weight} kg`, `Peso: ${s.weight} kg`));
    if (s.activity) out.push('', T('ACTIVITAT FÍSICA:', 'ACTIVIDAD FÍSICA:'), s.activity);

    const plan = [];
    if (s.planChange) plan.push(T(`Modificació del tractament: ${s.planChange}`, `Modificación del tratamiento: ${s.planChange}`));
    if (s.planMed) plan.push(T(`Visita mèdica el dia ${s.planMed}`, `Visita médica el día ${s.planMed}`));
    if (s.planInf) plan.push(T(`Visita d'infermeria el dia ${s.planInf}`, `Visita de enfermería el día ${s.planInf}`));
    plan.push(...pick(PLAN, s.plan).map((x) => lbl(x, T)));
    plan.push(...lines(s.planOther).map((l) => l.replace(/^[-*•]\s*/, '')));
    if (plan.length) out.push('', T('PLA:', 'PLAN:'), ...plan.map((x) => '- ' + x));
    return out.join('\n');
  },
};

// ---------- Mode: descompensació aguda ----------
const aguda = {
  id: 'aguda',
  label: L('Descompensació', 'Descompensación'),
  init: () => ({
    ...baseState(), visit: 'imp', time: nowHHMM(), stable: true, vA: { o2: 'aire' },
    glic: '', ceto: '', hba1c: '', weightA: '', height: '', acts: ['med'], side: null, insDose: '', timeline: '', outcome: null, outcomeNote: '', endTime: '',
  }),
  sections: [
    patientSection,
    { title: L('Tractament actual', 'Tratamiento actual'), fields: [F.tto, F.ttoNote] },
    { title: L('Arribada', 'Llegada'), fields: [
      { type: 'time', id: 'time', label: L('Hora d’arribada', 'Hora de llegada') },
      { type: 'toggle', id: 'stable', text: L('Conscient i orientat/da', 'Consciente y orientado/a') },
      { type: 'vitals', id: 'vA', wide: true, show: ['ta', 'fc', 'temp'] },
      { type: 'number', id: 'glic', label: L('Glucèmia', 'Glucemia'), unit: 'mg/dL' },
      { type: 'number', id: 'ceto', label: L('Cetonèmia', 'Cetonemia'), unit: 'mmol/L' },
      { type: 'number', id: 'hba1c', label: 'HbA1c', unit: '%' },
      { type: 'number', id: 'weightA', label: L('Pes', 'Peso'), unit: 'kg' },
      { type: 'number', id: 'height', label: L('Talla', 'Talla'), unit: 'cm' },
    ] },
    { title: L('Actuació', 'Actuación'), fields: [
      { type: 'chips', id: 'acts', multi: true, wide: true, options: ACUTE_ACT },
      { type: 'chips', id: 'side', label: L('VVP a', 'VVP en'), options: SIDE, when: (s) => s.acts.includes('vvp') },
      { type: 'text', id: 'insDose', label: L('Insulina administrada', 'Insulina administrada'), placeholder: '8 UI Fiasp', when: (s) => s.acts.includes('insul') },
      { type: 'textarea', id: 'timeline', wide: true, rows: 4, label: L('Evolució (una línia per control: hora – glucèmia – acció)', 'Evolución (una línea por control: hora – glucemia – acción)'), placeholder: '17:30 Glucèmia 408 mg/dL, 8 UI Asparta\n18:30 Glucèmia 378 mg/dL' },
    ] },
    { title: L('Resolució', 'Resolución'), fields: [
      { type: 'chips', id: 'outcome', wide: true, options: OUTCOME },
      { type: 'time', id: 'endTime', label: L('Hora', 'Hora') },
      { type: 'text', id: 'outcomeNote', wide: true, label: L('Detall', 'Detalle') },
    ] },
  ],
  render(s, T, G) {
    const out = [...header(s, T, G), ...treatment(s, T)];
    out.push('', T('ARRIBADA:', 'LLEGADA:'));
    out.push(T(`A l'arribada a l'HD Endocrí a les ${hhmm(s.time)} h`, `A la llegada al HD Endocrino a las ${hhmm(s.time)} h`)
      + (s.stable ? T(`, ${G('pacient conscient i orientat', 'pacient conscient i orientada', 'pacient conscient i orientat/da')}`, `, ${G('paciente consciente y orientado', 'paciente consciente y orientada', 'paciente consciente y orientado/a')}`) : '') + '.');
    const v = formatVitals(s.vA, T);
    if (v) out.push(v);
    const m = [
      s.glic && T(`Glucèmia: ${s.glic} mg/dL`, `Glucemia: ${s.glic} mg/dL`),
      s.ceto && T(`Cetonèmia: ${s.ceto} mmol/L`, `Cetonemia: ${s.ceto} mmol/L`),
      s.hba1c && `HbA1c: ${s.hba1c}%`,
      s.weightA && T(`Pes: ${s.weightA} kg`, `Peso: ${s.weightA} kg`),
      s.height && T(`Talla: ${s.height} cm`, `Talla: ${s.height} cm`),
    ].filter(Boolean);
    if (m.length) out.push(m.join('   '));

    const a = new Set(s.acts);
    const acts = [];
    if (a.has('med')) acts.push(T(`${G('Valorat', 'Valorada', 'Valorat/da')} per l'equip mèdic d'endocrí`, `${G('Valorado', 'Valorada', 'Valorado/a')} por el equipo médico de endocrino`));
    if (a.has('as')) acts.push(T('Es cursa analítica (AS)', 'Se cursa analítica (AS)'));
    if (a.has('vvp')) { const sd = pick(SIDE, [s.side])[0]; acts.push(T('Es col·loca VVP', 'Se coloca VVP') + (sd ? T(' a ', ' en ') + lbl(sd, T) : '')); }
    if (a.has('insul')) acts.push(T(`S'administra ${s.insDose || 'insulina'} SC segons indicació mèdica`, `Se administra ${s.insDose || 'insulina'} SC según indicación médica`));
    const tl = lines(s.timeline);
    if (acts.length || tl.length) out.push('', T('ACTUACIÓ:', 'ACTUACIÓN:'), ...acts.map((x) => '- ' + x), ...tl.map((l) => '- ' + l.replace(/^[-*•]\s*/, '')));

    const at = s.endTime ? T(`A les ${s.endTime} h, `, `A las ${s.endTime} h, `) : '';
    const res = {
      alta: T("l'equip mèdic explica la pauta i alta.", 'el equipo médico explica la pauta y alta.'),
      ingres: T('es decideix ingrés hospitalari.', 'se decide ingreso hospitalario.'),
      voluntaria: T("marxa abans d'acabar la valoració. Es comenta amb l'equip mèdic i s'informa del risc de la situació; es pacta que tornarà com més aviat millor.",
        'se va antes de terminar la valoración. Se comenta con el equipo médico y se informa del riesgo de la situación; se pacta que volverá lo antes posible.'),
    }[s.outcome];
    if (res || s.outcomeNote) {
      out.push('', T('RESOLUCIÓ:', 'RESOLUCIÓN:'));
      if (res) out.push((at + res).replace(/^./, (c) => c.toUpperCase()));
      if (s.outcomeNote) out.push(s.outcomeNote);
    }
    return out.join('\n');
  },
};

// ---------- Mode: tractament EV ----------
const ev = {
  id: 'ev',
  label: L('Tractament EV', 'Tratamiento EV'),
  init: () => ({ ...baseState(), evDrug: '', vEv: { o2: 'aire' }, evStable: true, side: null, evStart: '', evDur: '60', evEnd: '', evIncid: 'no', evIncidText: '', evRemove: true, evDischarge: '' }),
  sections: [{ title: L('Tractament EV', 'Tratamiento EV'), fields: [
    { type: 'text', id: 'evDrug', wide: true, label: L('Fàrmac i dosi', 'Fármaco y dosis'), placeholder: 'Tocilizumab 760 mg' },
    F.sex,
    { type: 'toggle', id: 'evStable', text: L('C i O, afebril', 'C y O, afebril') },
    { type: 'vitals', id: 'vEv', wide: true, show: ['ta', 'fc', 'temp'] },
    { type: 'chips', id: 'side', label: L('VVP a', 'VVP en'), options: SIDE },
    { type: 'time', id: 'evStart', label: L('Hora inici', 'Hora inicio') },
    { type: 'number', id: 'evDur', label: L('Durada', 'Duración'), unit: 'min' },
    { type: 'time', id: 'evEnd', label: L('Hora final (buit = inici + durada)', 'Hora final (vacío = inicio + duración)') },
    { type: 'chips', id: 'evIncid', required: true, label: L('Complicacions', 'Complicaciones'), options: [o('no', 'Sense', 'Sin'), o('si', 'Amb', 'Con')] },
    { type: 'text', id: 'evIncidText', wide: true, label: L('Què ha passat', 'Qué ha pasado'), when: (s) => s.evIncid === 'si' },
    { type: 'toggle', id: 'evRemove', text: L('Retirada de VVP', 'Retirada de VVP') },
    { type: 'time', id: 'evDischarge', label: L('Hora d’alta', 'Hora de alta') },
  ] }],
  render(s, T, G) {
    const drug = s.evDrug || '___';
    const out = [T(`Pacient que acut a l'HD Endocrí per a l'administració de ${drug} EV.`, `Paciente que acude al HD Endocrino para la administración de ${drug} EV.`)];
    if (s.evStable) out.push(T('Pacient C i O, afebril.', 'Paciente C y O, afebril.'));
    const v = formatVitals(s.vEv, T);
    if (v) out.push('', v);
    const sd = pick(SIDE, [s.side])[0];
    const end = s.evEnd || addMinutes(s.evStart, s.evDur);
    out.push('', T('Col·loquem VVP', 'Colocamos VVP') + (sd ? T(' a ', ' en ') + lbl(sd, T) : '') + '.');
    out.push(T('Administrem el tractament', 'Administramos el tratamiento') + (s.evDur ? T(` en ${s.evDur} min`, ` en ${s.evDur} min`) : '') + (s.evStart ? T(` (inici ${s.evStart} h)`, ` (inicio ${s.evStart} h)`) : '') + '.');
    out.push(s.evIncid === 'si'
      ? T('Complicacions', 'Complicaciones') + (s.evIncidText ? `: ${s.evIncidText}` : '') + '.'
      : T("S'administra el tractament sense complicacions.", 'Se administra el tratamiento sin complicaciones.'));
    const fin = [end && T(`Fi del tractament ${end} h`, `Fin del tratamiento ${end} h`), s.evRemove && T('retirem VVP', 'retiramos VVP'),
      T('alta', 'alta') + (s.evDischarge ? T(` a les ${s.evDischarge} h`, ` a las ${s.evDischarge} h`) : '')].filter(Boolean);
    out.push(fin.join(', ').replace(/^./, (c) => c.toUpperCase()) + '.');
    return out.join('\n');
  },
};

// ---------- Mode: no acut ----------
const noShow = {
  id: 'noacut',
  label: L('No acut', 'No acude'),
  init: () => ({ visit: 'prog', noShowNote: '' }),
  sections: [{ title: L('No acut', 'No acude'), fields: [{ type: 'text', id: 'noShowNote', wide: true, label: L('Motiu (opcional)', 'Motivo (opcional)') }] }],
  render(s, T) {
    return T("No acut a la visita programada a l'HD Endocrí", 'No acude a la visita programada en el HD Endocrino') + (s.noShowNote ? ` (${s.noShowNote})` : '') + '.';
  },
};

export default { modes: [educacio, aguda, ev, noShow] };
