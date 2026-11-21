import { useState, useEffect } from "react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TEMPERATURE_AREAS, TEMPERATURE_SHIFTS, areaDefaults, isExcursion, currentShift } from "@/lib/temperature";

const emptyForm = (userName) => ({
  area: "REFRIGERACIÓN",
  equipment: "",
  temperature: "",
  min_temp: 2,
  max_temp: 8,
  shift: currentShift(),
  recorded_at: moment().format("YYYY-MM-DDTHH:mm"),
  recorded_by: userName || "",
  corrective_action: "",
  notes: "",
});

export default function TemperatureForm({ open, onOpenChange, reading, userName, onSave }) {
  const [form, setForm] = useState(emptyForm(userName));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (reading) {
      setForm({
        ...reading,
        recorded_at: moment(reading.recorded_at).format("YYYY-MM-DDTHH:mm"),
      });
    } else {
      setForm(emptyForm(userName));
    }
  }, [open, reading, userName]);

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));

  const changeArea = (area) => {
    const defaults = areaDefaults(area);
    setForm(p => ({ ...p, area, min_temp: defaults.min, max_temp: defaults.max }));
  };

  const excursion = isExcursion({
    temperature: form.temperature,
    min_temp: form.min_temp,
    max_temp: form.max_temp,
  });

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      area: form.area,
      equipment: (form.equipment || "").trim().toUpperCase(),
      temperature: parseFloat(form.temperature),
      min_temp: parseFloat(form.min_temp),
      max_temp: parseFloat(form.max_temp),
      shift: form.shift,
      recorded_at: new Date(form.recorded_at).toISOString(),
      recorded_by: form.recorded_by,
      in_range: !excursion,
      corrective_action: (form.corrective_action || "").trim(),
      notes: (form.notes || "").trim(),
    });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{reading ? "Editar lectura de temperatura" : "Registrar lectura de temperatura"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <Label>Área *</Label>
            <Select value={form.area} onValueChange={changeArea}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TEMPERATURE_AREAS.map(a => (
                  <SelectItem key={a.area} value={a.area}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Equipo *</Label>
            <Input value={form.equipment} onChange={e => set("equipment", e.target.value.toUpperCase())} placeholder="Ej. Refrigerador 1" />
          </div>
          <div>
            <Label>Temperatura (°C) *</Label>
            <Input type="number" step="0.1" value={form.temperature} onChange={e => set("temperature", e.target.value)} placeholder="Ej. 4.5" />
          </div>
          <div>
            <Label>Turno</Label>
            <Select value={form.shift} onValueChange={v => set("shift", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TEMPERATURE_SHIFTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Rango mínimo (°C)</Label>
            <Input type="number" step="0.1" value={form.min_temp} onChange={e => set("min_temp", e.target.value)} />
          </div>
          <div>
            <Label>Rango máximo (°C)</Label>
            <Input type="number" step="0.1" value={form.max_temp} onChange={e => set("max_temp", e.target.value)} />
          </div>
          <div>
            <Label>Fecha y hora *</Label>
            <Input type="datetime-local" value={form.recorded_at} onChange={e => set("recorded_at", e.target.value)} />
          </div>
          <div>
            <Label>Registró</Label>
            <Input value={form.recorded_by} onChange={e => set("recorded_by", e.target.value)} />
          </div>
          {excursion && (
            <div className="col-span-2">
              <Label className="text-red-700">Acción correctiva (excursión de temperatura)</Label>
              <Textarea
                value={form.corrective_action}
                onChange={e => set("corrective_action", e.target.value)}
                placeholder="Transferencia de medicamentos, revisión de la unidad, aviso a mantenimiento..."
                className="mt-1"
              />
            </div>
          )}
          <div className="col-span-2">
            <Label>Observaciones</Label>
            <Input value={form.notes} onChange={e => set("notes", e.target.value.toUpperCase())} />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !form.equipment || form.temperature === "" || !form.recorded_at}>
            {saving ? "Guardando..." : reading ? "Actualizar" : "Registrar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}