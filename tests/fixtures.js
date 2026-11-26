// Casos representatius per plantilla i mode. Les hores es fixen perquè els tests no depenguin del rellotge.
export const FIXED = { time: '09:00' };

export const CASES = {
  respiratori: {
    general: {
      ple: { sex: 'd', reasons: ['dispnea', 'tos'], v0: { tas: '130', tad: '80', fc: '92', fr: '18', sat: '94', temp: '37,2', o2: 'un', o2v: '2' },
        interventions: ['analitica', 'rx', 'gaso', 'inhal'], gasoO2: 'aire', inhaler: ['Ellipta'], dischargeTime: '10:30', followup: 'hdr', unplanned: true,
        pfPre: '240', pfPost: '280', neb: ['vent', 'sf'], urbason: '40' },
    },
    ingres: { ple: { sex: 'h', reasons: ['febre'], admitReason: 'pneumònia', v1: { tas: '110', tad: '60', o2: 'aire' }, transfer: 'sala', ward: '7B', transferTime: '13:00' } },
    noacut: { ingressat: { sex: 'd', reason: 'ingres' }, tractament: { reason: 'tto', treatment: 'omalizumab' } },
  },
  'polivalent-1': {
    tto: { ple: { sex: 'd', tto: 'vedolizumab', dose: '300 mg', company: 'si', site: 'be', premedOn: true, premed: ['para'], premedOther: 'Ondansetró 4 mg EV',
      start: '09:10', durMin: '30', incidents: 'si', incidentText: 'pruïja', finalOn: true, v1: { tas: '120', tad: '70', o2: 'aire' }, dischargeTime: '10:00' } },
    proc: {
      complet: { proc: 'colonoscopia', phase: 'all', sex: 'h', company: 'si', side: 'ese', outTime: '09:30', backTime: '11:30', seenByDoctor: true, post: ['oral'], leave: 'peu', dischargeTime: '12:00' },
      abans: { proc: 'pl', phase: 'pre' },
      despres: { proc: 'pl', phase: 'post', backTime: '12:00' },
    },
    noacut: { ple: { tto: 'rituximab' } },
  },
  endocrino: {
    edu: { ple: { visit: 'imp', medText: 'Hombre de 70a con DM 2.\nAcompañado de la hija.', tto: 'Basaglar 0-0-15 UI\n- Metformina 0,5-0-0', gDyo: '122-109', gCda: '86-106',
      mEsm: 'Torrada', foodEdu: ['tres', 'plat'], self: 'ok', insMode: 'val', insCheck: ['cons', 'agu', 'plec', 'temps'], insExtra: ['abd', 'full'],
      hypo: ['coneix', 'porta'], material: ['gluco', 'glucago'], planMed: '12/6/2026', plan: ['telef'], planChange: 'Abasaglar a 0-0-21' } },
    aguda: { ple: { glic: '346', ceto: '1,8', acts: ['med', 'as', 'vvp', 'insul'], side: 'ese', insDose: '8 UI Fiasp', timeline: '17:30 Glucèmia 408', outcome: 'alta', endTime: '20:13' } },
    ev: { ple: { evDrug: 'Tocilizumab 760 mg', side: 'ese', evStart: '08:40', evDischarge: '09:45' } },
    noacut: { ple: { noShowNote: 'malaltia' } },
  },
  vacunacio: {
    vac: { tph_dia1: { program: 'tph', vaccines: ['pn21', 'hexa', 'vhz', 'vha', 'acwy', 'menb'], month: 0, given: ['pn21:0', 'hexa:0', 'vhz:0', 'vha:0'], age: '71', context: 'Post TASPE: 21/11/24' },
      reuma_parcial: { program: 'reuma', vaccines: ['hib', 'acwy', 'pn21', 'vha', 'vhb', 'vph', 'vhz'], month: 0, given: ['hib:0', 'pn21:0'], addNext: ['menb'], fullPlan: true } },
    noacut: { ple: {} },
  },
  geriatria: {
    val: { ple: { sex: 'd', company: 'fill', weight: '61', height: '161', barthel: '100', lawton: '3', mna: '14', pfeiffer: '1', mmse: '22', yesavage: '7',
      lives: 'sol', depend: '1', disab: 'si', disabPct: '65', support: ['tele', 'sad'], acts: ['as'] } },
    noacut: { ple: {} },
  },
};
