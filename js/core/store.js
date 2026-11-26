// Esborranys en memòria (sobreviuen al canvi d'idioma/navegació, no a recarregar: no guardem dades clíniques al disc).
const drafts = new Map();
export function getDraft(key, init) {
  if (!drafts.has(key)) drafts.set(key, init());
  return drafts.get(key);
}
export const resetDraft = (key) => drafts.delete(key);
