import { h } from '../core/dom.js';
import { getUnit } from '../data/units.js';
import { t } from '../i18n/index.js';

// Placeholder: aquí anirà el generador de curs clínic de cada unitat.
export function UnitView({ id }) {
  const u = getUnit(id);
  if (!u) return h('div', { class: 'empty' }, t('unit.notFound'));
  return h('section', {},
    h('h1', { class: 'page-title' }, t(`units.${u.id}`)),
    h('div', { class: 'card' },
      h('div', { class: 'card-header' }, t('unit.course')),
      h('div', { class: 'empty' }, t('unit.soon')),
    ),
  );
}
