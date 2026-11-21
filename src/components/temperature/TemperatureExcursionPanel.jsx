import moment from "moment";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isExcursion, rangeLabel } from "@/lib/temperature";

// Excursiones de los últimos 7 días que aún no tienen acción correctiva documentada
export default function TemperatureExcursionPanel({ readings, onEdit }) {
  const since = moment().subtract(7, "days");
  const excursions = (readings || []).filter(r => isExcursion(r) && moment(r.recorded_at).isAfter(since));

  if (excursions.length === 0) return null;

  const pending = excursions.filter(r => !(r.corrective_action || "").trim()).length;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-red-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <p className="text-sm font-semibold text-red-800">
            Excursiones de temperatura (últimos 7 días): {excursions.length}
          </p>
        </div>
        {pending > 0 && (
          <span className="text-xs font-medium text-red-700">{pending} sin acción correctiva documentada</span>
        )}
      </div>
      <div className="divide-y divide-red-200/70">
        {excursions.map(r => (
          <div key={r.id} className="px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm text-red-900">
              <span className="font-medium">{r.equipment}</span>
              <span className="text-red-500 mx-1.5">·</span>
              <span className="font-mono font-bold">{r.temperature} °C</span>
              <span className="text-red-700 text-xs ml-2">(permitido {rangeLabel(r)})</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-red-700">{moment(r.recorded_at).format("DD/MM/YYYY HH:mm")} · {r.shift}</span>
              {(r.corrective_action || "").trim() ? (
                <span className="text-xs text-red-800 max-w-[16rem] truncate" title={r.corrective_action}>
                  {r.corrective_action}
                </span>
              ) : (
                <Button size="sm" variant="outline" className="h-7 text-xs border-red-300 text-red-700 hover:bg-red-100" onClick={() => onEdit(r)}>
                  Registrar acción
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}