import { CHEMO_PROTOCOLS } from "@/lib/chemoProtocols";

export const PROTOCOL_VIAL_MAP = (() => {
  const map = {};
  Object.values(CHEMO_PROTOCOLS).forEach(proto => {
    proto.drugs.forEach(d => {
      const key = d.drug_name.toLowerCase();
      if (!map[key]) map[key] = d;
    });
  });
  return map;
})();

export function getVialInfo(drugName, medications) {
  const nameLower = (drugName || "").toLowerCase();
  const invMatch = medications.find(m =>
    m.drug_name?.toLowerCase() === nameLower ||
    nameLower.includes(m.drug_name?.toLowerCase()) ||
    m.drug_name?.toLowerCase().includes(nameLower)
  );
  if (invMatch && invMatch.concentration && invMatch.vial_volume_ml) {
    const vialSize = invMatch.concentration_unit === "mg/mL"
      ? invMatch.concentration * invMatch.vial_volume_ml
      : invMatch.concentration;
    return {
      vial_size: vialSize,
      vial_unit: invMatch.concentration_unit === "mg/mL" ? "mg" : invMatch.concentration_unit,
      source: "inventario",
    };
  }
  const protoMatch = PROTOCOL_VIAL_MAP[nameLower];
  if (protoMatch?.vial_size) {
    return { vial_size: protoMatch.vial_size, vial_unit: protoMatch.vial_unit || "mg", source: "protocolo" };
  }
  return { vial_size: null, vial_unit: null, source: null };
}

export function calcVials(drugs, medications) {
  const grouped = {};
  (drugs || []).forEach(d => {
    const key = d.drug_name;
    if (!grouped[key]) grouped[key] = { ...d, total_prescribed: 0 };
    grouped[key].total_prescribed += d.prescribed_dose || 0;
  });
  return Object.values(grouped).map(drug => {
    const unit = drug.dose_unit || "mg";
    const vialInfo = getVialInfo(drug.drug_name, medications);
    const vialSize = vialInfo.vial_size;
    const vialUnit = vialInfo.vial_unit || unit;
    const frascos = vialSize ? Math.ceil(drug.total_prescribed / vialSize) : null;
    return { ...drug, unit, vial_size: vialSize, vial_unit: vialUnit, vial_source: vialInfo.source, frascos };
  });
}

/** Frascos necesarios para una sola mezcla (sin agrupar) */
export function vialsForDrug(drug, medications) {
  if (!drug) return null;
  const vialInfo = getVialInfo(drug.drug_name, medications);
  if (!vialInfo.vial_size) return null;
  const dose = drug.prescribed_dose || 0;
  return {
    frascos: Math.ceil(dose / vialInfo.vial_size),
    vial_size: vialInfo.vial_size,
    vial_unit: vialInfo.vial_unit,
  };
}