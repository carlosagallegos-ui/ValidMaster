import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";
import AreaBadge from "@/components/programacion/AreaBadge";

const SHIFTS = [
  { id: "Matutino", short: "Mat." },
  { id: "Vespertino", short: "Vesp." },
  { id: "Nocturno", short: "Noct." },
];

export default function UnscheduledList({ mixes, onSchedule }) {
  const [search, setSearch] = useState("");

  const filtered = mixes.filter(rx =>
    !search ||
    rx.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    rx.protocol_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-sm">Mezclas sin programar</p>
          <p className="text-xs text-muted-foreground">
            Selecciona el turno para asignarlas al día elegido
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente o indicación..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 h-9"
          />
        </div>
      </div>

      <div className="divide-y divide-border max-h-[420px] overflow-y-auto">
        {filtered.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted-foreground">
            No hay mezclas pendientes de programar
          </p>
        ) : (
          filtered.map(rx => (
            <div key={rx.id} className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-muted/20 transition-colors">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium truncate">{rx.patient_name}</p>
                  <AreaBadge type={rx.prescription_type} />
                </div>
                <p className="text-[11px] text-muted-foreground truncate">
                  {rx.protocol_name} · Prescrita {formatDate(rx.prescription_date || rx.created_date)}
                </p>
              </div>
              <div className="flex gap-1 shrink-0">
                {SHIFTS.map(s => (
                  <Button
                    key={s.id}
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 px-2"
                    onClick={() => onSchedule(rx, s.id)}
                  >
                    {s.short}
                  </Button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}