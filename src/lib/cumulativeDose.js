import { CHEMO_PROTOCOLS } from "@/lib/chemoProtocols";

const normalize = (name) => (name || "").toString().trim().toLowerCase();

// Topes de dosis acumulada (por vida) que no vienen definidos en los protocolos
const EXTRA_LIMITS = [
  { drug_name: "Cisplatino", limit: 400, basis: "mg/m²", note: "Nefrotoxicidad y neuropatía acumuladas" },
  { drug_name: "Bleomicina", limit: 400, basis: "UI", note: "Riesgo de fibrosis pulmonar" },
  { drug_name: "Oxaliplatino", limit: 850, basis: "mg/m²", note: "Neuropatía periférica acumulada" },
  { drug_name: "Mitoxantrona", limit: 140, basis: "mg/m²", note: "Cardiotoxicidad acumulada" },
  { drug_name: "Idarrubicina", limit: 150, basis: "mg/m²", note: "Cardiotoxicidad acumulada" },
  { drug_name: "Daunorrubicina", limit: 550, basis: "mg/m²", note: "Cardiotoxicidad acumulada" },
];

export const LIFETIME_LIMITS = (() => {
  const map = {};
  Object.values(CHEMO_PROTOCOLS).forEach(protocol => {
    (protocol.drugs || []).forEach(drug => {
      if (!drug.max_lifetime_dose) return;
      const key = normalize(drug.drug_name);
      if (!map[key]) {
        map[key] = {
          drug_name: drug.drug_name,
          limit: drug.max_lifetime_dose,
          basis: drug.dose_basis || "mg/m²",
          note: "Tope de por vida según protocolo",
        };
      }
    });
  });
  EXTRA_LIMITS.forEach(item => {
    const key = normalize(item.drug_name);
    if (!map[key]) map[key] = item;
  });
  return map;
})();

export function getLifetimeLimit(drugName) {
  return LIFETIME_LIMITS[normalize(drugName)] || null;
}

const doseOf = (drug) => Number(drug.calculated_dose ?? drug.prescribed_dose ?? 0) || 0;

export function computeCumulativeDoses(prescriptions = [], extraDoses = []) {
  const map = {};

  const add = (drug, bsa) => {
    const key = normalize(drug.drug_name);
    const value = doseOf(drug);
    if (!key || !value) return;
    if (!map[key]) map[key] = { drug_name: drug.drug_name, total: 0, per_m2: 0, doses: 0 };
    map[key].total += value;
    map[key].doses += 1;
    const surface = Number(bsa) || 0;
    if (surface > 0) map[key].per_m2 += value / surface;
  };

  prescriptions.forEach(rx => {
    if (rx.validation_status === "Rechazada") return;
    (rx.drugs || []).forEach(drug => add(drug, rx.patient_bsa));
  });
  extraDoses.forEach(drug => add(drug, drug.bsa));

  return Object.values(map);
}

export function cumulativeReport(prescriptions = [], extraDoses = []) {
  return computeCumulativeDoses(prescriptions, extraDoses)
    .map(row => {
      const limit = getLifetimeLimit(row.drug_name);
      if (!limit) return null;
      const usesSurface = limit.basis.includes("m²");
      const accumulated = usesSurface ? row.per_m2 : row.total;
      const percent = limit.limit > 0 ? (accumulated / limit.limit) * 100 : 0;
      return {
        drug_name: row.drug_name,
        doses: row.doses,
        accumulated: Math.round(accumulated * 100) / 100,
        limit: limit.limit,
        basis: limit.basis,
        note: limit.note,
        percent: Math.round(percent),
        status: percent >= 100 ? "exceeded" : percent >= 80 ? "warning" : "ok",
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.percent - a.percent);
}