// Áreas físicas fijas del Centro de Mezclas Estériles
export const AREAS_CENTRO = [
  { value: "ALMACÉN GENERAL", label: "Almacén general", hint: "Temperatura ambiente controlada" },
  { value: "REFRIGERACIÓN", label: "Refrigeración", hint: "2 – 8 °C" },
  { value: "CONGELACIÓN", label: "Congelación", hint: "≤ -20 °C" },
  { value: "ÁREA DE PREPARACIÓN", label: "Área de preparación", hint: "Cámara de flujo laminar / bioseguridad" },
  { value: "CUARENTENA", label: "Cuarentena", hint: "Lotes en resguardo o no liberados" },
];

export const AREA_VALUES = AREAS_CENTRO.map(a => a.value);

export function areaLabel(value) {
  return AREAS_CENTRO.find(a => a.value === value)?.label || value;
}

// Clasifica el lote: estado y condiciones de almacenamiento mandan,
// salvo que el lote tenga un área asignada explícitamente.
export function clasificarArea(med) {
  if (!med) return "ALMACÉN GENERAL";
  if (med.status === "Cuarentena") return "CUARENTENA";

  const explicita = (med.area || "").trim().toUpperCase();
  if (AREA_VALUES.includes(explicita)) return explicita;

  const s = (med.storage_conditions || "").toUpperCase();
  if (/CONGEL|FREEZER|-20|ULTRA ?CONGEL/.test(s)) return "CONGELACIÓN";
  if (/REFRIG|2\s*-\s*8|2\s*A\s*8|8\s*°?C/.test(s)) return "REFRIGERACIÓN";
  if (/CUARENT/.test(s)) return "CUARENTENA";
  if (/PREPARA|FLUJO|LAMINAR|BIO/.test(s)) return "ÁREA DE PREPARACIÓN";
  return "ALMACÉN GENERAL";
}