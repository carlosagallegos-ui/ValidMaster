import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X, Syringe } from "lucide-react";
import AreaBadge from "@/components/programacion/AreaBadge";

const SHIFT_OPTIONS = ["Matutino", "Vespertino", "Nocturno"];

export default function ShiftColumn({ title, range, mixes, onMove, onRemove }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-border bg-muted/20 flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-[11px] text-muted-foreground">{range}</p>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
          {mixes.length}
        </span>
      </div>

      <div className="divide-y divide-border flex-1">
        {mixes.length === 0 ? (
          <p className="px-4 py-6 text-xs text-center text-muted-foreground">Sin mezclas programadas</p>
        ) : (
          mixes.map(rx => (
            <div key={rx.id} className="px-4 py-3 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-medium truncate">{rx.patient_name}</p>
                    <AreaBadge type={rx.prescription_type} />
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{rx.protocol_name}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => onRemove(rx)}
                  title="Quitar de la programación"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                {rx.validation_status === "Validada" ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-medium">Validada</span>
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                    {rx.validation_status || "Pendiente"}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Syringe className="h-3 w-3" /> {(rx.drugs || []).length} fármaco(s)
                </span>
                <Select value={rx.scheduled_shift || "Matutino"} onValueChange={(v) => onMove(rx, v)}>
                  <SelectTrigger className="h-7 ml-auto w-28 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHIFT_OPTIONS.map(s => (
                      <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}