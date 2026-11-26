# Curs Clínic

Generador de cursos clínics per als Hospitals de Dia: l'infermera marca opcions i el text del CC
es redacta sol, en català o castellà, llest per copiar (amb negretes) al programa clínic.

- **Sense dependències ni compilació**: HTML + CSS + mòduls JS. Es publica tal qual a Vercel (`main`).
- **Privacitat**: les dades del pacient només viuen en memòria; no es desa ni s'envia res.

## Executar i provar

```bash
npm start          # servidor local a http://localhost:8000
npm test           # tests (Node ≥ 20, sense instal·lar res)
npm run test:update  # regenera els textos de referència després d'un canvi intencionat
```

## Arquitectura

```
index.html            Punt d'entrada
css/                  theme.css (tokens de disseny) · layout.css · components.css
js/
  app.js              Arrencada: rutes, capçalera, idioma
  core/               Infraestructura genèrica (no sap res de cap HD)
    router.js           Router per hash
    dom.js              h(): crea elements (sense innerHTML → sense XSS)
    fields.js           Renderitzadors de camps (xips, hora, constants, text…)
    keynav.js           Navegació amb fletxes
    course.js           Motor pur: plantilla + estat → text del CC (capçalera de l'HD inclosa)
    text.js             Helpers purs de redacció (constants, llistes)
    schema.js           Validació de plantilles
    clipboard.js · translate.js · store.js · time.js
  domain/             Lògica clínica pura i testejable (p. ex. vaccinePlan.js)
  data/               Taules editables: unitats, tractaments, calendaris vacunals
  templates/          Una plantilla per HD (declarativa) + kit.js (helpers i frases comunes) + types.js (contracte)
  views/              Pantalles: home, unit, editor
  i18n/               ca.js · es.js (mateixes claus, ho comprova un test)
tests/                node:test — unitaris + textos de referència (__snapshots__) per plantilla/mode/idioma
```

**Flux**: `views/editor.js` pinta els camps de la plantilla (`core/fields.js`), guarda l'estat a memòria
(`core/store.js`) i a cada canvi crida `core/course.js`, que executa `render()` de la plantilla.

## Afegir o canviar un HD

1. Crea `js/templates/<hd>.js` seguint `types.js` (fes servir `kit.js` per opcions i frases comunes).
2. Registra-la a `js/templates/index.js`.
3. Afegeix casos a `tests/fixtures.js`, `npm run test:update` i revisa els textos generats.

Normes: tot text visible en català **i** castellà; el CC sempre comença amb el nom de l'HD.
