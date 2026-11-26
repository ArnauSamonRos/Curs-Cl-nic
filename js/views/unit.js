import { h } from '../core/dom.js';
import { getUnit } from '../data/units.js';

// Placeholder: aquí anirà el generador de curs clínic de cada unitat.
export function UnitView({ id }) {
  const u = getUnit(id);
  if (!u) return h('div', { class: 'empty' }, 'Unitat no trobada');
  return h('section', {},
    h('h1', { class: 'page-title' }, u.name),
    h('div', { class: 'card' },
      h('div', { class: 'card-header' }, 'Curs clínic'),
      h('div', { class: 'empty' }, 'Pròximament: plantilla de curs clínic'),
    ),
  );
}
