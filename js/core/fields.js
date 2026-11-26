// Renderitzadors genèrics de camps. Una plantilla només declara camps; aquí es pinten.
// Tipus: time, chips (single/multi), vitals, number, text, toggle.
import { h } from './dom.js';
import { t, tr } from '../i18n/index.js';
import { nowHHMM } from './time.js';

// onChange(structural): structural=true repinta el formulari (camps condicionals); false només la previsualització.
export function renderField(f, s, onChange) {
  const R = RENDERERS[f.type];
  if (!R) throw new Error('Tipus de camp desconegut: ' + f.type);
  return h('div', { class: 'field' + (f.wide ? ' field-wide' : ''), 'data-group': f.id },
    f.label ? h('label', { class: 'field-label' }, tr(f.label)) : null,
    R(f, s, onChange));
}

const input = (props, value, oninput) => {
  const el = h('input', { class: 'input', ...props });
  el.value = value ?? '';
  el.addEventListener('input', () => oninput(el.value));
  return el;
};

const RENDERERS = {
  time(f, s, onChange) {
    const el = input({ type: 'time' }, s[f.id], (v) => { s[f.id] = v; onChange(false); });
    return h('div', { class: 'row' }, el,
      h('button', { type: 'button', class: 'btn-ghost', onclick: () => { s[f.id] = el.value = nowHHMM(); onChange(false); } }, t('form.now')));
  },

  chips(f, s, onChange) {
    const sel = () => (f.multi ? s[f.id] ?? [] : s[f.id]);
    return h('div', { class: 'chips', role: f.multi ? 'group' : 'radiogroup' },
      f.options.map((o) => {
        const on = f.multi ? sel().includes(o.id) : sel() === o.id;
        return h('button', {
          type: 'button', class: 'chip' + (on ? ' on' : ''), 'aria-pressed': String(on),
          onclick: () => {
            if (f.multi) s[f.id] = on ? sel().filter((x) => x !== o.id) : [...sel(), o.id];
            else s[f.id] = on && !f.required ? null : o.id;
            onChange(true);
          },
        }, tr(o.label));
      }));
  },

  // Llista llarga amb cercador: escriure filtra les opcions sense repintar (no es perd el focus).
  pick(f, s, onChange) {
    const norm = (x) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const chips = f.options.map((o) => {
      const on = s[f.id] === o.id;
      const el = h('button', { type: 'button', class: 'chip' + (on ? ' on' : ''), 'aria-pressed': String(on),
        onclick: () => { s[f.id] = on ? null : o.id; onChange(true); } }, tr(o.label));
      el._text = norm(tr(o.label));
      return el;
    });
    const filter = h('input', { type: 'text', class: 'input', placeholder: t('form.search') });
    filter.addEventListener('input', () => {
      const q = norm(filter.value.trim());
      chips.forEach((c) => { c.hidden = !!q && !c._text.includes(q); });
    });
    // Enter al cercador amb un sol resultat: el selecciona.
    filter.addEventListener('keydown', (e) => {
      const visible = chips.filter((c) => !c.hidden);
      if (e.key === 'Enter' && visible.length === 1) { e.preventDefault(); e.stopPropagation(); visible[0].click();
        // i salta al camp següent (el formulari ja s'ha repintat).
        document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); }
    });
    return h('div', { class: 'pick' }, filter, h('div', { class: 'chips' }, chips));
  },

  number(f, s, onChange) {
    return h('div', { class: 'row' },
      input({ type: 'text', inputmode: 'decimal', class: 'input input-num', placeholder: f.placeholder ?? '' },
        s[f.id], (v) => { s[f.id] = v.trim(); onChange(false); }),
      f.unit ? h('span', { class: 'unit-suffix' }, tr(f.unit)) : null);
  },

  text(f, s, onChange) {
    return input({ type: 'text', placeholder: tr(f.placeholder) }, s[f.id], (v) => { s[f.id] = v.trim(); onChange(false); });
  },

  toggle(f, s, onChange) {
    const on = !!s[f.id];
    return h('button', { type: 'button', class: 'chip' + (on ? ' on' : ''), 'aria-pressed': String(on),
      onclick: () => { s[f.id] = !on; onChange(true); } }, tr(f.text));
  },

  // Constants vitals: objecte { tas, tad, fc, fr, sat, o2, o2v, temp }
  vitals(f, s, onChange) {
    const v = (s[f.id] ??= { o2: 'aire' });
    const num = (key, label, unit, ph) => h('div', { class: 'vital' },
      h('span', { class: 'vital-label' }, label),
      input({ type: 'text', inputmode: 'decimal', class: 'input input-num', placeholder: ph ?? '' }, v[key],
        (val) => { v[key] = val.trim(); onChange(false); }),
      unit ? h('span', { class: 'unit-suffix' }, unit) : null);
    const o2opts = [
      { id: 'aire', label: t('vitals.air') },
      { id: 'un', label: t('vitals.nasal') },
      { id: 'vmk', label: t('vitals.venturi') },
    ];
    return h('div', { class: 'vitals' },
      h('div', { class: 'vital' }, h('span', { class: 'vital-label' }, 'TA'),
        input({ type: 'text', inputmode: 'numeric', class: 'input input-num', placeholder: '120' }, v.tas, (x) => { v.tas = x.trim(); onChange(false); }),
        h('span', { class: 'unit-suffix' }, '/'),
        input({ type: 'text', inputmode: 'numeric', class: 'input input-num', placeholder: '80' }, v.tad, (x) => { v.tad = x.trim(); onChange(false); }),
        h('span', { class: 'unit-suffix' }, 'mmHg')),
      num('fc', 'FC', "x'", '80'),
      num('fr', 'FR', "x'", '16'),
      num('sat', 'SatO2', '%', '96'),
      num('temp', 'Tª', 'ºC', '36,5'),
      h('div', { class: 'vital vital-o2' },
        h('div', { class: 'chips' }, o2opts.map((o) => h('button', {
          type: 'button', class: 'chip chip-sm' + (v.o2 === o.id ? ' on' : ''),
          onclick: () => { v.o2 = o.id; onChange(true); } }, o.label))),
        v.o2 !== 'aire'
          ? h('div', { class: 'row' }, input({ type: 'text', inputmode: 'decimal', class: 'input input-num' }, v.o2v,
              (x) => { v.o2v = x.trim(); onChange(false); }), h('span', { class: 'unit-suffix' }, v.o2 === 'un' ? 'L/min' : 'FiO2 %'))
          : null));
  },
};

// Format de constants per al text final. T(ca, es) tria idioma.
export function formatVitals(v = {}, T) {
  const parts = [];
  if (v.tas || v.tad) parts.push(`TA: ${v.tas || '-'}/${v.tad || '-'} mmHg`);
  if (v.fc) parts.push(`FC: ${v.fc} x'`);
  if (v.fr) parts.push(`FR: ${v.fr} x'`);
  if (v.sat) {
    const o2 = v.o2 === 'un' ? T(`amb ulleres nasals a ${v.o2v || '-'} L/min`, `con gafas nasales a ${v.o2v || '-'} L/min`)
      : v.o2 === 'vmk' ? T(`amb Ventimask al ${v.o2v || '-'}%`, `con Ventimask al ${v.o2v || '-'}%`)
      : T("a l'aire", 'basal');
    parts.push(`SatO2: ${v.sat}% ${o2}`);
  }
  if (v.temp) parts.push(`Tª: ${v.temp} ºC`);
  return parts.join('   ');
}

// Uneix una llista en llenguatge natural: "a, b i c" / "a, b y c".
export function joinList(items, T) {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(', ') + T(' i ', ' y ') + items.at(-1);
}
