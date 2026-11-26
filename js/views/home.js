import { h } from '../core/dom.js';
import { navigate } from '../core/router.js';
import { UNITS } from '../data/units.js';

export function HomeView() {
  return h('section', {},
    h('h1', { class: 'page-title' }, 'Selecciona l\'Hospital de Dia'),
    h('div', { class: 'grid' },
      UNITS.map((u) => h('button', { class: 'card unit', onclick: () => navigate(`/unit/${u.id}`) },
        h('span', { class: 'unit-code' }, u.code),
        h('span', { class: 'unit-name' }, u.name),
      )),
    ),
  );
}
