import moment from "moment";
import { Barcode, AlertTriangle } from "lucide-react";
import { clasificarArea, areaLabel } from "@/lib/areasCentro";

const normalize = (name) => (name || "").replace(/ bolo$/i, "").replace(/ infusi[oó]n$/i, "").trim().toLowerCase();

export default function PrepLots({ drugs = [], medications = [] }) {
  const rows = [];

  (drugs || []).forEach(drug => {
    const lots = medications
      .filter(m => normalize(m.drug_name) === normalize(drug.drug_name) && m.status !== "Caducado")
      .sort((a, b) => ((a.expiration_date || "9999-12-31") > (b.expiration_date || "9999-12-31") ? 1 : -1));

    if (lots.length === 0) {
      rows.push({ key: `${drug.drug_name}-none`, drug: drug.drug_name, missing: true });
    } else {
      lots.forEach((m, i) => rows.push({ key: `${drug.drug_name}-${m.id}`, drug: drug.drug_name, med: m, fefo: i === 0 }));
    }
  });

  if (rows.length === 0) return null;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border bg-muted/20 flex items-center gap-3">
        <Barcode className="h-4 w-4 text-primary" />
        <div>
          <p className="font-semibold text-sm">Hoja de Lotes</p>
          <p className="text-xs text-muted-foreground">Trazabilidad de lotes que ingresan a la preparación</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="lotes w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Medicamento", "Lote", "Caducidad", "Área", "Proveedor", "Disponibles", "Estado"].map(h => (
                <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(row => {
              if (row.missing) {
                return (
                  <tr key={row.key} className="border-b border-border last:border-0">
                    <td className="px-4 py-2.5 text-sm font-medium">{row.drug}</td>
                    <td colSpan={6} className="px-4 py-2.5 text-xs text-amber-600">
                      Sin lote registrado en inventario
                    </td>
                  </tr>
                );
              }

              const m = row.med;
              const days = m.expiration_date ? moment(m.expiration_date).diff(moment(), "days") : null;
              const soon = days !== null && days <= 30;

              return (
                <tr key={row.key} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-2.5 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {row.drug}
                      {row.fefo && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">USAR</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-sm font-mono">{m.lot_number || "—"}</td>
                  <td className="px-4 py-2.5 text-sm font-mono">
                    {m.expiration_date ? (
                      <span className={soon ? "text-amber-600 font-medium flex items-center gap-1" : ""}>
                        {soon && <AlertTriangle className="h-3 w-3" />}
                        {moment(m.expiration_date).format("DD/MM/YYYY")}
                      </span>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">{areaLabel(clasificarArea(m))}</td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">{m.supplier || "—"}</td>
                  <td className="px-4 py-2.5 text-sm font-mono text-center font-semibold">{m.quantity_available ?? m.quantity_received ?? 0}</td>
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">{m.status || "Disponible"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}