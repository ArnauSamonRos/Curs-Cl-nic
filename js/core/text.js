// Helpers purs de redacció (sense DOM), compartits per totes les plantilles.

// Format de constants per al text final. T(ca, es) tria idioma.
export function formatVitals(v = {}, T) {
  const parts = [];
  if (v.tas || v.tad) parts.push(`TA: ${v.tas || '-'}/${v.tad || '-'} mmHg`);
  if (v.fc) parts.push(`FC: ${v.fc} x'`);
  if (v.fr) parts.push(`FR: ${v.fr} x'`);
  if (v.sat) {
    const o2 = v.o2 === 'un' ? T(`amb ulleres nasals a ${v.o2v || '-'} L/min`, `con gafas nasales a ${v.o2v || '-'} L/min`)
      : v.o2 === 'vmk' ? T(`amb Ventimask al ${v.o2v || '-'}%`, `con Ventimask al ${v.o2v || '-'}%`)
      : T("a l'aire", 'basal');
    parts.push(`SatO2: ${v.sat}% ${o2}`);
  }
  if (v.temp) parts.push(`Tª: ${v.temp} ºC`);
  return parts.join('   ');
}

// Uneix una llista en llenguatge natural: "a, b i c" / "a, b y c".
export function joinList(items, T) {
  if (items.length <= 1) return items.join('');
  return items.slice(0, -1).join(', ') + T(' i ', ' y ') + items.at(-1);
}
