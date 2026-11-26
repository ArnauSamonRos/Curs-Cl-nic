// Navegació amb teclat dins d'un contenidor.
//  ←/→ : control anterior/següent (en textos, només quan el cursor és a l'inici/final)
//  ↑/↓ : grup (camp) anterior/següent → enfoca l'opció seleccionada o la primera
//  Enter en un text: salta al camp següent. Espai/Enter en un botó: el marca.
// Els grups es marquen amb [data-group]. Cap dependència de l'estructura de la plantilla.

const CONTROLS = 'button:not([disabled]), input:not([disabled])';

const controls = (root) => [...root.querySelectorAll(CONTROLS)];
const groupOf = (el) => el.closest('[data-group]');

function focusGroup(root, from, dir) {
  const groups = [...root.querySelectorAll('[data-group]')].filter((g) => g.querySelector(CONTROLS));
  const target = groups[groups.indexOf(groupOf(from)) + dir];
  if (!target) return;
  const first = target.querySelector(CONTROLS);
  // Si el camp són xips, anar a l'opció ja marcada.
  ((first.classList.contains('chip') && first.parentElement.querySelector('.chip.on')) || first).focus();
}

function focusStep(root, from, dir) {
  const list = controls(root);
  list[list.indexOf(from) + dir]?.focus();
}

const isText = (el) => el.tagName === 'INPUT' && el.type === 'text';

export function attachKeyNav(root) {
  root.addEventListener('keydown', (e) => {
    const el = e.target;
    if (!el.matches(CONTROLS) || e.altKey || e.ctrlKey || e.metaKey) return;
    const atStart = isText(el) ? el.selectionStart === 0 && el.selectionEnd === 0 : true;
    const atEnd = isText(el) ? el.selectionStart === el.value.length : true;
    const isTime = el.type === 'time';

    switch (e.key) {
      case 'ArrowLeft': if (isTime || !atStart) return; focusStep(root, el, -1); break;
      case 'ArrowRight': if (isTime || !atEnd) return; focusStep(root, el, 1); break;
      case 'ArrowUp': focusGroup(root, el, -1); break;
      case 'ArrowDown': focusGroup(root, el, 1); break;
      case 'Enter': if (el.tagName !== 'INPUT') return; focusGroup(root, el, 1); break;
      default: return;
    }
    e.preventDefault();
  });
}

// Clau estable d'un control (grup + índex) per recuperar el focus després de repintar.
export function focusKey(root) {
  const el = document.activeElement;
  if (!root.contains(el)) return null;
  const g = groupOf(el);
  return g && { group: g.dataset.group, i: [...g.querySelectorAll(CONTROLS)].indexOf(el) };
}
export function restoreFocus(root, key) {
  if (!key) return;
  const g = root.querySelector(`[data-group="${CSS.escape(key.group)}"]`);
  const list = g ? [...g.querySelectorAll(CONTROLS)] : [];
  (list[key.i] ?? list[0])?.focus();
}
export const focusFirst = (root) => root.querySelector(CONTROLS)?.focus();
