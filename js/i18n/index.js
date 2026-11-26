// Tots els textos visibles passen per t(). Afegir un text = afegir la clau a ca.js I es.js.
import ca from './ca.js';
import es from './es.js';

export const LANGS = { ca, es };
const KEY = 'lang';
let lang = (() => { try { return localStorage.getItem(KEY); } catch { return null; } })();
if (!LANGS[lang]) lang = 'ca';
document.documentElement.lang = lang;

const listeners = new Set();
export const getLang = () => lang;
export const onLangChange = (fn) => listeners.add(fn);
export function setLang(l) {
  if (!LANGS[l] || l === lang) return;
  lang = l;
  document.documentElement.lang = l;
  try { localStorage.setItem(KEY, l); } catch {}
  listeners.forEach((fn) => fn(l));
}
export function t(key) {
  const v = LANGS[lang][key] ?? LANGS.ca[key];
  if (v == null) console.warn('i18n: falta la clau', key);
  return v ?? key;
}
