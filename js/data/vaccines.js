// Calendaris vacunals de l'HD (carnets de Sant Pau).
// doses: mesos des del dia 0 del programa. Ex.: [0, 2] = dia 0 i als 2 mesos.
// Per canviar un calendari, només cal tocar aquesta taula: el pla es recalcula sol.

// Catàleg: nom curt al CC i marca per defecte.
export const VACCINES = {
  pn21:   { name: 'Pneumo', brand: 'Pn 21' },
  pn20:   { name: 'Pneumo', brand: 'Pn 20' },
  hexa:   { name: { ca: 'Hexavalent', es: 'Hexavalente' }, brand: 'Vaxelis' },
  hib:    { name: 'Haemophilus influenzae b', brand: 'Hiberix' },
  acwy:   { name: 'Mng ACWY', brand: 'Nimenrix' },
  menb:   { name: 'Mng B', brand: 'Bexsero' },
  vha:    { name: 'VHA', brand: 'Avaxim' },
  vhb:    { name: 'VHB', brand: 'Engerix-B' },
  vhab:   { name: 'VHA+B', brand: 'Twinrix' },
  vhz:    { name: 'VHZ', brand: 'Shingrix' },
  vph:    { name: { ca: 'Papil·loma', es: 'Papiloma' }, brand: 'Gardasil 9' },
  dtpa:   { name: 'dTpa', brand: 'Boostrix' },
  td:     { name: { ca: 'Tètanus', es: 'Tétanos' }, brand: 'Td' },
  polio:  { name: 'Polio', brand: 'Imovax Polio' },
  var:    { name: { ca: 'Varicel·la', es: 'Varicela' }, brand: 'Varivax', live: true },
  tv:     { name: { ca: 'Triple vírica', es: 'Triple vírica' }, brand: 'M-M-RVaxPro', live: true },
};

const BLUE = { hib: [0], acwy: [0, 2], pn21: [0], vha: [0, 6], vhb: [0, 1, 2, 6], vph: [0, 2, 6], vhz: [0, 2], menb: [0, 1], var: [0, 1], tv: [0, 1] };
const BLUE_PRESET = ['hib', 'acwy', 'pn21', 'vha', 'vhb', 'vph', 'vhz'];
const BLUE_NOTE = { ca: 'Atenuades només en no immunodeprimits (si immunodeprimit, esperar a finalitzar el tractament). VHA/VHB segons serologia. ACWY i zòster: 2a dosi entre 2 i 6 mesos.',
  es: 'Atenuadas solo en no inmunodeprimidos (si inmunodeprimido, esperar a finalizar el tratamiento). VHA/VHB según serología. ACWY y zóster: 2ª dosis entre 2 y 6 meses.' };

// Programes. from: servei que deriva (s'omple sol). preset: vacunes marcades d'entrada; la resta es poden afegir.
// note: avís que surt al formulari (no al CC).
export const PROGRAMS = {
  // Carnet BLAU — pacients amb biològics / immunosupressors, per servei
  // (inactivades: ≥2 setmanes abans d'iniciar el tractament).
  reuma: { label: { ca: 'Reumatologia', es: 'Reumatología' }, from: 'reuma', schedule: BLUE, preset: BLUE_PRESET, note: BLUE_NOTE },
  derma: { label: { ca: 'Dermatologia', es: 'Dermatología' }, from: 'derma', schedule: BLUE, preset: BLUE_PRESET, note: BLUE_NOTE },
  vih: {
    label: { ca: 'CEX Infeccioses (VIH)', es: 'CEX Infecciosas (VIH)' }, from: 'cexinf',
    schedule: { pn20: [0], vhz: [0, 2], acwy: [0, 2], vph: [0, 2, 6], vha: [0, 6], vhb: [0, 1, 2, 6] },
    preset: ['pn20', 'vhz', 'acwy', 'vph', 'vha', 'vhb'],
    note: { ca: 'Papil·loma fins als 45 anys. VHA/VHB segons serologia.', es: 'Papiloma hasta los 45 años. VHA/VHB según serología.' },
  },
  onco: {
    label: { ca: 'Oncologia', es: 'Oncología' }, from: 'onco',
    schedule: { pn21: [0], vhz: [0, 2], dtpa: [0] },
    preset: ['pn21', 'vhz', 'dtpa'],
  },
  // Carnet TARONJA — TPH.
  tph: {
    label: { ca: 'TPH', es: 'TPH' }, from: 'hemato',
    schedule: { pn21: [0, 1, 2, 12], hexa: [0, 1, 2, 12], vhz: [0, 2], vha: [0, 6], acwy: [1, 6], menb: [1, 6], vph: [0, 2, 6], var: [24, 26], tv: [24, 26] },
    preset: ['pn21', 'hexa', 'vhz', 'vha', 'acwy', 'menb'],
    note: { ca: 'Atenuades sempre a partir dels 24 mesos post-TPH (12 en CAR-T) i havent finalitzat el tractament immunosupressor. Papil·loma si < 45 anys.',
      es: 'Atenuadas siempre a partir de los 24 meses post-TPH (12 en CAR-T) y habiendo finalizado el tratamiento inmunosupresor. Papiloma si < 45 años.' },
  },
  // Carnet VERMELL — trasplantament d'òrgan sòlid.
  tos: {
    label: { ca: 'Trasplantament', es: 'Trasplante' }, from: 'tx',
    schedule: { pn21: [0], hib: [1], acwy: [0, 2], vhz: [0, 2], vha: [0, 6], vhb: [0, 1, 2, 12], vhab: [0, 1, 2, 12], td: [1], vph: [0, 2, 6], polio: [0], var: [0, 1], tv: [0, 1] },
    preset: ['pn21', 'hib', 'acwy', 'vhz', 'td'],
    note: { ca: 'Atenuades NOMÉS en pretrasplantament. VHA/VHB/VHA+B segons serologia (pauta ràpida). Papil·loma ≤ 45 anys. Polio: Afganistan/Pakistan. ACWY i zòster: 2a dosi entre 2 i 6 mesos.',
      es: 'Atenuadas SOLO en pretrasplante. VHA/VHB/VHA+B según serología (pauta rápida). Papiloma ≤ 45 años. Polio: Afganistán/Pakistán. ACWY y zóster: 2ª dosis entre 2 y 6 meses.' },
  },
};

// Afegeix n mesos a una data (dd/mm/aaaa).
export function addMonthsFmt(date, n) {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1); d.setMonth(d.getMonth() + n);
  d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
  return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
