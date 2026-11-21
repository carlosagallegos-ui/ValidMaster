import { useState, useEffect } from "react";
import moment from "moment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AREAS_CENTRO } from "@/lib/areasCentro";
import { HOOD_ACTIVITY_TYPES, HOOD_EQUIPMENT_TYPES, HOOD_RESULTS } from "@/lib/hoodMaintenance";

const emptyForm = (userName) => ({
  equipment: "",
  equipment_type: "Campana de flujo laminar",
  area: "ÁREA DE PREPARACIÓN",
  activity_type: "Limpieza",
  performed_date: moment().format("YYYY-MM-DDTHH:mm"),
  performed_by: userName || "",
  provider: "",
  certificate_number: "",
  result: "Conforme",
  next_due_date: "",
  notes: "",
});

export default function HoodLogForm({ open, onOpenChange, userName, onSave }) {
  const [form, setForm] = useState(emptyForm(userName));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) setForm(emptyForm(userName));
  }, [open, userName]);

  const set = (field, value) => setForm(p => ({ ...p, [field]: value }));
  const isCertification = form.activity_type === "Certificación" || form.activity_type === "Mantenimiento / filtro";

  const handleSave = async () => {
    setSaving(true);
    await onSave({
      equipment: (form.equipment || "").trim().toUpperCase(),
      equipment_type: form.equipment_type,
      area: form.area,
      activity_type: form.activity_type,
      performed_date: new Date(form.performed_date).toISOString(),
      performed_by: form.performed_by,
      provider: (form.provider || "").trim(),
      certificate_number: (form.certificate_number || "").trim().toUpperCase(),
      result: form.result,
      next_due_date: form.next_due_date || null,
      notes: (form.notes || "").trim(),
    });
    setSaving(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Registrar actividad de campana</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <Label>Campana / equipo *</Label>
            <Input value={form.equipment} onChange={e => set("equipment", e.target.value.toUpperCase())} placeholder="Ej. Campana 1" />
          </div>
          <div>
            <Label>Tipo de equipo</Label>
            <Select value={form.equipment_type} onValueChange={v => set("equipment_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {HOOD_EQUIPMENT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Actividad *</Label>
            <Select value={form.activity_type} onValueChange={v => set("activity_type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {HOOD_ACTIVITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Área</Label>
            <Select value={form.area} onValueChange={v => set("area", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {AREAS_CENTRO.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Fecha y hora *</Label>
            <Input type="datetime-local" value={form.performed_date} onChange={e => set("performed_date", e.target.value)} />
          </div>
          <div>
            <Label>Realizó</Label>
            <Input value={form.performed_by} onChange={e => set("performed_by", e.target.value)} />
          </div>
          <div>
            <Label>Resultado</Label>
            <Select value={form.result} onValueChange={v => set("result", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {HOOD_RESULTS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Próximo vencimiento</Label>
            <Input type="date" value={form.next_due_date || ""} onChange={e => set("next_due_date", e.target.value)} />
          </div>
          {isCertification && (
            <>
              <div>
                <Label>Proveedor</Label>
                <Input value={form.provider} onChange={e => set("provider", e.target.value)} placeholder="Empresa certificadora" />
              </div>
              <div>
                <Label>No. de certificado</Label>
                <Input value={form.certificate_number} onChange={e => set("certificate_number", e.target.value.toUpperCase())} />
              </div>
            </>
          )}
          <div className="col-span-2">
            <Label>Observaciones</Label>
            <Textarea value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Hallazgos, acciones o pendientes" />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving || !form.equipment || !form.performed_date}>
            {saving ? "Guardando..." : "Registrar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}