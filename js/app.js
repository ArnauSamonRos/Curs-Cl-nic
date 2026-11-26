import { route, start, refresh } from './core/router.js';
import { h } from './core/dom.js';
import { t, getLang, setLang, onLangChange, LANGS } from './i18n/index.js';
import { HomeView } from './views/home.js';
import { UnitView } from './views/unit.js';

route('/', HomeView);
route('/unit/:id', UnitView);

const tabs = document.getElementById('tabs');
const brand = document.querySelector('.brand');
const langSwitch = document.getElementById('lang');

function renderChrome(path) {
  document.title = t('app.title');
  brand.textContent = t('app.title');
  tabs.replaceChildren(
    h('a', { class: 'tab' + (path === '/' ? ' active' : ''), href: '#/' }, t('tab.units')),
  );
  langSwitch.replaceChildren(...Object.keys(LANGS).map((l) =>
    h('button', { class: 'lang-btn' + (l === getLang() ? ' active' : ''), 'aria-pressed': String(l === getLang()), onclick: () => setLang(l) }, l.toUpperCase())));
}

onLangChange(refresh);

// En local, avisa a la consola si alguna plantilla està mal configurada.
if (['localhost', '127.0.0.1'].includes(location.hostname)) {
  Promise.all([import('./core/schema.js'), import('./templates/index.js')]).then(([{ validateTemplate }, { TEMPLATES }]) => {
    for (const [n, tpl] of Object.entries(TEMPLATES)) validateTemplate(n, tpl).forEach((e) => console.error(e));
  });
}
start(document.getElementById('app'), renderChrome);
