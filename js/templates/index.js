// Registre de plantilles per unitat. Nova unitat = nou fitxer + una línia aquí.
import respiratori from './respiratori.js';
import polivalent from './polivalent.js';
import endocrino from './endocrino.js';
import vacunes from './vacunes.js';
export const TEMPLATES = { respiratori, 'polivalent-1': polivalent, 'polivalent-2': polivalent, endocrino, vacunacio: vacunes, infeccioses: vacunes };
