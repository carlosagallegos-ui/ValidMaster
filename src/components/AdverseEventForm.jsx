import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Zap, Clock, ShieldAlert } from "lucide-react";

const EVENT_TYPES = [
  "Hipersensibilidad / Anafilaxia",
  "Náuseas / Vómito",
  "Flebitis / Extravasación",
  "Neurotoxicidad",
  "Nefrotoxicidad",
  "Hepatotoxicidad",
  "Mielosupresión",
  "Cardiotoxicidad",
  "Reacción en sitio de infusión",
  "Fiebre / Escalofrío",
  "Hipotensión",
  "Broncoespasmo",
  "Otro"
];

const CTCAE_GRADES = [
  { grade: 1, label: "Grado 1 – Leve", severity: "Leve" },
  { grade: 2, label: "Grado 2 – Moderado", severity: "Moderada" },
  { grade: 3, label: "Grado 3 – Severo", severity: "Severa" },
  { grade: 4, label: "Grado 4 – Amenaza para la vida", severity: "Amenaza para la vida" },
  { grade: 5, label: "Grado 5 – Fatal", severity: "Fatal" }
];

const ACTIONS = [
  "Ninguna",
  "Reducción de velocidad de infusión",
  "Interrupción temporal",
  "Suspensión definitiva",
  "Medicación de rescate",
  "Traslado a urgencias"
];

const OUTCOMES = ["Resuelto", "Resuelto con secuelas", "En seguimiento", "No resuelto", "Fatal"];

const gradeColor = (g) => {
  if (g <= 1) return "bg-yellow-50 border-yellow-300 text-yellow-800";
  if (g === 2) return "bg-orange-50 border-orange-300 text-orange-800";
  if (g === 3) return "bg-red-50 border-red-300 text-red-800";
  return "bg-red-100 border-red-500 text-red-900";
};

export default function AdverseEventForm({ rx, drugName, onSaved, onCancel }) {
  const drugs = rx?.drugs || [];
  const [form, setForm] = useState({
    drug_name: drugName || (drugs[0]?.drug_name || ""),
    event_type: "",
    event_type_other: "",
    ctcae_grade: 1,
    severity: "Leve",
    onset_time: "",
    duration: "",
    action_taken: "Ninguna",
    rescue_medication: "",
    outcome: "Resuelto",
    notes: ""
  });
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleGrade = (grade) => {
    const found = CTCAE_GRADES.find(g => g.grade === grade);
    setForm(prev => ({ ...prev, ctcae_grade: grade, severity: found?.severity || "Leve" }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    const user = await base44.auth.me();
    await base44.entities.AdverseEvent.create({
      prescription_id: rx.id,
      patient_name: rx.patient_name,
      patient_id: rx.patient_id,
      drug_name: form.drug_name,
      prescription_type: rx.prescription_type || "Oncologico",
      protocol_name: rx.protocol_name,
      event_type: form.event_type,
      event_type_other: form.event_type === "Otro" ? form.event_type_other : undefined,
      severity: form.severity,
      ctcae_grade: form.ctcae_grade,
      onset_time: form.onset_time || undefined,
      duration: form.duration || undefined,
      action_taken: form.action_taken,
      rescue_medication: form.action_taken === "Medicación de rescate" ? form.rescue_medication : undefined,
      outcome: form.outcome,
      notes: form.notes || undefined,
      reported_by: user.full_name || user.email,
      reported_by_role: user.role,
      event_date: new Date().toISOString()
    });
    setSaving(false);
    onSaved?.();
  };

  const isValid = form.drug_name && form.event_type &&
    (form.event_type !== "Otro" || form.event_type_other);

  return (
    <div className="space-y-5">
      {/* Encabezado de alerta */}
      <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
        <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-red-800">Reporte de Evento Adverso</p>
          <p className="text-xs text-red-600 mt-0.5">
            Paciente: <strong>{rx?.patient_name}</strong> · {rx?.protocol_name}
          </p>
        </div>
      </div>

      {/* Fármaco implicado */}
      <div className="space-y-1">
        <Label className="text-xs">Fármaco implicado</Label>
        <Select value={form.drug_name} onValueChange={v => set("drug_name", v)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Seleccionar fármaco..." />
          </SelectTrigger>
          <SelectContent>
            {drugs.map((d, i) => (
              <SelectItem key={i} value={d.drug_name}>{d.drug_name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tipo de evento */}
      <div className="space-y-1">
        <Label className="text-xs">Tipo de evento adverso</Label>
        <Select value={form.event_type} onValueChange={v => set("event_type", v)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue placeholder="Seleccionar tipo..." />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map(t => (
              <SelectItem key={t} value={t}>{t}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {form.event_type === "Otro" && (
          <Input
            className="mt-2 text-sm"
            placeholder="Descripción del evento..."
            value={form.event_type_other}
            onChange={e => set("event_type_other", e.target.value)}
          />
        )}
      </div>

      {/* Grado CTCAE */}
      <div className="space-y-2">
        <Label className="text-xs">Grado de severidad (CTCAE)</Label>
        <div className="grid grid-cols-5 gap-2">
          {CTCAE_GRADES.map(({ grade, label }) => (
            <button
              key={grade}
              onClick={() => handleGrade(grade)}
              className={`py-2 px-1 text-center rounded-lg border-2 text-xs font-semibold transition-all ${
                form.ctcae_grade === grade
                  ? gradeColor(grade) + " border-current"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
              }`}
            >
              <span className="block text-base font-bold">{grade}</span>
              <span className="block text-[9px] leading-tight mt-0.5">
                {label.split("–")[1]?.trim().split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {CTCAE_GRADES.find(g => g.grade === form.ctcae_grade)?.label}
        </p>
      </div>

      {/* Tiempo y duración */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs flex items-center gap-1"><Clock className="h-3 w-3" /> Inicio tras infusión</Label>
          <Input
            placeholder="Ej: 10 min, 2 h..."
            value={form.onset_time}
            onChange={e => set("onset_time", e.target.value)}
            className="text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Duración del evento</Label>
          <Input
            placeholder="Ej: 30 min, 1 h..."
            value={form.duration}
            onChange={e => set("duration", e.target.value)}
            className="text-sm"
          />
        </div>
      </div>

      {/* Acción tomada */}
      <div className="space-y-1">
        <Label className="text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Acción tomada</Label>
        <Select value={form.action_taken} onValueChange={v => set("action_taken", v)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ACTIONS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        {form.action_taken === "Medicación de rescate" && (
          <Input
            className="mt-2 text-sm"
            placeholder="Medicamentos utilizados (ej: Difenhidramina 50mg IV, Adrenalina...)"
            value={form.rescue_medication}
            onChange={e => set("rescue_medication", e.target.value)}
          />
        )}
      </div>

      {/* Desenlace */}
      <div className="space-y-1">
        <Label className="text-xs">Desenlace</Label>
        <Select value={form.outcome} onValueChange={v => set("outcome", v)}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OUTCOMES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* Notas */}
      <div className="space-y-1">
        <Label className="text-xs">Observaciones clínicas adicionales</Label>
        <Textarea
          placeholder="Describe la evolución del evento, signos vitales, medidas adicionales..."
          value={form.notes}
          onChange={e => set("notes", e.target.value)}
          rows={3}
          className="text-sm"
        />
      </div>

      {/* Acciones */}
      <div className="flex gap-2 pt-1">
        <Button
          onClick={handleSubmit}
          disabled={saving || !isValid}
          className="flex-1 gap-2 bg-red-600 hover:bg-red-700"
        >
          <Zap className="h-4 w-4" />
          {saving ? "Guardando..." : "Registrar Evento Adverso"}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}