import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Activity, AlertTriangle } from "lucide-react";
import { cumulativeReport } from "@/lib/cumulativeDose";

const STATUS = {
  ok: { bar: "bg-emerald-500", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", label: "Dentro del tope" },
  warning: { bar: "bg-amber-500", text: "text-amber-700", badge: "bg-amber-100 text-amber-700", label: "Cerca del tope" },
  exceeded: { bar: "bg-red-500", text: "text-red-700", badge: "bg-red-100 text-red-700", label: "Tope alcanzado" },
};

export default function CumulativeDoseCard({ patientId, bsa, previewDrugs = [] }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!patientId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    base44.entities.Prescription.filter({ patient_id: patientId }, { limit: 200 })
      .then(page => { if (active) setPrescriptions(page.items || []); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [patientId]);

  if (!patientId) return null;

  const rows = cumulativeReport(
    prescriptions,
    previewDrugs.map(drug => ({ ...drug, bsa }))
  );

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-start gap-2">
        <Activity className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div>
          <h2 className="font-semibold text-sm">Dosis acumulada de por vida</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {previewDrugs.length > 0
              ? "Acumulado del paciente más la dosis de esta prescripción"
              : "Suma de todas las prescripciones no rechazadas del paciente"}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {loading ? (
          <p className="text-xs text-muted-foreground">Calculando dosis acumuladas...</p>
        ) : rows.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Ningún fármaco de este paciente tiene un tope de dosis acumulada definido.
          </p>
        ) : (
          rows.map(row => {
            const style = STATUS[row.status] || STATUS.ok;
            return (
              <div key={row.drug_name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    {row.status === "exceeded" && <AlertTriangle className="h-3.5 w-3.5 text-red-600" />}
                    <span className="text-sm font-medium">{row.drug_name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    {row.accumulated} / {row.limit} {row.basis} · {row.percent}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${style.bar}`}
                    style={{ width: `${Math.min(row.percent, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {row.doses} dosis registrada(s) · {row.note}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}