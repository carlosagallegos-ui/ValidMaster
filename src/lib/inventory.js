import { base44 } from "@/api/base44Client";

/** Lotes disponibles de un medicamento, ordenados por caducidad (primero lo que vence antes) */
export function availableLotsFor(drugName, medications) {
  const name = (drugName || "").toLowerCase();
  return medications
    .filter(m =>
      m.drug_name?.toLowerCase().includes(name) &&
      m.status === "Disponible" &&
      (m.quantity_available ?? 0) > 0
    )
    .sort((a, b) => (a.expiration_date || "9999-12-31") > (b.expiration_date || "9999-12-31") ? 1 : -1);
}

/**
 * Descuenta frascos del inventario (FEFO por caducidad) y devuelve el detalle del movimiento.
 */
export async function deductVialsForDrug(drugName, needed, medications) {
  const lots = availableLotsFor(drugName, medications);
  let remaining = needed;
  const movements = [];

  for (const lot of lots) {
    if (remaining <= 0) break;
    const available = lot.quantity_available ?? 0;
    const take = Math.min(remaining, available);
    const left = available - take;
    await base44.entities.Medication.update(lot.id, {
      quantity_available: left,
      status: left === 0 ? "Agotado" : lot.status,
    });
    movements.push({
      lot: lot.lot_number || "—",
      drug: lot.drug_name,
      taken: take,
      left,
    });
    remaining -= take;
  }

  return {
    needed,
    deducted: needed - remaining,
    shortage: remaining,
    lots: movements,
  };
}