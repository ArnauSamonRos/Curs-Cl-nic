# Normes del projecte
- App bilingüe obligatòria: català (`js/i18n/ca.js`) i castellà (`js/i18n/es.js`). Cap text visible hardcodejat: sempre `t('clau')`, i cada clau nova als DOS fitxers.
- Sense dependències ni build. Estètica via tokens a `css/theme.css`.
- Tot curs clínic generat comença amb el nom de l'HD en majúscules (ho fa `js/views/editor.js`, no cal a cada plantilla).
- Publicació: Vercel desplega des de `main` (web estàtica, `vercel.json` sense build). Tot canvi s'ha de pujar també a `main`.
