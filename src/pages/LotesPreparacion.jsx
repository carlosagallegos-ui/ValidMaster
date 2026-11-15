import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import PrepLotTable from "@/components/PrepLotTable";
import { Input } from "@/components/ui/input";
import { Search, ClipboardCheck, User, Beaker } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";

export default function LotesPreparacion() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    base44.entities.Prescription.list("-created_date", 300).then(rxs => {
      setPrescriptions(rxs);
      setLoading(false);
    });
  }, []);

  const filtered = prescriptions.filter(rx => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [rx.patient_name, rx.protocol_name, rx.prescribing_doctor]
      .some(v => (v || "").toLowerCase().includes(q));
  });

  const selected = prescriptions.find(rx => rx.id === selectedId) || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lotes de Preparación</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Verificación de medicamentos y lotes que ingresan al área de preparación
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-[340px_1fr] gap-6 items-start">
          {/* Selector de mezcla */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Paciente, protocolo o médico..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">{filtered.length} mezcla(s)</p>
            </div>
            <div className="max-h-[70vh] overflow-y-auto divide-y divide-border">
              {filtered.length === 0 ? (
                <p className="p-6 text-sm text-muted-foreground text-center">Sin resultados</p>
              ) : (
                filtered.map(rx => (
                  <button
                    key={rx.id}
                    onClick={() => setSelectedId(rx.id)}
                    className={`w-full text-left px-4 py-3 transition-colors ${
                      rx.id === selectedId ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-muted/40 border-l-2 border-transparent"
                    }`}
                  >
                    <p className="text-sm font-semibold truncate">{rx.patient_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{rx.protocol_name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {rx.created_date ? formatDate(rx.created_date) : "—"}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Tabla de lotes */}
          <div>
            {selected ? (
              <div className="space-y-4">
                <div className="bg-card rounded-xl border border-border p-5">
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-semibold">{selected.patient_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Beaker className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selected.protocol_name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Dr. {selected.prescribing_doctor} · {selected.prescription_date ? formatDate(selected.prescription_date) : "—"}
                    </span>
                  </div>
                </div>
                <PrepLotTable prescription={selected} />
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-dashed border-border p-12 text-center">
                <ClipboardCheck className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm font-medium">Selecciona una mezcla</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Elige una preparación de la lista para corroborar sus medicamentos, presentación y lote.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}