import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Checkbox } from "@/components/ui/checkbox";
import { ClipboardCheck } from "lucide-react";

const normalize = (name) => (name || "").replace(/ bolo$/i, "").replace(/ infusi[oó]n$/i, "").trim().toLowerCase();

export default function PrepLotTable({ prescription, drugs = [] }) {
  const [medications, setMedications] = useState([]);
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!prescription?.id) return;
    Promise.all([
      base44.entities.Medication.list("-received_date", 300),
      base44.entities.PrepLot.filter({ prescription_id: prescription.id }),
    ]).then(([meds, recs]) => {
      setMedications(meds);
      setRecords(recs);
    });
    base44.auth.me().then(setUser).catch(() => {});
  }, [prescription?.id]);

  if (!prescription?.id) return null;

  const rows = (prescription.drugs?.length ? prescription.drugs : drugs || []).map(drug => {
    const lots = medications
      .filter(m => normalize(m.drug_name) === normalize(drug.drug_name) && m.status !== "Caducado")
      .sort((a, b) => ((a.expiration_date || "9999-12-31") > (b.expiration_date || "9999-12-31") ? 1 : -1));
    const lot = lots[0] || null;
    return {
      drug_name: drug.drug_name,
      presentation: lot?.presentation || (lot ? `${lot.concentration} ${lot.concentration_unit}` : "—"),
      lot_number: lot?.lot_number || "—",
      record: records.find(r => r.drug_name === drug.drug_name && (r.lot_number || "—") === (lot?.lot_number || "—")),
    };
  });

  const verifiedCount = rows.filter(r => r.record?.verified).length;

  const toggleRow = async (row) => {
    const verified = !row.record?.verified;
    const data = {
      verified,
      verified_by: verified ? (user?.full_name || user?.email || "") : "",
      verified_date: verified ? new Date().toISOString() : null,
    };

    if (row.record) {
      await base44.entities.PrepLot.update(row.record.id, data);
      setRecords(prev => prev.map(r => (r.id === row.record.id ? { ...r, ...data } : r)));
    } else {
      const created = await base44.entities.PrepLot.create({
        prescription_id: prescription.id,
        patient_name: prescription.patient_name,
        drug_name: row.drug_name,
        presentation: row.presentation,
        lot_number: row.lot_number,
        ...data,
      });
      setRecords(prev => [...prev, created]);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center gap-3">
        <ClipboardCheck className="h-4 w-4 text-primary" />
        <div>
          <p className="font-semibold text-sm">Control de Lotes · Área de Preparación</p>
          <p className="text-xs text-muted-foreground">Se alimenta con los medicamentos y lotes que ingresan a la preparación</p>
        </div>
        <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
          {verifiedCount}/{rows.length} verificados
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="lot-table w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Medicamento</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Presentación</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Lote</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">Verificar</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">
                  Aún no hay medicamentos registrados para esta preparación.
                </td>
              </tr>
            ) : (
              rows.map(row => (
                <tr key={`${row.drug_name}-${row.lot_number}`} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 text-sm font-medium">{row.drug_name}</td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">{row.presentation}</td>
                  <td className="px-4 py-2.5 text-sm font-mono">{row.lot_number}</td>
                  <td className="px-4 py-2.5 text-center">
                    <Checkbox
                      checked={!!row.record?.verified}
                      onCheckedChange={() => toggleRow(row)}
                      className="mx-auto"
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}