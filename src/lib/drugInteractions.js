/**
 * Base de datos de interacciones medicamentosas clínicamente relevantes
 * Enfocada en oncología IV, antibióticos IV y NPT
 * Severidad: "CONTRAINDICADA" | "GRAVE" | "MODERADA"
 */

export const DRUG_INTERACTIONS = [
  // ═══════════════════════════════════════════════════
  // CONTRAINDICADAS (No deben administrarse juntos)
  // ═══════════════════════════════════════════════════
  {
    drugs: ["Metotrexato", "Fluorouracilo"],
    severity: "CONTRAINDICADA",
    mechanism: "Antagonismo secuencial: el fluorouracilo puede reducir la eficacia del metotrexato si se administra antes.",
    recommendation: "Administrar metotrexato ANTES que fluorouracilo. Respetar el intervalo mínimo de 1 hora.",
    references: "NCCN Guidelines; Leucovorin rescue required"
  },
  {
    drugs: ["Cisplatino", "Aminoglucósidos"],
    severity: "CONTRAINDICADA",
    mechanism: "Nefrotoxicidad y ototoxicidad aditiva severa. Riesgo de falla renal aguda irreversible.",
    recommendation: "Contraindicada la coadministración. Si es imprescindible, monitorizar función renal y niveles séricos diariamente.",
    references: "FDA Drug Interaction Database"
  },
  {
    drugs: ["Vincristina", "Itraconazol"],
    severity: "CONTRAINDICADA",
    mechanism: "Itraconazol inhibe CYP3A4, aumentando dramáticamente los niveles de vincristina → neurotoxicidad severa.",
    recommendation: "Contraindicado. Sustituir antifúngico por fluconazol o anfotericina B.",
    references: "FDA Black Box Warning"
  },
  {
    drugs: ["Vincristina", "Voriconazol"],
    severity: "CONTRAINDICADA",
    mechanism: "Inhibición de CYP3A4 → acumulación de vincristina → neuropatía periférica severa e íleo paralítico.",
    recommendation: "Contraindicado. Evitar azoles potentes con alcaloides de la vinca.",
    references: "FDA Black Box Warning"
  },
  {
    drugs: ["Metotrexato", "Trimetoprima"],
    severity: "CONTRAINDICADA",
    mechanism: "Ambos inhiben la dihidrofolato reductasa → toxicidad hematológica y mucositis severa.",
    recommendation: "Contraindicada la coadministración. Si es necesario, monitorizar hemograma diariamente.",
    references: "Lexicomp Drug Interactions"
  },
  {
    drugs: ["Doxorrubicina", "Trastuzumab"],
    severity: "CONTRAINDICADA",
    mechanism: "Cardiotoxicidad sinérgica severa. Riesgo de insuficiencia cardíaca congestiva grave.",
    recommendation: "No administrar simultáneamente. El trastuzumab debe iniciarse al menos 24 semanas después de completar la antraciclina.",
    references: "NCCN Breast Cancer Guidelines"
  },

  // ═══════════════════════════════════════════════════
  // GRAVES (Requieren intervención o monitorización estrecha)
  // ═══════════════════════════════════════════════════
  {
    drugs: ["Cisplatino", "Vancomicina"],
    severity: "GRAVE",
    mechanism: "Nefrotoxicidad aditiva. Ambos son nefrotóxicos y pueden provocar insuficiencia renal aguda.",
    recommendation: "Monitorizar creatinina sérica y diuresis cada 8h. Asegurar hidratación adecuada. Considerar ajuste de dosis.",
    references: "Clinical Pharmacology Database"
  },
  {
    drugs: ["Cisplatino", "Anfotericina B"],
    severity: "GRAVE",
    mechanism: "Nefrotoxicidad aditiva severa. Riesgo elevado de insuficiencia renal aguda.",
    recommendation: "Monitorización renal intensiva. Hidratación agresiva. Evaluar alternativas antifúngicas.",
    references: "Micromedex"
  },
  {
    drugs: ["Metotrexato", "Omeprazol"],
    severity: "GRAVE",
    mechanism: "Omeprazol reduce la eliminación renal de metotrexato → niveles tóxicos prolongados.",
    recommendation: "Evitar IBP durante la semana de metotrexato. Usar antiácidos o bloqueadores H2 si es necesario.",
    references: "FDA Drug Safety Communication"
  },
  {
    drugs: ["Ciclofosfamida", "Alopurinol"],
    severity: "GRAVE",
    mechanism: "Alopurinol inhibe el metabolismo de ciclofosfamida → aumento de toxicidad hematológica.",
    recommendation: "Monitorizar hemograma con mayor frecuencia. Considerar reducción de dosis de ciclofosfamida.",
    references: "Lexicomp"
  },
  {
    drugs: ["Paclitaxel", "Cisplatino"],
    severity: "GRAVE",
    mechanism: "Administrar paclitaxel ANTES que cisplatino. El orden inverso aumenta la mielosupresión hasta un 33%.",
    recommendation: "Administrar siempre paclitaxel primero, luego cisplatino. Respetar el orden del protocolo.",
    references: "NCCN; SWOG Protocols"
  },
  {
    drugs: ["Doxorrubicina", "Ciclofosfamida"],
    severity: "GRAVE",
    mechanism: "Mielosupresión aditiva. Mayor riesgo de neutropenia febril.",
    recommendation: "Monitorizar hemograma. Considerar profilaxis con G-CSF según protocolo.",
    references: "ASCO Guidelines"
  },
  {
    drugs: ["Fluorouracilo", "Leucovorina"],
    severity: "MODERADA",
    mechanism: "La leucovorina potencia la toxicidad del fluorouracilo (mucositis, diarrea). Es una interacción terapéutica intencional pero requiere vigilancia.",
    recommendation: "Monitorizar toxicidad GI. Alertar al paciente sobre signos de toxicidad severa.",
    references: "NCCN CRC Guidelines"
  },
  {
    drugs: ["Gemcitabina", "Cisplatino"],
    severity: "GRAVE",
    mechanism: "Nefrotoxicidad aditiva. Gemcitabina puede potenciar la toxicidad renal del cisplatino.",
    recommendation: "Hidratación agresiva. Monitorizar función renal antes de cada ciclo.",
    references: "Clinical Pharmacology"
  },
  {
    drugs: ["Vincristina", "Asparaginasa"],
    severity: "GRAVE",
    mechanism: "La asparaginasa reduce el aclaramiento hepático de vincristina → neurotoxicidad aumentada.",
    recommendation: "Administrar vincristina 12-24h ANTES de la asparaginasa. Monitorizar toxicidad neurológica.",
    references: "COG Protocols; Pediatric ALL"
  },
  {
    drugs: ["Metotrexato", "AINEs"],
    severity: "GRAVE",
    mechanism: "Los AINEs reducen la eliminación renal de metotrexato → acumulación y toxicidad.",
    recommendation: "Suspender AINEs al menos 48h antes del metotrexato. Usar paracetamol como alternativa.",
    references: "FDA Drug Interaction"
  },
  {
    drugs: ["Carboplatino", "Aminoglucósidos"],
    severity: "GRAVE",
    mechanism: "Nefrotoxicidad y ototoxicidad aditiva.",
    recommendation: "Evitar combinación. Si es imprescindible, monitorizar función renal y auditiva.",
    references: "Micromedex"
  },
  {
    drugs: ["Vancomicina", "Piperacilina"],
    severity: "MODERADA",
    mechanism: "Estudios recientes sugieren aumento de nefrotoxicidad con la combinación Pip-Tazo + Vancomicina.",
    recommendation: "Monitorizar función renal cada 24-48h. Hidratación adecuada. Evaluar alternativa: cefepime + vancomicina.",
    references: "ASHP Clinical Practice; IDSA 2020"
  },
  {
    drugs: ["Vancomicina", "Piperacilina/Tazobactam"],
    severity: "MODERADA",
    mechanism: "Mayor incidencia de nefrotoxicidad aguda comparado con otras combinaciones betalactámicas.",
    recommendation: "Monitorizar creatinina cada 24h. Considerar cefepime como alternativa al pip-tazo.",
    references: "ASHP Clinical Practice Guidelines 2020"
  },
  {
    drugs: ["Amikacina", "Vancomicina"],
    severity: "GRAVE",
    mechanism: "Nefrotoxicidad sinérgica. Ambos son nefrotóxicos. Riesgo de IRA aumentado significativamente.",
    recommendation: "Monitorizar creatinina y diuresis horaria. Niveles valle de vancomicina y pico/valle de amikacina.",
    references: "IDSA; Micromedex"
  },
  {
    drugs: ["Gentamicina", "Vancomicina"],
    severity: "GRAVE",
    mechanism: "Nefrotoxicidad y ototoxicidad sinérgica.",
    recommendation: "Monitorizar niveles séricos de ambos fármacos. Hidratación adecuada.",
    references: "Lexicomp"
  },
  {
    drugs: ["Anfotericina B", "Vancomicina"],
    severity: "GRAVE",
    mechanism: "Nefrotoxicidad triple: cisplatino + anfotericina + vancomicina = riesgo muy elevado de IRA.",
    recommendation: "Monitorizar creatinina cada 6-12h. Hidratación agresiva. Preferir anfotericina liposomal.",
    references: "Micromedex; Clinical Pharmacology"
  },

  // ═══════════════════════════════════════════════════
  // MODERADAS (Vigilar y considerar ajuste)
  // ═══════════════════════════════════════════════════
  {
    drugs: ["Fluorouracilo", "Metotrexato"],
    severity: "MODERADA",
    mechanism: "Ver interacción bidireccional. El orden de administración es crítico para la eficacia.",
    recommendation: "Respetar el orden del protocolo. Metotrexato siempre antes que fluorouracilo.",
    references: "NCCN"
  },
  {
    drugs: ["Doxorrubicina", "Paclitaxel"],
    severity: "MODERADA",
    mechanism: "Paclitaxel puede aumentar los niveles de doxorrubicina y su metabolito cardiotóxico.",
    recommendation: "Administrar doxorrubicina antes que paclitaxel. Monitorizar función cardíaca.",
    references: "Clinical Pharmacology"
  },
  {
    drugs: ["Ciclofosfamida", "Warfarina"],
    severity: "MODERADA",
    mechanism: "Ciclofosfamida puede potenciar el efecto anticoagulante de warfarina.",
    recommendation: "Monitorizar INR más frecuentemente durante el ciclo.",
    references: "Lexicomp"
  },

  // NPT
  {
    drugs: ["Gluconato de Ca", "KH₂PO₄"],
    severity: "GRAVE",
    mechanism: "Incompatibilidad físico-química: precipitación de fosfato de calcio en la bolsa de NPT. Riesgo fatal si se administra.",
    recommendation: "Verificar concentraciones y pH de la mezcla. Calcular el producto Ca × P. Límite: <200 mEq/L × mmol/L.",
    references: "ASPEN NPT Guidelines 2016"
  }
];

/**
 * Normaliza nombres de fármacos para comparación flexible
 */
function normalizeDrug(name) {
  return (name || "")
    .toLowerCase()
    .replace(/\s+bolo$/i, "")
    .replace(/\s+infusi[oó]n$/i, "")
    .replace(/[áàä]/g, "a")
    .replace(/[éèë]/g, "e")
    .replace(/[íìï]/g, "i")
    .replace(/[óòö]/g, "o")
    .replace(/[úùü]/g, "u")
    .replace(/ñ/g, "n")
    .trim();
}

/**
 * Verifica si un nombre de fármaco coincide con una entrada de la base de datos
 * Soporta coincidencia parcial (ej: "Piperacilina/Tazobactam" matchea "Piperacilina")
 */
function drugMatches(drugName, interactionEntry) {
  const norm = normalizeDrug(drugName);
  const entry = normalizeDrug(interactionEntry);
  return norm === entry || norm.includes(entry) || entry.includes(norm);
}

/**
 * Detecta interacciones entre una lista de nombres de fármacos
 * @param {string[]} drugNames - Lista de nombres de medicamentos
 * @returns {Array} Lista de interacciones detectadas con detalles
 */
export function detectInteractions(drugNames) {
  if (!drugNames || drugNames.length < 2) return [];

  const interactions = [];

  for (const interaction of DRUG_INTERACTIONS) {
    const [drugA, drugB] = interaction.drugs;

    // Buscar coincidencias en ambas direcciones
    const matchA = drugNames.find(d => drugMatches(d, drugA));
    const matchB = drugNames.find(d => drugMatches(d, drugB));

    if (matchA && matchB && matchA !== matchB) {
      // Evitar duplicados
      const alreadyAdded = interactions.some(
        i => i.drugs[0] === drugA && i.drugs[1] === drugB
      );
      if (!alreadyAdded) {
        interactions.push({
          ...interaction,
          matchedDrugs: [matchA, matchB]
        });
      }
    }
  }

  // Ordenar por severidad: CONTRAINDICADA > GRAVE > MODERADA
  const severityOrder = { CONTRAINDICADA: 0, GRAVE: 1, MODERADA: 2 };
  return interactions.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

/**
 * Color y estilos por severidad
 */
export const SEVERITY_STYLES = {
  CONTRAINDICADA: {
    bg: "bg-red-100",
    border: "border-red-400",
    text: "text-red-800",
    badge: "bg-red-600 text-white",
    icon: "🚫",
    label: "CONTRAINDICADA"
  },
  GRAVE: {
    bg: "bg-orange-50",
    border: "border-orange-400",
    text: "text-orange-800",
    badge: "bg-orange-500 text-white",
    icon: "⚠️",
    label: "GRAVE"
  },
  MODERADA: {
    bg: "bg-yellow-50",
    border: "border-yellow-400",
    text: "text-yellow-800",
    badge: "bg-yellow-500 text-white",
    icon: "⚡",
    label: "MODERADA"
  }
};