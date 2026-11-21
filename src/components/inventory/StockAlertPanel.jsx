import { AlertTriangle } from "lucide-react";

export default function StockAlertPanel({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-amber-200 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <p className="text-sm font-semibold text-amber-800">Reposición requerida ({alerts.length})</p>
      </div>
      <div className="divide-y divide-amber-200/70">
        {alerts.map(a => (
          <div key={a.drug_name} className="px-4 py-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
            <p className="text-sm font-medium text-amber-900">{a.drug_name}</p>
            <div className="flex items-center gap-2 text-xs text-amber-800">
              <span>Disponibles <b className="font-mono">{a.available}</b></span>
              <span className="text-amber-400">·</span>
              <span>Mínimo <b className="font-mono">{a.reorder_point}</b></span>
              {a.deficit > 0 && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-medium">
                  Faltan {a.deficit}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}