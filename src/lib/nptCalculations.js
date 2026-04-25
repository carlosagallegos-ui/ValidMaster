// Cálculos para Nutrición Parenteral Total (NPT)

// Valor calórico de macronutrientes
const KCAL_PER_G_GLUCOSE = 3.4;      // glucosa hidratada
const KCAL_PER_G_AMINOACIDS = 4.0;   // proteínas
const KCAL_PER_G_LIPIDS = 9.0;       // lípidos

// Densidades
const GLUCOSE_DENSITY = 1.0;   // g/mL ~1:1 para soluciones acuosas (simplificado)
const AMINOACID_DENSITY = 1.0;
const LIPID_DENSITY = 1.0;

/**
 * Calcular contenido en gramos de glucosa según concentración y volumen
 * @param {number} percent - Concentración en % (ej: 20 para glucosa al 20%)
 * @param {number} volume_ml - Volumen en mL
 * @returns {number} gramos
 */
export function glucoseGrams(percent, volume_ml) {
  return (percent / 100) * volume_ml;
}

export function aminoacidGrams(percent, volume_ml) {
  return (percent / 100) * volume_ml;
}

export function lipidGrams(percent, volume_ml) {
  return (percent / 100) * volume_ml;
}

/**
 * Calcular totales de NPT
 */
export function calculateNPT({ glucose_percent, glucose_ml, aminoacids_percent, aminoacids_ml, lipids_percent, lipids_ml, infusion_hours, weight_kg }) {
  const gGlucose = glucoseGrams(glucose_percent || 0, glucose_ml || 0);
  const gAmino = aminoacidGrams(aminoacids_percent || 0, aminoacids_ml || 0);
  const gLipid = lipidGrams(lipids_percent || 0, lipids_ml || 0);

  const kcalGlucose = gGlucose * KCAL_PER_G_GLUCOSE;
  const kcalAmino = gAmino * KCAL_PER_G_AMINOACIDS;
  const kcalLipid = gLipid * KCAL_PER_G_LIPIDS;
  const kcalTotal = kcalGlucose + kcalAmino + kcalLipid;

  // Osmolaridad aproximada (mOsm/L)
  // Glucosa: 5.5 mOsm/g, Aminoácidos: ~8 mOsm/g, Lípidos: isosmolares (~280-310)
  const osmolarityGlucose = gGlucose * 5.5;
  const osmolarityAmino = gAmino * 8;
  const totalVolume = (glucose_ml || 0) + (aminoacids_ml || 0) + (lipids_ml || 0);
  const baseOsm = totalVolume > 0 ? ((osmolarityGlucose + osmolarityAmino) / (totalVolume / 1000)) : 0;

  const infusionRate = (infusion_hours && totalVolume) ? Math.round((totalVolume / infusion_hours) * 10) / 10 : 0;
  const kcalKg = (weight_kg && kcalTotal) ? Math.round((kcalTotal / weight_kg) * 10) / 10 : 0;
  const proteinGKg = (weight_kg && gAmino) ? Math.round((gAmino / weight_kg) * 100) / 100 : 0;

  return {
    total_volume_ml: Math.round(totalVolume),
    kcal_total: Math.round(kcalTotal),
    kcal_kg: kcalKg,
    protein_g: Math.round(gAmino * 10) / 10,
    protein_g_kg: proteinGKg,
    glucose_g: Math.round(gGlucose * 10) / 10,
    lipid_g: Math.round(gLipid * 10) / 10,
    infusion_rate_ml_h: infusionRate,
    osmolarity_mosm_l: Math.round(baseOsm),
    route: baseOsm > 900 ? "Central" : "Periférica o Central"
  };
}

export function validateNPT(results, weight_kg) {
  const alerts = [];
  if (!results || !weight_kg) return alerts;

  if (results.kcal_kg < 20) alerts.push("⚠️ Aporte calórico bajo (<20 kcal/kg/día). Considerar aumentar glucosa o lípidos.");
  if (results.kcal_kg > 35) alerts.push("⚠️ Aporte calórico elevado (>35 kcal/kg/día). Riesgo de sobrealimentación.");
  if (results.protein_g_kg < 1.0) alerts.push("⚠️ Aporte proteico bajo (<1 g/kg/día). Considerar aumentar aminoácidos.");
  if (results.protein_g_kg > 2.5) alerts.push("⚠️ Aporte proteico elevado (>2.5 g/kg/día). Valorar función renal.");
  if (results.osmolarity_mosm_l > 900) alerts.push("🔴 Osmolaridad >900 mOsm/L: REQUIERE acceso venoso central.");
  if (results.osmolarity_mosm_l > 600 && results.osmolarity_mosm_l <= 900) alerts.push("⚠️ Osmolaridad entre 600-900 mOsm/L: Se recomienda vía central.");
  if (results.infusion_rate_ml_h > 150) alerts.push("⚠️ Velocidad de infusión elevada (>150 mL/h). Verificar tolerancia.");

  return alerts;
}

// Soluciones madre estándar disponibles
export const NPT_SOLUTIONS = {
  glucose: [
    { label: "Glucosa 10%", percent: 10 },
    { label: "Glucosa 20%", percent: 20 },
    { label: "Glucosa 30%", percent: 30 },
    { label: "Glucosa 50%", percent: 50 },
    { label: "Glucosa 70%", percent: 70 }
  ],
  aminoacids: [
    { label: "Aminoácidos 10%", percent: 10 },
    { label: "Aminoácidos 15%", percent: 15 },
    { label: "Aminoácidos 20%", percent: 20 }
  ],
  lipids: [
    { label: "Lípidos 10%", percent: 10 },
    { label: "Lípidos 20%", percent: 20 },
    { label: "Sin lípidos", percent: 0 }
  ]
};