import { h } from '../core/dom.js';
import { getUnit } from '../data/units.js';
import { TEMPLATES } from '../templates/index.js';
import { t } from '../i18n/index.js';
import { Editor } from './editor.js';

export function UnitView({ id }) {
  const u = getUnit(id);
  if (!u) return h('div', { class: 'empty' }, t('unit.notFound'));
  const tpl = TEMPLATES[id];
  return h('section', {},
    h('div', { class: 'row page-head' },
      h('a', { class: 'btn-ghost', href: '#/' }, '← ' + t('nav.back')),
      h('h1', { class: 'page-title' }, t(`units.${u.id}`))),
    tpl ? Editor(id, tpl) : h('div', { class: 'card' },
      h('div', { class: 'card-header' }, t('unit.course')),
      h('div', { class: 'empty' }, t('unit.soon'))),
  );
}
