import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import ca from '../js/i18n/ca.js';
import es from '../js/i18n/es.js';
import { TEMPLATES } from '../js/templates/index.js';
import { UNITS } from '../js/data/units.js';
import { validateTemplate } from '../js/core/schema.js';
import { addMinutes } from '../js/core/time.js';
import { detectCaEs } from '../js/core/translate.js';
import { formatVitals, joinList } from '../js/core/text.js';
import { planGroups, dosesAt, selectDueDoses } from '../js/domain/vaccinePlan.js';
import { PROGRAMS, VACCINES } from '../js/data/vaccines.js';

const T = (c) => c;

test('i18n: català i castellà tenen exactament les mateixes claus', () => {
  assert.deepEqual(Object.keys(ca).sort(), Object.keys(es).sort());
});

test('i18n: totes les claus t("…") del codi existeixen', () => {
  const files = (dir) => readdirSync(new URL(dir, import.meta.url), { recursive: true }).filter((f) => f.endsWith('.js')).map((f) => new URL(dir + f, import.meta.url));
  const used = new Set();
  for (const f of files('../js/')) for (const m of readFileSync(f, 'utf8').matchAll(/\bt\('([\w.-]+)'\)/g)) used.add(m[1]);
  for (const k of used) assert.ok(k in ca, `falta la clau "${k}"`);
});

test('cada unitat té nom traduït', () => {
  for (const u of UNITS) assert.ok(ca[`units.${u.id}`] && es[`units.${u.id}`], u.id);
});

test('totes les plantilles són vàlides', () => {
  for (const [name, tpl] of Object.entries(TEMPLATES)) assert.deepEqual(validateTemplate(name, tpl), []);
  for (const id of Object.keys(TEMPLATES)) assert.ok(UNITS.some((u) => u.id === id), `plantilla sense unitat: ${id}`);
});

test('addMinutes', () => {
  assert.equal(addMinutes('09:10', 30), '09:40');
  assert.equal(addMinutes('23:30', 60), '00:30');
  assert.equal(addMinutes('', 30), '');
  assert.equal(addMinutes('09:00', ''), '');
});

test('detectCaEs', () => {
  assert.equal(detectCaEs('Home de 39 anys citat avui amb la seva filla'), 'ca');
  assert.equal(detectCaEs('Hombre de 39 años citado hoy con su hija'), 'es');
});

test('formatVitals i joinList', () => {
  assert.equal(formatVitals({ tas: '120', tad: '80', fc: '70', o2: 'aire' }, T), "TA: 120/80 mmHg   FC: 70 x'");
  assert.equal(formatVitals({ sat: '95', o2: 'un', o2v: '2' }, T), 'SatO2: 95% amb ulleres nasals a 2 L/min');
  assert.equal(joinList(['a', 'b', 'c'], T), 'a, b i c');
});

test('calendaris: totes les vacunes existeixen al catàleg i els mesos són creixents', () => {
  for (const [id, p] of Object.entries(PROGRAMS)) {
    for (const [v, offs] of Object.entries(p.schedule)) {
      assert.ok(VACCINES[v], `${id}: vacuna desconeguda ${v}`);
      assert.deepEqual([...offs].sort((a, b) => a - b), offs, `${id}/${v}`);
    }
    for (const v of p.preset) assert.ok(p.schedule[v], `${id}: preset fora de calendari ${v}`);
  }
});

test('vacunes: dosis d\'avui i propera visita (TPH dia 0)', () => {
  const s = { program: 'tph', vaccines: PROGRAMS.tph.preset, month: 0 };
  selectDueDoses(s);
  assert.deepEqual(dosesAt(s, 0).map((d) => d.vac).sort(), ['hexa', 'pn21', 'vha', 'vhz']);
  const [next] = planGroups(s);
  assert.equal(next.off, 1);
  assert.deepEqual(next.doses.map((d) => `${d.vac}:${d.i}`).sort(), ['acwy:0', 'hexa:1', 'menb:0', 'pn21:1']);
});

test('vacunes: una dosi no posada passa a la propera visita i desplaça les següents', () => {
  const s = { program: 'reuma', vaccines: ['vhb', 'pn21'], month: 0, given: ['pn21:0'] };
  const plan = planGroups(s);
  assert.deepEqual(plan.map((g) => [g.off, g.doses.map((d) => `${d.vac}:${d.i}`)]), [
    [1, ['vhb:0']], [2, ['vhb:1']], [3, ['vhb:2']], [7, ['vhb:3']],
  ]);
});
