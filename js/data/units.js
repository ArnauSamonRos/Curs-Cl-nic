// Font única de veritat dels Hospitals de Dia. Afegir-ne un = afegir una línia.
export const UNITS = [
  { id: 'respiratori',  code: 'RES', name: 'HD Respiratori' },
  { id: 'infeccioses',  code: 'INF', name: 'HD Infeccioses' },
  { id: 'polivalent-1', code: 'PV1', name: 'HD Polivalent 1' },
  { id: 'polivalent-2', code: 'PV2', name: 'HD Polivalent 2' },
  { id: 'endocrino',    code: 'END', name: 'HD Endocrinologia' },
  { id: 'vacunacio',    code: 'VAC', name: 'HD Vacunació' },
  { id: 'geriatria',    code: 'GER', name: 'HD Geriatria' },
  { id: 'uic',          code: 'UIC', name: 'UIC' },
];
export const getUnit = (id) => UNITS.find((u) => u.id === id);
