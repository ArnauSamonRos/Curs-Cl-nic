// Router per hash: funciona en qualsevol servidor estàtic (o obrint des d'una carpeta compartida).
let rerender = () => {};
export const refresh = () => rerender();
const routes = [];
export function route(pattern, view) {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '$');
  routes.push({ re, keys, view });
}
export const navigate = (path) => { location.hash = path; };
export function start(mount, onChange) {
  const render = () => {
    const path = location.hash.slice(1) || '/';
    for (const r of routes) {
      const m = path.match(r.re);
      if (m) {
        const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
        mount.replaceChildren(r.view(params));
        onChange?.(path);
        return;
      }
    }
    navigate('/');
  };
  addEventListener("hashchange", render);
  rerender = render;
  render();
}
