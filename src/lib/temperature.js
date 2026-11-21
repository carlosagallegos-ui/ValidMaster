// Áreas con control de temperatura y su rango permitido (°C)
export const TEMPERATURE_AREAS = [
  { area: "REFRIGERACIÓN", label: "Refrigeración", min: 2, max: 8 },
  { area: "CONGELACIÓN", label: "Congelación", min: -30, max: -15 },
];

export const TEMPERATURE_SHIFTS = ["Matutino", "Vespertino", "Nocturno"];

export function areaDefaults(area) {
  return TEMPERATURE_AREAS.find(a => a.area === area) || TEMPERATURE_AREAS[0];
}

// Una lectura es excursión cuando sale del rango permitido del equipo
export function isExcursion(log) {
  const temp = Number(log?.temperature);
  const min = Number(log?.min_temp);
  const max = Number(log?.max_temp);
  if (!Number.isFinite(temp) || !Number.isFinite(min) || !Number.isFinite(max)) return false;
  return temp < min || temp > max;
}

export function rangeLabel(log) {
  const min = Number(log?.min_temp);
  const max = Number(log?.max_temp);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return "—";
  return `${min} a ${max} °C`;
}

export function currentShift(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 6 && hour < 14) return "Matutino";
  if (hour >= 14 && hour < 22) return "Vespertino";
  return "Nocturno";
}