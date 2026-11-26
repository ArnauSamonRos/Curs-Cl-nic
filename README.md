# Curs Clínic

App estàtica (HTML + CSS + JS mòduls, sense dependències ni build) per agilitzar els cursos clínics als Hospitals de Dia.

## Executar
```bash
python3 -m http.server 8000
```
Obre http://localhost:8000

## Estructura
- `css/theme.css` — tokens de disseny (colors, tipografia). Canvia l'estètica aquí.
- `js/data/units.js` — llista d'Hospitals de Dia.
- `js/core/` — router per hash i helper DOM.
- `js/views/` — una vista per pantalla. Nova pantalla = nou fitxer + `route()` a `js/app.js`.
- `js/i18n/` — textos en català (`ca.js`) i castellà (`es.js`). **Tot text visible ha d'anar amb `t('clau')` i existir als dos fitxers.** L'idioma triat es recorda al navegador.
- `js/templates/` — plantilles de curs clínic per unitat (declaratives: modes → seccions → camps + `render`). Nova unitat = nou fitxer + registrar-lo a `templates/index.js`.
- `js/core/fields.js` — tipus de camp reutilitzables (hora, xips, constants, número, text, interruptor).
- Les dades del pacient només viuen en memòria: res es desa al disc.
