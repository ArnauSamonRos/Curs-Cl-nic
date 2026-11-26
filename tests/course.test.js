// Tests "golden": el text generat per cada plantilla/mode/idioma ha de coincidir amb el desat a tests/__snapshots__.
// Si un canvi és intencionat: `npm run test:update` i revisar el diff.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { TEMPLATES } from '../js/templates/index.js';
import { buildCourse, ensureState } from '../js/core/course.js';
import { CASES, FIXED } from './fixtures.js';

const DIR = new URL('./__snapshots__/', import.meta.url);
const UPDATE = !!process.env.UPDATE_SNAPSHOTS;
mkdirSync(DIR, { recursive: true });

for (const [unit, modes] of Object.entries(CASES)) {
  const tpl = TEMPLATES[unit];
  for (const mode of tpl.modes) {
    const cases = { inicial: {}, ...(modes[mode.id] ?? {}) };
    for (const [name, overrides] of Object.entries(cases)) {
      for (const lang of ['ca', 'es']) {
        test(`${unit} › ${mode.id} › ${name} › ${lang}`, () => {
          const state = ensureState({}, mode);
          for (const k of Object.keys(state)) if (/time|Time$/.test(k) && state[k]) state[k] = FIXED.time;
          Object.assign(state, overrides);
          const { text, lines } = buildCourse({ unitName: `HD ${unit}`, mode, state, lang });
          assert.equal(lines[0].bold, true);
          assert.doesNotMatch(text, /undefined|null|NaN|\[object/);
          const file = new URL(`${unit}.${mode.id}.${name}.${lang}.txt`, DIR);
          if (UPDATE || !existsSync(file)) writeFileSync(file, text);
          else assert.equal(text, readFileSync(file, 'utf8'));
        });
      }
    }
  }
}
