// Vida útil de mezclas (post-preparación) y condiciones de almacenamiento estándar
// Fuente: referencias oncológicas ASHP, Trissel's, IMSS/SSA
// hours = BUD conservador (la condición de almacenamiento más corta documentada)
export const DRUG_STABILITY = {
  "Paclitaxel":      { hours: 27,  stability: "27 h a temperatura ambiente (15-25 °C)", storage: "Temperatura ambiente, proteger de luz" },
  "Docetaxel":       { hours: 4,   stability: "4 h a temperatura ambiente", storage: "Temperatura ambiente (2-25 °C), proteger de luz" },
  "Doxorrubicina":   { hours: 8,   stability: "24 h refrigerado (2-8 °C) o 8 h a temperatura ambiente", storage: "Refrigeración, proteger de luz" },
  "Ciclofosfamida":  { hours: 24,  stability: "24 h a temperatura ambiente o 6 días refrigerado", storage: "Temperatura ambiente o refrigeración" },
  "Fluorouracilo":   { hours: 72,  stability: "72 h a temperatura ambiente (15-30 °C)", storage: "Temperatura ambiente, proteger de luz" },
  "Oxaliplatino":    { hours: 6,   stability: "6 h a temperatura ambiente (no refrigerar)", storage: "Temperatura ambiente (NO refrigerar, precipita)" },
  "Irinotecan":      { hours: 24,  stability: "24 h a temperatura ambiente o 48 h refrigerado", storage: "Temperatura ambiente o refrigeración, proteger de luz" },
  "Carboplatino":    { hours: 8,   stability: "8 h a temperatura ambiente (15-25 °C)", storage: "Temperatura ambiente" },
  "Cisplatino":      { hours: 8,   stability: "8 h a temperatura ambiente (no refrigerar)", storage: "Temperatura ambiente (NO refrigerar)" },
  "Gemcitabina":     { hours: 24,  stability: "24 h a temperatura ambiente (15-30 °C)", storage: "Temperatura ambiente" },
  "Vinorelbina":     { hours: 24,  stability: "24 h a temperatura ambiente o 96 h refrigerado", storage: "Refrigeración o temperatura ambiente" },
  "Vincristina":     { hours: 24,  stability: "24 h a temperatura ambiente o 96 h refrigerado", storage: "Refrigeración, proteger de luz" },
  "Rituximab":       { hours: 12,  stability: "24 h refrigerado (2-8 °C) o 12 h a temperatura ambiente", storage: "Refrigeración (2-8 °C)" },
  "Trastuzumab":     { hours: 24,  stability: "24 h refrigerado (2-8 °C)", storage: "Refrigeración (2-8 °C)" },
  "Bevacizumab":     { hours: 8,   stability: "8 h refrigerado (2-8 °C)", storage: "Refrigeración (2-8 °C), proteger de luz" },
  "Cetuximab":       { hours: 12,  stability: "12 h a temperatura ambiente (25 °C)", storage: "Temperatura ambiente, proteger de luz" },
  "Etoposido":       { hours: 24,  stability: "24 h a temperatura ambiente a 0.4 mg/mL", storage: "Temperatura ambiente (15-30 °C)" },
  "Bleomicina":      { hours: 24,  stability: "24 h a temperatura ambiente", storage: "Temperatura ambiente" },
  "Metotrexato":     { hours: 24,  stability: "24 h a temperatura ambiente", storage: "Temperatura ambiente, proteger de luz" },
  "Citarabina":      { hours: 192, stability: "8 días a temperatura ambiente o 32 días refrigerado", storage: "Temperatura ambiente o refrigeración" },
  "Pemetrexed":      { hours: 24,  stability: "24 h a temperatura ambiente (15-30 °C)", storage: "Temperatura ambiente" },
  "Ifosfamida":      { hours: 24,  stability: "24 h a temperatura ambiente o 7 días refrigerado", storage: "Temperatura ambiente o refrigeración" },
};

export function getDrugStability(drugName) {
  if (!drugName) return null;
  const key = Object.keys(DRUG_STABILITY).find(k =>
    drugName.toLowerCase().includes(k.toLowerCase()) ||
    k.toLowerCase().includes(drugName.toLowerCase())
  );
  return key ? DRUG_STABILITY[key] : null;
}