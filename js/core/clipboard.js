// Copia text enriquit (HTML) + text pla. Els editors clínics que accepten format
// mantenen la negreta dels títols; els que no, reben el text pla.
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// lines: [{ text, bold }]
export function toHtml(lines) {
  return lines.map((l) => (l.bold ? `<b>${esc(l.text)}</b>` : esc(l.text))).join('<br>');
}

export async function copyRich(lines) {
  const plain = lines.map((l) => l.text).join('\n');
  const html = toHtml(lines);
  try {
    await navigator.clipboard.write([new ClipboardItem({
      'text/html': new Blob([html], { type: 'text/html' }),
      'text/plain': new Blob([plain], { type: 'text/plain' }),
    })]);
    return true;
  } catch {}
  // Fallback (http a la intranet): seleccionar un bloc amb format i copiar.
  const div = document.createElement('div');
  div.innerHTML = html;
  div.style.cssText = 'position:fixed;left:-9999px;white-space:pre-wrap';
  document.body.append(div);
  const range = document.createRange(); range.selectNodeContents(div);
  const sel = getSelection(); sel.removeAllRanges(); sel.addRange(range);
  let ok = false;
  try { ok = document.execCommand('copy'); } catch {}
  sel.removeAllRanges(); div.remove();
  return ok;
}
