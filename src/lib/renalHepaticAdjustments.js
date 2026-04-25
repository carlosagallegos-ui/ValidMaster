/**
 * Ajustes de dosis por función renal (TFG/CrCl) y función hepática (Bilirrubina)
 * Basado en: NCCN Guidelines, Lexicomp, Micromedex, Aronoff et al. "Drug Prescribing in Renal Failure"
 */

// ─── AJUSTES POR FUNCIÓN RENAL (TFG / CrCl en mL/min) ───────────────────────
export const RENAL_ADJUSTMENTS = {
  "Cisplatino": [
    { condition: (crcl) => crcl >= 60, label: "Normal (≥60 mL/min)", adjustment: 1.0, severity: "ok", recommendation: "Dosis estándar. Hidratación pre/post obligatoria." },
    { condition: (crcl) => crcl >= 45 && crcl < 60, label: "Leve (45-59 mL/min)", adjustment: 0.75, severity: "moderate", recommendation: "Reducir dosis al 75%. Hidratación agresiva. Monitorizar creatinina cada ciclo." },
    { condition: (crcl) => crcl >= 30 && crcl < 45, label: "Moderada (30-44 mL/min)", adjustment: 0.5, severity: "severe", recommendation: "Reducir al 50% o considerar cambiar a Carboplatino. Nefrotóxico severo en este rango." },
    { condition: (crcl) => crcl < 30, label: "Severa (<30 mL/min)", adjustment: null, severity: "contraindicated", recommendation: "CONTRAINDICADO. Sustituir por Carboplatino (dosis por Calvert usando TFG real)." }
  ],
  "Carboplatino": [
    { condition: (crcl) => crcl >= 60, label: "Normal (≥60 mL/min)", adjustment: 1.0, severity: "ok", recommendation: "Dosis estándar usando fórmula Calvert: AUC × (CrCl + 25)." },
    { condition: (crcl) => crcl >= 45 && crcl < 60, label: "Leve-Moderada (45-59 mL/min)", adjustment: "calvert", severity: "moderate", recommendation: "La fórmula de Calvert ya ajusta automáticamente la dosis según CrCl. Verificar el resultado." },
    { condition: (crcl) => crcl >= 16 && crcl < 45, label: "Moderada-Severa (16-44 mL/min)", adjustment: "calvert", severity: "severe", recommendation: "Usar Calvert estrictamente. Monitorizar hemograma — mielosupresión aumentada. Reducir AUC objetivo a 4-5." },
    { condition: (crcl) => crcl < 16, label: "Severa (<16 mL/min)", adjustment: null, severity: "contraindicated", recommendation: "Uso con extrema precaución. Consultar especialista. Riesgo de toxicidad hematológica grave." }
  ],
  "Metotrexato": [
    { condition: (crcl) => crcl >= 60, label: "Normal (≥60 mL/min)", adjustment: 1.0, severity: "ok", recommendation: "Dosis estándar." },
    { condition: (crcl) => crcl >= 45 && crcl < 60, label: "Leve (45-59 mL/min)", adjustment: 0.65, severity: "moderate", recommendation: "Reducir al 65% de la dosis estándar." },
    { condition: (crcl) => crcl >= 31 && crcl < 45, label: "Moderada (31-44 mL/min)", adjustment: 0.5, severity: "severe", recommendation: "Reducir al 50%. Monitorizar niveles séricos de metotrexato. Rescue con Leucovorin." },
    { condition: (crcl) => crcl < 31, label: "Severa (<31 mL/min)", adjustment: null, severity: "contraindicated", recommendation: "CONTRAINDICADO en dosis altas. Usar con extrema precaución en dosis bajas bajo vigilancia estrecha." }
  ],
  "Pemetrexed": [
    { condition: (crcl) => crcl >= 45, label: "Normal-Leve (≥45 mL/min)", adjustment: 1.0, severity: "ok", recommendation: "Dosis estándar. Suplementar con ácido fólico y vitamina B12." },
    { condition: (crcl) => crcl < 45, label: "Moderada-Severa (<45 mL/min)", adjustment: null, severity: "contraindicated", recommendation: "CONTRAINDICADO. Riesgo de toxicidad grave por acumulación." }
  ],
  "Bleomicina": [
    { condition: (crcl) => crcl >= 50, label: "Normal (≥50 mL/min)", adjustment: 1.0, severity: "ok", recommendation: "Dosis estándar." },
    { condition: (crcl) => crcl >= 40 && crcl < 50, label: "Leve (40-49 mL/min)", adjustment: 0.7, severity: "moderate", recommendation: "Reducir al 70%." },
    { condition: (crcl) => crcl >= 30 && crcl < 40, label: "Moderada (30-39 mL/min)", adjustment: 0.6, severity: "severe", recommendation: "Reducir al 60%. Monitorizar función pulmonar." },
    { condition: (crcl) => crcl < 30, label: "Severa (<30 mL/min)", adjustment: 0.5, severity: "severe", recommendation: "Reducir al 50%. Riesgo de toxicidad pulmonar aumentado." }
  ],
  "Etóposido": [
    { condition: (crcl) => crcl >= 50, label: "Normal (≥50 mL/min)", adjustment: 1.0, severity: "ok", recommendation: "Dosis estándar." },
    { condition: (crcl) => crcl >= 15 && crcl < 50, label: "Moderada (15-49 mL/min)", adjustment: 0.75, severity: "moderate", recommendation: "Reducir al 75%." },
    { condition: (crcl) => crcl < 15, label: "Severa (<15 mL/min)", adjustment: 0.5, severity: "severe", recommendation: "Reducir al 50%. Datos limitados — monitorización estrecha." }
  ],
  "Gemcitabina": [
    { condition: (crcl) => crcl >= 30, label: "Normal-Moderada (≥30 mL/min)", adjustment: 1.0, severity: "ok", recommendation: "Dosis estándar. Datos limitados en insuficiencia renal severa." },
    { condition: (crcl) => crcl < 30, label: "Severa (<30 mL/min)", adjustment: 0.75, severity: "severe", recommendation: "Reducir al 75% con precaución. Monitorizar toxicidad hematológica." }
  ]
};

// ─── AJUSTES POR FUNCIÓN HEPÁTICA (Bilirrubina en mg/dL) ─────────────────────
export const HEPATIC_ADJUSTMENTS = {
  "Doxorrubicina": [
    { condition: (bili) => bili < 1.2, label: "Normal (<1.2 mg/dL)", adjustment: 1.0, severity: "ok", recommendation: "Dosis estándar." },
    { condition: (bili) => bili >= 1.2 && bili <= 3.0, label: "Leve-Moderada (1.2-3.0 mg/dL)", adjustment: 0.5, severity: "moderate", recommendation: "Reducir al 50% de la dosis estándar." },
    { condition: (bili) => bili > 3.0 && bili <= 5.0, label: "Moderada-Severa (3.1-5.0 mg/dL)", adjustment: 0.25, severity: "severe", recommendation: "Reducir al 25%. Uso con extrema precaución." },
    { condition: (bili) => bili > 5.0, label: "Severa (>5.0 mg/dL)", adjustment: null, severity: "contraindicated", recommendation: "CONTRAINDICADO. La hepatotoxicidad severa contraindica el uso de antraciclinas." }
  ],
  "Docetaxel": [
    { condition: (bili) => bili < 1.5, label: "Normal (<1.5 mg/dL)", adjustment: 1.0, severity: "ok", recommendation: "Dosis estándar." },
    { condition: (bili) => bili >= 1.5 && bili <= 3.0, label: "Moderada (1.5-3.0 mg/dL)", adjustment: 0.75, severity: "moderate", recommendation: "Reducir al 75%. Monitorizar toxicidad hepática." },
    { condition: (bili) => bili > 3.0, label: "Severa (>3.0 mg/dL)", adjustment: null, severity: "contraindicated", recommendation: "CONTRAINDICADO. Uso no recomendado con bilirrubina >3.0 mg/dL." }
  ],
  "Paclitaxel": [
    { condition: (bili) => bili < 1.5, label: "Normal (<1.5 mg/dL)", adjustment: 1.0, severity: "ok", recommendation: "Dosis estándar." },
    { condition: (bili) => bili >= 1.5 && bili <= 3.0, label: "Moderada (1.5-3.0 mg/dL)", adjustment: 0.75, severity: "moderate", recommendation: "Reducir al 75%." },
    { condition: (bili) => bili > 3.0 && bili <= 5.0, label: "Severa (3.1-5.0 mg/dL)", adjustment: 0.5, severity: "severe", recommendation: "Reducir al 50%. Monitorización estrecha de toxicidad." },
    { condition: (bili) => bili > 5.0, label: "Muy severa (>5.0 mg/dL)", adjustment: null, severity: "contraindicated", recommendation: "CONTRAINDICADO." }
  ],
  "Vincristina": [
    { condition: (bili) => bili < 3.0, label: "Normal-Leve (<3.0 mg/dL)", adjustment: 1.0, severity: "ok", recommendation: "Dosis estándar." },
    { condition: (bili) => bili >= 3.0, label: "Moderada-Severa (≥3.0 mg/dL)", adjustment: 0.5, severity: "severe", recommendation: "Reducir al 50%. Riesgo aumentado de neurotoxicidad." }
  ],
  "Irinotecán": [
    { condition: (bili) => bili < 1.0, label: "Normal (<1.0 mg/dL)", adjustment: 1.0, severity: "ok", recommendation: "Dosis estándar." },
    { condition: (bili) => bili >= 1.0 && bili <= 2.0, label: "Leve (1.0-2.0 mg/dL)", adjustment: 0.75, severity: "moderate", recommendation: "Reducir al 75%. Monitorizar diarrea y supresión medular." },
    { condition: (bili) => bili > 2.0, label: "Moderada-Severa (>2.0 mg/dL)", adjustment: null, severity: "contraindicated", recommendation: "CONTRAINDICADO. Acumulación del metabolito SN-38 → toxicidad severa." }
  ],
  "5-Fluorouracilo": [
    { condition: (bili) => bili < 5.0, label: "Normal-Moderada (<5.0 mg/dL)", adjustment: 1.0, severity: "ok", recommendation: "Dosis estándar." },
    { condition: (bili) => bili >= 5.0, label: "Severa (≥5.0 mg/dL)", adjustment: null, severity: "contraindicated", recommendation: "CONTRAINDICADO. Hepatotoxicidad severa." }
  ],
  "Metotrexato": [
    { condition: (bili) => bili < 2.0, label: "Normal (<2.0 mg/dL)", adjustment: 1.0, severity: "ok", recommendation: "Dosis estándar." },
    { condition: (bili) => bili >= 2.0 && bili <= 3.0, label: "Moderada (2.0-3.0 mg/dL)", adjustment: 0.75, severity: "moderate", recommendation: "Reducir al 75%." },
    { condition: (bili) => bili > 3.0, label: "Severa (>3.0 mg/dL)", adjustment: null, severity: "contraindicated", recommendation: "Uso con extrema precaución. Considerar contraindicación." }
  ],
  "Oxaliplatino": [
    { condition: (bili) => bili < 3.0, label: "Normal-Moderada (<3.0 mg/dL)", adjustment: 1.0, severity: "ok", recommendation: "No requiere ajuste por función hepática." },
    { condition: (bili) => bili >= 3.0, label: "Severa (≥3.0 mg/dL)", adjustment: 0.75, severity: "severe", recommendation: "Reducir al 75% con precaución. Datos limitados." }
  ]
};

// Aliases para matching flexible de nombres
const DRUG_ALIASES = {
  "5-Fluorouracilo bolo": "5-Fluorouracilo",
  "5-Fluorouracilo infusión": "5-Fluorouracilo",
  "5-FU": "5-Fluorouracilo",
  "Fluorouracilo": "5-Fluorouracilo",
  "Doxo": "Doxorrubicina",
  "Adria": "Doxorrubicina",
  "Taxol": "Paclitaxel",
  "Taxotere": "Docetaxel",
  "Platinol": "Cisplatino",
  "Platino": "Cisplatino",
  "Carbo": "Carboplatino",
  "Irinotecan": "Irinotecán",
  "Etoposido": "Etóposido",
  "Gemcitabine": "Gemcitabina",
  "MTX": "Metotrexato",
};

function resolveDrugName(name) {
  if (!name) return name;
  const normalized = (name || "").trim();
  return DRUG_ALIASES[normalized] || normalized;
}

/**
 * Obtiene el ajuste renal para un fármaco dado un CrCl
 */
export function getRenalAdjustment(drugName, crcl) {
  if (!crcl || crcl <= 0) return null;
  const resolved = resolveDrugName(drugName);
  const rules = RENAL_ADJUSTMENTS[resolved];
  if (!rules) return null;
  return rules.find(r => r.condition(crcl)) || null;
}

/**
 * Obtiene el ajuste hepático para un fármaco dada la bilirrubina total
 */
export function getHepaticAdjustment(drugName, bilirubin) {
  if (!bilirubin || bilirubin <= 0) return null;
  const resolved = resolveDrugName(drugName);
  const rules = HEPATIC_ADJUSTMENTS[resolved];
  if (!rules) return null;
  return rules.find(r => r.condition(bilirubin)) || null;
}

/**
 * Genera todas las recomendaciones de ajuste para una lista de fármacos
 * @returns Array de { drugName, type, adjustment, severity, recommendation, label, adjustedDose }
 */
export function getDoseAdjustmentRecommendations(drugs, crcl, bilirubin) {
  const recommendations = [];

  drugs.forEach(drug => {
    const renalAdj = getRenalAdjustment(drug.drug_name, crcl);
    const hepaticAdj = getHepaticAdjustment(drug.drug_name, bilirubin);

    if (renalAdj && renalAdj.severity !== "ok") {
      recommendations.push({
        drugName: drug.drug_name,
        type: "renal",
        label: renalAdj.label,
        severity: renalAdj.severity,
        adjustment: renalAdj.adjustment,
        recommendation: renalAdj.recommendation,
        originalDose: drug.calculated_dose || drug.prescribed_dose,
        adjustedDose: renalAdj.adjustment && typeof renalAdj.adjustment === "number"
          ? Math.round((drug.calculated_dose || drug.prescribed_dose) * renalAdj.adjustment * 100) / 100
          : null,
        doseUnit: drug.dose_unit
      });
    }

    if (hepaticAdj && hepaticAdj.severity !== "ok") {
      recommendations.push({
        drugName: drug.drug_name,
        type: "hepatic",
        label: hepaticAdj.label,
        severity: hepaticAdj.severity,
        adjustment: hepaticAdj.adjustment,
        recommendation: hepaticAdj.recommendation,
        originalDose: drug.calculated_dose || drug.prescribed_dose,
        adjustedDose: hepaticAdj.adjustment && typeof hepaticAdj.adjustment === "number"
          ? Math.round((drug.calculated_dose || drug.prescribed_dose) * hepaticAdj.adjustment * 100) / 100
          : null,
        doseUnit: drug.dose_unit
      });
    }
  });

  // Ordenar: contraindicated > severe > moderate
  const order = { contraindicated: 0, severe: 1, moderate: 2 };
  return recommendations.sort((a, b) => (order[a.severity] || 3) - (order[b.severity] || 3));
}

export const SEVERITY_CONFIG = {
  contraindicated: { bg: "bg-red-100", border: "border-red-500", text: "text-red-900", badge: "bg-red-600 text-white", icon: "🚫", label: "CONTRAINDICADO" },
  severe: { bg: "bg-orange-50", border: "border-orange-400", text: "text-orange-900", badge: "bg-orange-500 text-white", icon: "⚠️", label: "AJUSTE SEVERO" },
  moderate: { bg: "bg-yellow-50", border: "border-yellow-400", text: "text-yellow-900", badge: "bg-yellow-400 text-yellow-900", icon: "⚡", label: "AJUSTE MODERADO" },
};