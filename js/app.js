import { route, start } from './core/router.js';
import { h } from './core/dom.js';
import { HomeView } from './views/home.js';
import { UnitView } from './views/unit.js';

route('/', HomeView);
route('/unit/:id', UnitView);

const tabs = document.getElementById('tabs');
start(document.getElementById('app'), (path) => {
  tabs.replaceChildren(
    h('a', { class: 'tab' + (path === '/' ? ' active' : ''), href: '#/' }, '1. Hospitals de Dia'),
  );
});
