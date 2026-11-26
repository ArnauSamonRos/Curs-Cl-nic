# Normes del projecte
- App bilingüe obligatòria: català (`js/i18n/ca.js`) i castellà (`js/i18n/es.js`). Cap text visible hardcodejat: sempre `t('clau')`, i cada clau nova als DOS fitxers.
- Sense dependències ni build. Estètica via tokens a `css/theme.css`.
- Tot curs clínic generat comença amb el nom de l'HD en majúscules (ho fa `js/core/course.js`, no cal a cada plantilla).
- Publicació: Vercel desplega des de `main` (web estàtica, `vercel.json` sense build). Tot canvi s'ha de pujar també a `main`.
- Arquitectura: `core/` genèric, `domain/` lògica clínica pura, `data/` taules, `templates/` una per HD (usa `templates/kit.js`). Detall al README.
- Abans de pujar: `npm test` ha de passar. Si un canvi de text és intencionat: `npm run test:update` i revisar el diff de `tests/__snapshots__`.
