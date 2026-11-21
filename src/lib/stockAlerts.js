import moment from "moment";

// Stock real por medicamento: suma de los frascos disponibles de sus lotes vigentes.
// El punto de reorden se toma del mayor valor definido entre los lotes del medicamento.
export function computeStockAlerts(medications) {
  const groups = {};

  (medications || []).forEach(med => {
    const key = (med.drug_name || "").trim().toUpperCase();
    if (!key) return;
    if (!groups[key]) groups[key] = { drug_name: key, available: 0, reorder_point: 0 };

    const caducado = med.status === "Caducado" ||
      (med.expiration_date && moment(med.expiration_date).isBefore(moment(), "day"));
    const available = Number(med.quantity_available ?? med.quantity_received ?? 0) || 0;
    if (!caducado) groups[key].available += available;

    const reorder = Number(med.reorder_point) || 0;
    if (reorder > groups[key].reorder_point) groups[key].reorder_point = reorder;
  });

  return Object.values(groups)
    .filter(g => g.reorder_point > 0 && g.available <= g.reorder_point)
    .map(g => ({ ...g, deficit: Math.max(g.reorder_point - g.available, 0) }))
    .sort((a, b) => a.available - a.reorder_point - (b.available - b.reorder_point));
}