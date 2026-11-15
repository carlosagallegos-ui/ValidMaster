import moment from "moment";
import { Barcode, AlertTriangle } from "lucide-react";
import { clasificarArea, areaLabel } from "@/lib/areasCentro";

export default function DrugLotInfo({ lote }) {
  if (!lote) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
          <AlertTriangle className="h-3 w-3" /> Lote a utilizar
        </p>
        <p className="text-xs text-amber-700 mt-1">Sin lote registrado en inventario para este medicamento.</p>
      </div>
    );
  }

  const days = lote.expiration_date ? moment(lote.expiration_date).diff(moment(), "days") : null;
  const soon = days !== null && days <= 30;

  return (
    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <Barcode className="h-3 w-3" /> Lote a utilizar
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground">Lote</p>
          <p className="font-mono font-semibold">{lote.lot_number || "—"}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Caducidad</p>
          <p className={`font-mono font-semibold ${soon ? "text-amber-600" : ""}`}>
            {lote.expiration_date ? moment(lote.expiration_date).format("DD/MM/YYYY") : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Área</p>
          <p className="font-medium">{areaLabel(clasificarArea(lote))}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Disponibles</p>
          <p className="font-mono font-semibold">{lote.quantity_available ?? lote.quantity_received ?? 0} frasco(s)</p>
        </div>
      </div>
    </div>
  );
}