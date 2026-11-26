// Editor genèric: pinta qualsevol plantilla (modes → seccions → camps) + previsualització en viu.
import { h } from '../core/dom.js';
import { renderField } from '../core/fields.js';
import { copyText } from '../core/clipboard.js';
import { getDraft, resetDraft } from '../core/store.js';
import { t, tr, getLang } from '../i18n/index.js';
import { attachKeyNav, focusKey, restoreFocus, focusFirst } from '../core/keynav.js';

export function Editor(unitId, template) {
  const key = 'cc:' + unitId;
  const draft = getDraft(key, () => ({ mode: template.modes[0].id, data: {} }));
  const modeOf = () => template.modes.find((m) => m.id === draft.mode);
  // Estat compartit entre modes: canviar General→Ingrés conserva hora, constants, intervencions…
  const stateOf = (m) => {
    for (const [k, v] of Object.entries(m.init())) if (!(k in draft.data)) draft.data[k] = v;
    return draft.data;
  };

  const lang = getLang();
  const T = (ca, es) => (lang === 'es' ? es : ca);

  const modeTabs = h('div', { class: 'chips mode-tabs', 'data-group': '_mode' });
  const form = h('div', { class: 'editor-form' });
  const preview = h('pre', { class: 'preview', 'aria-live': 'polite' });
  const copyBtn = h('button', { type: 'button', class: 'btn-primary btn-copy' }, t('editor.copy'));

  function updatePreview() {
    const m = modeOf(), s = stateOf(m);
    const G = (masc, fem, both) => (s.sex === 'h' ? masc : s.sex === 'd' ? fem : both);
    preview.textContent = m.render(s, T, G);
  }

  function renderForm() {
    const fk = focusKey(left);
    const m = modeOf(), s = stateOf(m);
    modeTabs.replaceChildren(...template.modes.map((x) => h('button', {
      type: 'button', class: 'chip chip-lg' + (x.id === m.id ? ' on' : ''), 'aria-pressed': String(x.id === m.id),
      onclick: () => { draft.mode = x.id; renderForm(); },
    }, tr(x.label))));
    const onChange = (structural) => { if (structural) renderForm(); else updatePreview(); };
    form.replaceChildren(...m.sections.map((sec) => {
      const fields = sec.fields.filter((f) => !f.when || f.when(s));
      return h('div', { class: 'card' },
        h('div', { class: 'card-header' }, tr(sec.title)),
        h('div', { class: 'card-body fields' }, fields.map((f) => renderField(f, s, onChange))));
    }));
    updatePreview();
    restoreFocus(left, fk);
  }

  copyBtn.addEventListener('click', async () => {
    const ok = await copyText(preview.textContent);
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
