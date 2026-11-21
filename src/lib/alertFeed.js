import moment from "moment";
import { computeStockAlerts } from "@/lib/stockAlerts";
import { isExcursion } from "@/lib/temperature";

// Construye el feed de pendientes operativos agrupado por tipo
export function buildAlerts({ prescriptions = [], medications = [], temperatureLogs = [] }) {
  const groups = [];

  const pendingValidation = prescriptions.filter(p => p.validation_status === "Pendiente");
  groups.push({
    key: "validacion",
    label: "Pendientes por validar",
    description: "Prescripciones que esperan revisión del validador",
    link: "/validacion-mezclas",
    items: pendingValidation
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      .map(p => ({
        id: p.id,
        title: p.patient_name || "Paciente sin nombre",
        subtitle: `${p.protocol_name || "Sin protocolo"}${p.scheduled_date ? ` · programada ${moment(p.scheduled_date).format("DD/MM")}` : ""}`,
        meta: `${moment().diff(moment(p.created_date), "days")} d en espera`,
        link: `/prescripcion/${p.id}`,
      })),
  });

  const today = moment().startOf("day");
  const expiring = medications
    .filter(m => (Number(m.quantity_available) || 0) > 0 && m.expiration_date && m.status !== "Caducado")
    .filter(m => moment(m.expiration_date).isBefore(moment().add(60, "days"), "day"))
    .sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date))
    .map(m => {
      const days = moment(m.expiration_date).startOf("day").diff(today, "days");
      return {
        id: m.id,
        title: m.drug_name,
        subtitle: `Lote ${m.lot_number || "s/lote"} · ${m.quantity_available} frascos`,
        meta: days < 0 ? `Caducado hace ${Math.abs(days)} d` : `Caduca en ${days} d`,
        link: "/medicamentos",
      };
    });
  groups.push({
    key: "caducidad",
    label: "Lotes por caducar",
    description: "Lotes con existencia que caducan en los próximos 60 días",
    link: "/medicamentos",
    items: expiring,
  });

  const readyForExit = prescriptions.filter(p => p.validation_status === "Validada" && !p.delivered);
  groups.push({
    key: "salida",
    label: "Mezclas listas para salida",
    description: "Validadas que aún no se entregan a la mesa de atención",
    link: "/salidas",
    items: readyForExit
      .sort((a, b) => new Date(a.validation_date || a.created_date) - new Date(b.validation_date || b.created_date))
      .map(p => ({
        id: p.id,
        title: p.patient_name || "Paciente sin nombre",
        subtitle: `${p.protocol_name || "Sin protocolo"} · ${(p.drugs || []).length} fármaco(s)`,
        meta: p.scheduled_date ? `Programada ${moment(p.scheduled_date).format("DD/MM")}` : "Sin programar",
        link: `/prescripcion/${p.id}`,
      })),
  });

  const stock = computeStockAlerts(medications).map(alert => ({
    id: alert.drug_name,
    title: alert.drug_name,
    subtitle: `Existencia ${alert.available} · punto de reorden ${alert.reorder_point}`,
    meta: `Faltan ${alert.deficit} frascos`,
    link: "/medicamentos",
  }));
  groups.push({
    key: "stock",
    label: "Stock bajo",
    description: "Medicamentos en o por debajo de su punto de reorden",
    link: "/medicamentos",
    items: stock,
  });

  const since = moment().subtract(7, "days");
  const excursions = temperatureLogs
    .filter(r => isExcursion(r) && moment(r.recorded_at).isAfter(since) && !(r.corrective_action || "").trim())
    .map(r => ({
      id: r.id,
      title: r.equipment,
      subtitle: `${r.temperature} °C · permitido ${r.min_temp} a ${r.max_temp} °C`,
      meta: moment(r.recorded_at).format("DD/MM HH:mm"),
      link: "/temperaturas",
    }));
  groups.push({
    key: "temperatura",
    label: "Excursiones de temperatura",
    description: "Lecturas fuera de rango sin acción correctiva documentada",
    link: "/temperaturas",
    items: excursions,
  });

  return groups;
}