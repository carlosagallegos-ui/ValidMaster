import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronRight, CalendarRange } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";

const statusChip = (rx) => {
  if (rx.delivered) return { label: "Entregada", cls: "bg-blue-100 text-blue-700" };
  if (rx.validation_status === "Validada") return { label: "Validada", cls: "bg-emerald-100 text-emerald-700" };
  if (rx.validation_status === "Rechazada") return { label: "Rechazada", cls: "bg-red-100 text-red-700" };
  return { label: rx.validation_status || "Pendiente", cls: "bg-amber-100 text-amber-700" };
};

export default function TreatmentPlan({ refreshKey = 0 }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openKey, setOpenKey] = useState(null);

  useEffect(() => {
    setLoading(true);
    base44.entities.Prescription.filter({ scheduled_date: { $exists: true } }, { sort: "scheduled_date", limit: 300 })
      .then(page => setRows((page.items || []).filter(rx => rx.scheduled_date)))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const groups = {};
  rows.forEach(rx => {
    const key = `${rx.patient_id || rx.patient_name}|${rx.protocol_name || "Sin protocolo"}`;
    if (!groups[key]) {
      groups[key] = {
        key,
        patient_name: rx.patient_name,
        protocol_name: rx.protocol_name || "Sin protocolo",
        items: [],
      };
    }
    groups[key].items.push(rx);
  });

  const list = Object.values(groups)
    .map(group => {
      const items = [...group.items].sort(
        (a, b) => (a.cycle_number || 0) - (b.cycle_number || 0) ||
          (a.scheduled_date || "").localeCompare(b.scheduled_date || "")
      );
      return {
        ...group,
        items,
        validated: items.filter(rx => rx.validation_status === "Validada").length,
        delivered: items.filter(rx => rx.delivered).length,
        next: items.find(rx => !rx.delivered),
      };
    })
    .sort((a, b) => (a.next?.scheduled_date || "").localeCompare(b.next?.scheduled_date || ""));

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-start gap-2">
        <CalendarRange className="h-4 w-4 text-primary mt-0.5 shrink-0" />
        <div>
          <p className="font-semibold text-sm">Plan de tratamiento por paciente</p>
          <p className="text-xs text-muted-foreground">Todos los ciclos programados de cada protocolo</p>
        </div>
      </div>

      {loading ? (
        <p className="px-5 py-6 text-xs text-center text-muted-foreground">Cargando planes...</p>
      ) : list.length === 0 ? (
        <p className="px-5 py-8 text-sm text-center text-muted-foreground">
          Aún no hay tratamientos programados
        </p>
      ) : (
        <div className="divide-y divide-border">
          {list.map(group => {
            const open = openKey === group.key;
            return (
              <div key={group.key}>
                <button
                  onClick={() => setOpenKey(open ? null : group.key)}
                  className="w-full text-left px-5 py-3 flex items-center justify-between gap-3 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {open ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{group.patient_name}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{group.protocol_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-muted-foreground">
                      {group.validated}/{group.items.length} validadas
                    </span>
                    {group.next && (
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {formatDate(group.next.scheduled_date)}
                      </span>
                    )}
                  </div>
                </button>

                {open && (
                  <div className="px-5 pb-3 space-y-1">
                    {group.items.map(rx => {
                      const chip = statusChip(rx);
                      return (
                        <div key={rx.id} className="flex items-center justify-between gap-2 text-xs bg-muted/30 rounded-lg px-3 py-1.5">
                          <span className="font-medium">
                            Ciclo {rx.cycle_number || "—"} · Día {rx.day_of_cycle || 1}
                          </span>
                          <span className="font-mono text-muted-foreground">
                            {formatDate(rx.scheduled_date)} · {rx.scheduled_shift || "Matutino"}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${chip.cls}`}>
                            {chip.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}