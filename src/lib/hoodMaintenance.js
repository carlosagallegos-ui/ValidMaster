import moment from "moment";

export const HOOD_ACTIVITY_TYPES = ["Limpieza", "Desinfección", "Certificación", "Mantenimiento / filtro"];
export const HOOD_EQUIPMENT_TYPES = ["Campana de flujo laminar", "Cabina de bioseguridad", "Aislador", "Otra"];
export const HOOD_RESULTS = ["Conforme", "Con observaciones", "No conforme"];

export const TONE_CLASSES = {
  red: "bg-red-50 text-red-700 border-red-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  gray: "bg-muted text-muted-foreground border-border",
};

// Vigencia de la próxima fecha de cumplimiento
export function dueStatus(date) {
  if (!date) return null;
  const hoy = moment().startOf("day");
  const due = moment(date).startOf("day");
  const days = due.diff(hoy, "days");
  if (days < 0) return { label: "Vencida", tone: "red", days };
  if (days <= 30) return { label: "Por vencer", tone: "amber", days };
  return { label: "Vigente", tone: "green", days };
}

// Agrupa el historial por campana: última actividad, última limpieza y certificación vigente
export function groupByEquipment(logs) {
  const map = {};
  (logs || []).forEach(log => {
    const key = (log.equipment || "").trim().toUpperCase();
    if (!key) return;
    if (!map[key]) map[key] = { equipment: key, equipment_type: log.equipment_type || "Otra", logs: [] };
    map[key].logs.push(log);
  });

  return Object.values(map)
    .map(group => {
      const sorted = group.logs.slice().sort((a, b) => new Date(b.performed_date) - new Date(a.performed_date));
      const cleaning = sorted.find(l => l.activity_type === "Limpieza" || l.activity_type === "Desinfección");
      const certification = sorted.find(l => l.activity_type === "Certificación");
      return {
        ...group,
        logs: sorted,
        lastActivity: sorted[0],
        lastCleaning: cleaning,
        certification,
        due: dueStatus(certification?.next_due_date),
      };
    })
    .sort((a, b) => a.equipment.localeCompare(b.equipment));
}

// Certificaciones vencidas o por vencer de todo el historial
export function complianceAlerts(logs) {
  return groupByEquipment(logs)
    .filter(g => g.due && g.due.tone !== "green")
    .sort((a, b) => a.due.days - b.due.days);
}