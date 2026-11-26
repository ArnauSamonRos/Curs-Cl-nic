// Traducció ca⇄es dins del navegador (Chrome/Edge: API "Translator", model local).
// Cap text clínic surt de l'ordinador: no es fa servir cap servei extern.
const cache = new Map();
// Si el navegador no respon (p. ex. descàrrega del model bloquejada), no deixem l'usuari esperant.
const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms))]);

// Detecció ràpida ca/es per paraules freqüents (no depèn de cap API).
export function detectCaEs(text) {
  const t = ` ${text.toLowerCase()} `;
  const score = (words) => words.reduce((n, w) => n + (t.split(w).length - 1), 0);
  const ca = score([' amb ', ' els ', ' les ', ' anys', ' per ', ' i ', "l'", "d'", ' des de ', ' seu ', ' és ', ' una ', 'ç', ' què ', ' perquè ', ' pacient ']);
  const es = score([' con ', ' los ', ' años', ' por ', ' y ', ' el ', ' del ', ' desde ', ' su ', ' es ', ' que ', 'ñ', ' paciente ', ' hace ', ' para ']);
  if (ca === es) return null;
  return ca > es ? 'ca' : 'es';
}

export const translatorSupported = () => typeof self !== 'undefined' && 'Translator' in self;

// Retorna { text, from, status }: status 'same' | 'ok' | 'unsupported' | 'error'.
export async function translateTo(text, target) {
  const from = detectCaEs(text);
  if (!from || from === target) return { text, from, status: 'same' };
  if (!translatorSupported()) return { text, from, status: 'unsupported' };
  try {
    const key = `${from}>${target}`;
    if (!cache.has(key)) {
      const opts = { sourceLanguage: from, targetLanguage: target };
      if ((await withTimeout(self.Translator.availability(opts), 5000)) === 'unavailable') return { text, from, status: 'unsupported' };
      cache.set(key, self.Translator.create(opts));
    }
    const tr = await withTimeout(cache.get(key), 60000);
    // Línia a línia per conservar l'estructura del text del metge.
    const out = [];
    for (const line of text.split('\n')) out.push(line.trim() ? await withTimeout(tr.translate(line), 15000) : line);
    return { text: out.join('\n'), from, status: 'ok' };
  } catch (e) {
    cache.delete(`${from}>${target}`);
    return { text, from, status: 'error' };
  }
}
