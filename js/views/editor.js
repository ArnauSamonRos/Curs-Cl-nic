// Editor genèric: pinta qualsevol plantilla (modes → seccions → camps) + previsualització en viu.
import { h } from '../core/dom.js';
import { renderField } from '../core/fields.js';
import { copyRich } from '../core/clipboard.js';
import { getDraft, resetDraft } from '../core/store.js';
import { t, tr, getLang } from '../i18n/index.js';
import { attachKeyNav, focusKey, restoreFocus, focusFirst } from '../core/keynav.js';
import { buildCourse, ensureState } from '../core/course.js';

export function Editor(unitId, template) {
  const key = 'cc:' + unitId;
  const draft = getDraft(key, () => ({ mode: template.modes[0].id, data: {} }));
  const modeOf = () => template.modes.find((m) => m.id === draft.mode);
  const stateOf = (m) => ensureState(draft.data, m);

  let lines = [];
  const lang = getLang();

  const modeTabs = h('div', { class: 'chips mode-tabs', 'data-group': '_mode' });
  const form = h('div', { class: 'editor-form' });
  const preview = h('div', { class: 'preview', 'aria-live': 'polite' });
  const copyBtn = h('button', { type: 'button', class: 'btn-primary btn-copy' }, t('editor.copy'));

  function updatePreview() {
    const m = modeOf();
    ({ lines } = buildCourse({ unitName: t(`units.${unitId}`), mode: m, state: stateOf(m), lang }));
    preview.replaceChildren(...lines.map((l, i) => h('div', {
      class: i === 0 ? 'pv-title' : l.bold ? 'pv-heading' : l.text ? 'pv-line' : 'pv-gap' }, l.text)));
  }

  function renderForm() {
    const fk = focusKey(left);
    const m = modeOf(), s = stateOf(m);
    modeTabs.replaceChildren(...template.modes.map((x) => h('button', {
      type: 'button', class: 'chip chip-lg' + (x.id === m.id ? ' on' : ''), 'aria-pressed': String(x.id === m.id),
      onclick: () => { draft.mode = x.id; renderForm(); },
    }, tr(x.label))));
    const onChange = (structural) => { if (structural) renderForm(); else updatePreview(); };
    form.replaceChildren(...m.sections.filter((sec) => !sec.when || sec.when(s)).map((sec) => {
      const fields = sec.fields.filter((f) => !f.when || f.when(s));
      return h('div', { class: 'card' },
        h('div', { class: 'card-header' }, tr(sec.title)),
        h('div', { class: 'card-body fields' }, fields.map((f) => renderField(f, s, onChange))));
    }));
    updatePreview();
    restoreFocus(left, fk);
  }

  copyBtn.addEventListener('click', async () => {
    const ok = await copyRich(lines);
    copyBtn.textContent = ok ? t('editor.copied') : t('editor.copyError');
    copyBtn.classList.toggle('done', ok);
    setTimeout(() => { copyBtn.textContent = t('editor.copy'); copyBtn.classList.remove('done'); }, 1500);
  });

  const copy = () => copyBtn.click();
  const reset = () => {
    if (!confirm(t('editor.resetConfirm'))) return;
    const mode = draft.mode;
    resetDraft(key);
    Object.assign(draft, { mode, data: {} });
    renderForm();
    focusFirst(form);
  };
  const resetBtn = h('button', { type: 'button', class: 'btn-ghost', onclick: reset }, t('editor.reset'));

  // Dreceres globals mentre l'editor és a la pàgina.
  const onKey = (e) => {
    if (!root.isConnected) return removeEventListener('keydown', onKey);
    const k = e.key.toLowerCase();
    if ((e.ctrlKey || e.metaKey) && k === 'enter') { e.preventDefault(); copy(); }
    else if (e.altKey && /^[1-9]$/.test(k) && template.modes[k - 1]) {
      e.preventDefault(); draft.mode = template.modes[k - 1].id; renderForm(); focusFirst(form);
    } else if (e.altKey && k === 'n') { e.preventDefault(); reset(); }
  };
  addEventListener('keydown', onKey);

  const left = h('div', { class: 'editor-left' }, modeTabs, form);
  attachKeyNav(left);
  renderForm();
  requestAnimationFrame(() => focusFirst(form));

  const root = h('div', { class: 'editor' },
    left,
    h('aside', { class: 'editor-right' },
      h('div', { class: 'card preview-card' },
        h('div', { class: 'card-header row-between' }, t('unit.course'), h('div', { class: 'row' }, resetBtn, copyBtn)),
        preview,
        h('div', { class: 'kbd-help' }, t('editor.kbd')))));
  return root;
}
