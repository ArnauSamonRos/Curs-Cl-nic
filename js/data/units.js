// Font única dels Hospitals de Dia. El nom visible ve de i18n: clau `units.<id>`.
export const UNITS = [
  { id: 'respiratori',  code: 'RES' },
  { id: 'infeccioses',  code: 'INF' },
  { id: 'polivalent-1', code: 'PV1' },
  { id: 'polivalent-2', code: 'PV2' },
  { id: 'endocrino',    code: 'END' },
  { id: 'vacunacio',    code: 'VAC' },
  { id: 'geriatria',    code: 'GER' },
  { id: 'uic',          code: 'UIC' },
];
export const getUnit = (id) => UNITS.find((u) => u.id === id);
