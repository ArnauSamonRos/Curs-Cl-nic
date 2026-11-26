export const nowHHMM = () => new Date().toTimeString().slice(0, 5);
// "09:30" + 90 → "11:00". Retorna '' si falten dades.
export function addMinutes(hhmm, min) {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm || ''); const n = parseInt(min, 10);
  if (!m || !n) return '';
  const t = (+m[1] * 60 + +m[2] + n) % 1440;
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
}
