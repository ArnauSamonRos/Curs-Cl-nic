// navigator.clipboard només funciona en context segur (https/localhost); a la intranet pot ser http.
export async function copyText(text) {
  try { await navigator.clipboard.writeText(text); return true; } catch {}
  const ta = Object.assign(document.createElement('textarea'), { value: text });
  ta.style.cssText = 'position:fixed;opacity:0';
  document.body.append(ta); ta.select();
  const ok = document.execCommand('copy');
  ta.remove();
  return ok;
}
