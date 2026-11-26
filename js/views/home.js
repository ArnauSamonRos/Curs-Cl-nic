import { h } from '../core/dom.js';
import { navigate } from '../core/router.js';
import { UNITS } from '../data/units.js';
import { t } from '../i18n/index.js';

export function HomeView() {
  return h('section', {},
    h('h1', { class: 'page-title' }, t('home.title')),
    h('div', { class: 'grid grid-home' },
      UNITS.map((u) => h('button', { class: 'card unit', onclick: () => navigate(`/unit/${u.id}`) },
        h('span', { class: 'unit-code' }, u.code),
        h('span', { class: 'unit-name' }, t(`units.${u.id}`)),
      )),
    ),
  );
}
