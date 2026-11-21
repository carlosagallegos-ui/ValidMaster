import moment from "moment";

// Indicadores operativos sobre las prescripciones del periodo
export function computeKpis(prescriptions) {
  const list = prescriptions || [];
  const rejected = list.filter(p => p.validation_status === "Rechazada");
  const decided = list.filter(p => p.validation_status === "Rechazada" || p.validation_status === "Validada");
  const delivered = list.filter(p => p.delivered && p.delivered_date);

  const cycleHours = delivered
    .map(p => moment(p.delivered_date).diff(moment(p.created_date), "hours", true))
    .filter(hours => hours > 0);

  const scheduled = list.filter(p => p.scheduled_date && !moment(p.scheduled_date).isAfter(moment(), "day"));
  const onTime = scheduled.filter(p =>
    p.delivered && p.delivered_date && moment(p.delivered_date).isSame(moment(p.scheduled_date), "day")
  );

  return {
    total: list.length,
    delivered: delivered.length,
    pending: list.filter(p => p.validation_status === "Pendiente").length,
    rejectionRate: decided.length ? (rejected.length / decided.length) * 100 : 0,
    avgCycleHours: cycleHours.length ? cycleHours.reduce((a, b) => a + b, 0) / cycleHours.length : null,
    complianceRate: scheduled.length ? (onTime.length / scheduled.length) * 100 : null,
    scheduled: scheduled.length,
    onTime: onTime.length,
  };
}

// Entregas por día para la gráfica del periodo
export function deliveriesByDay(prescriptions, days) {
  const start = moment().subtract(days - 1, "days").startOf("day");
  const buckets = {};
  for (let i = 0; i < days; i++) {
    const day = moment(start).add(i, "days");
    buckets[day.format("YYYY-MM-DD")] = { day: day.format("DD/MM"), entregas: 0 };
  }
  (prescriptions || []).forEach(p => {
    if (!p.delivered_date) return;
    const key = moment(p.delivered_date).format("YYYY-MM-DD");
    if (buckets[key]) buckets[key].entregas += 1;
  });
  return Object.values(buckets);
}

export function formatHours(hours) {
  if (hours === null || hours === undefined) return "—";
  if (hours < 24) return `${hours.toFixed(1)} h`;
  return `${(hours / 24).toFixed(1)} días`;
}