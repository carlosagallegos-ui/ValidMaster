import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, CalendarDays, Plus } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";
import ShiftColumn from "@/components/programacion/ShiftColumn";
import UnscheduledList from "@/components/programacion/UnscheduledList";
import TreatmentPlan from "@/components/programacion/TreatmentPlan";
import TreatmentScheduler from "@/components/programacion/TreatmentScheduler";

const SHIFTS = [
  { id: "Matutino", label: "Matutino", range: "07:00 – 14:00" },
  { id: "Vespertino", label: "Vespertino", range: "14:00 – 20:00" },
  { id: "Nocturno", label: "Nocturno", range: "20:00 – 07:00" },
];

const AREA_LABELS = { Oncologico: "Oncológicas", Antibiotico: "Antibióticos", NPT: "NPT" };

const localDateKey = (value) => {
  const d = value ? new Date(value) : new Date();
  if (isNaN(d)) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const addDays = (key, days) => {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() + days);
  return localDateKey(d);
};

export default function Programacion() {
  const [date, setDate] = useState(localDateKey());
  const [dayMixes, setDayMixes] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [schedulerOpen, setSchedulerOpen] = useState(false);
  const [planKey, setPlanKey] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    const [dayPage, pendingPage] = await Promise.all([
      base44.entities.Prescription.filter({ scheduled_date: date }, { sort: "created_date", limit: 100 }),
      base44.entities.Prescription.filter({ delivered: { $ne: true } }, { sort: "-created_date", limit: 200 }),
    ]);
    setDayMixes(dayPage.items || []);
    setPending((pendingPage.items || []).filter(rx => !rx.scheduled_date));
    setLoading(false);
  }, [date]);

  useEffect(() => { load(); }, [load]);

  const schedule = async (rx, shift) => {
    const data = { scheduled_date: date, scheduled_shift: shift };
    await base44.entities.Prescription.update(rx.id, data);
    setPending(prev => prev.filter(p => p.id !== rx.id));
    setDayMixes(prev => [...prev, { ...rx, ...data }]);
  };

  const move = async (rx, shift) => {
    await base44.entities.Prescription.update(rx.id, { scheduled_shift: shift });
    setDayMixes(prev => prev.map(p => (p.id === rx.id ? { ...p, scheduled_shift: shift } : p)));
  };

  const unschedule = async (rx) => {
    await base44.entities.Prescription.update(rx.id, { scheduled_date: null, scheduled_shift: null });
    setDayMixes(prev => prev.filter(p => p.id !== rx.id));
    setPending(prev => [...prev, { ...rx, scheduled_date: null, scheduled_shift: null }]);
  };

  const areaCounts = ["Oncologico", "Antibiotico", "NPT"].map(type => ({
    type,
    label: AREA_LABELS[type],
    count: dayMixes.filter(rx => (rx.prescription_type || "Oncologico") === type).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Programación de Mezclas</h1>
          <p className="text-sm text-muted-foreground mt-1">Asigna cada mezcla al día y turno de preparación</p>
        </div>
        <div className="flex items-end gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setDate(addDays(date, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Día</label>
            <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-40 h-9" />
          </div>
          <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setDate(addDays(date, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="sm" className="h-9" onClick={() => setDate(localDateKey())}>
            Hoy
          </Button>
          <Button size="sm" className="h-9 gap-1" onClick={() => setSchedulerOpen(true)}>
            <Plus className="h-4 w-4" /> Programar tratamiento
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary" />
          <p className="text-sm font-semibold">{formatDate(date)}</p>
        </div>
        <div className="flex flex-wrap gap-2 ml-auto">
          <span className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold">
            {dayMixes.length} mezcla(s) del día
          </span>
          {areaCounts.map(a => (
            <span key={a.type} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground font-medium">
              {a.label}: {a.count}
            </span>
          ))}
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
            Sin programar: {pending.length}
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {SHIFTS.map(s => (
            <ShiftColumn
              key={s.id}
              title={s.label}
              range={s.range}
              mixes={dayMixes.filter(rx => (rx.scheduled_shift || "Matutino") === s.id)}
              onMove={move}
              onRemove={unschedule}
            />
          ))}
        </div>
      )}

      <UnscheduledList mixes={pending} onSchedule={schedule} />

      <TreatmentPlan refreshKey={planKey} />

      <TreatmentScheduler
        open={schedulerOpen}
        onOpenChange={setSchedulerOpen}
        onScheduled={() => { load(); setPlanKey(k => k + 1); }}
      />
    </div>
  );
}