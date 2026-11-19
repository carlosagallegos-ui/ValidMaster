import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarRange, Check, AlertTriangle } from "lucide-react";
import PatientSearchSelect from "@/components/PatientSearchSelect";
import DoctorSearchSelect from "@/components/DoctorSearchSelect";
import { CHEMO_PROTOCOLS, calculateBSA, calculateDose, generateAlerts, getProtocolsByIndication } from "@/lib/chemoProtocols";
import { formatDate } from "@/lib/dateUtils";

const SHIFTS = ["Matutino", "Vespertino", "Nocturno"];
const todayKey = () => new Date().toISOString().split("T")[0];

const addDays = (key, days) => {
  const d = new Date(`${key}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

export default function TreatmentScheduler({ open, onOpenChange, onScheduled }) {
  const [patient, setPatient] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [doctorLicense, setDoctorLicense] = useState("");
  const [protocolKey, setProtocolKey] = useState("");
  const [startDate, setStartDate] = useState(todayKey());
  const [shift, setShift] = useState("Matutino");
  const [cycles, setCycles] = useState("");
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);

  const protocol = protocolKey ? CHEMO_PROTOCOLS[protocolKey] : null;
  const totalCycles = parseInt(cycles) || protocol?.total_cycles || 0;
  const grouped = getProtocolsByIndication();

  const scheduleDates = protocol && startDate
    ? Array.from({ length: totalCycles }, (_, i) => addDays(startDate, i * (protocol.cycle_days || 21)))
    : [];

  const reset = () => {
    setPatient(null);
    setDoctorName("");
    setDoctorLicense("");
    setProtocolKey("");
    setStartDate(todayKey());
    setShift("Matutino");
    setCycles("");
    setResult(null);
  };

  const handleClose = (value) => {
    if (!value) {
      setResult(null);
      setCycles("");
    }
    onOpenChange(value);
  };

  const buildDrug = (drug) => {
    const bsa = patient.bsa || calculateBSA(patient.weight_kg, patient.height_cm);
    const calc = calculateDose(drug, bsa, patient.weight_kg, patient.creatinine_clearance);
    const unit = drug.dose_basis === "AUC" ? "mg" : (drug.dose_basis || "").replace("/m²", "").replace("/kg", "");
    return {
      drug_name: drug.drug_name,
      prescribed_dose: calc,
      prescribed_volume: drug.volume_ml,
      calculated_dose: calc,
      dose_unit: unit,
      dose_per_unit: drug.dose_per_unit,
      dose_basis: drug.dose_basis,
      route: drug.route,
      infusion_time: drug.infusion_time,
      diluent: drug.diluent,
      volume_ml: drug.volume_ml,
      vial_size: drug.vial_size,
      vial_unit: drug.vial_unit,
      solution_type: drug.diluent || "SSN 0.9%",
      container_material: "Bolsa PVC",
      is_valid: true,
      variance_percent: 0,
      validation_notes: "Dosis calculada según protocolo",
    };
  };

  const handleGenerate = async () => {
    if (!patient || !protocol || !doctorName) return;
    setSaving(true);

    const existing = await base44.entities.Prescription.filter(
      { patient_id: patient.id, protocol_name: protocol.name },
      { limit: 200 }
    );
    const existingCycles = new Set(
      (existing.items || []).map(rx => rx.cycle_number).filter(n => typeof n === "number")
    );

    const bsa = patient.bsa || calculateBSA(patient.weight_kg, patient.height_cm);
    const drugs = (protocol.drugs || []).map(buildDrug);
    const alerts = generateAlerts(protocol.drugs || [], { ...patient, bsa });

    const payloads = [];
    scheduleDates.forEach((date, index) => {
      const cycle = index + 1;
      if (existingCycles.has(cycle)) return;
      payloads.push({
        prescription_type: "Oncologico",
        patient_id: patient.id,
        patient_name: patient.full_name,
        patient_nss: patient.nss || "",
        patient_bsa: bsa,
        patient_weight: patient.weight_kg,
        patient_height: patient.height_cm,
        prescribing_doctor: doctorName,
        doctor_license: doctorLicense,
        protocol_name: protocol.name,
        cycle_number: cycle,
        day_of_cycle: 1,
        prescription_date: todayKey(),
        scheduled_date: date,
        scheduled_shift: shift,
        validation_status: "Pendiente",
        cie10_code: patient.cie10_code || "",
        diagnosis: patient.diagnosis || "",
        drugs,
        alerts,
      });
    });

    if (payloads.length > 0) await base44.entities.Prescription.bulkCreate(payloads);

    setResult({ created: payloads.length, skipped: scheduleDates.length - payloads.length });
    setSaving(false);
    onScheduled?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarRange className="h-4 w-4 text-primary" /> Programar tratamiento completo
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Genera las mezclas de todos los ciclos del protocolo y las agenda por fecha y turno
          </p>
        </DialogHeader>

        {result ? (
          <div className="space-y-4 mt-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-1">
              <p className="text-sm font-semibold text-emerald-700 flex items-center gap-2">
                <Check className="h-4 w-4" /> {result.created} mezcla(s) programadas
              </p>
              {result.skipped > 0 && (
                <p className="text-xs text-emerald-700">
                  {result.skipped} ciclo(s) ya existían y no se duplicaron.
                </p>
              )}
              <p className="text-xs text-emerald-600">
                Aparecen en la programación de cada día y en el plan de tratamiento del paciente.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={reset}>Programar otro</Button>
              <Button onClick={() => handleClose(false)}>Cerrar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            <div>
              <Label className="text-xs">Paciente *</Label>
              <div className="mt-1">
                <PatientSearchSelect onSelect={setPatient} selectedPatient={patient} />
              </div>
            </div>

            <div>
              <Label className="text-xs">Médico prescriptor *</Label>
              <div className="mt-1">
                <DoctorSearchSelect
                  selectedDoctor={null}
                  onSelect={(doc) => {
                    setDoctorName(doc?.full_name || "");
                    setDoctorLicense(doc?.license || "");
                  }}
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Protocolo *</Label>
              <Select
                value={protocolKey}
                onValueChange={(v) => { setProtocolKey(v); setCycles(""); }}
              >
                <SelectTrigger className="mt-1"><SelectValue placeholder="Selecciona un protocolo" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(grouped).map(([indication, protocols]) => (
                    <SelectGroup key={indication}>
                      <SelectLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {indication}
                      </SelectLabel>
                      {protocols.map(p => (
                        <SelectItem key={p.key} value={p.key} className="text-xs">
                          {p.name} · cada {p.cycle_days} días
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Inicio del tratamiento</Label>
                <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Turno de preparación</Label>
                <Select value={shift} onValueChange={setShift}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SHIFTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Ciclos a programar</Label>
                <Input
                  type="number"
                  min={1}
                  value={cycles}
                  onChange={e => setCycles(e.target.value)}
                  placeholder={protocol ? String(protocol.total_cycles) : "—"}
                  className="mt-1"
                />
              </div>
            </div>

            {protocol && (
              <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {totalCycles} ciclo(s) · {scheduleDates.length} mezcla(s) a programar
                </p>
                <div className="max-h-40 overflow-y-auto space-y-1">
                  {scheduleDates.map((date, i) => (
                    <div key={date} className="flex items-center justify-between text-xs">
                      <span className="font-medium">Ciclo {i + 1}</span>
                      <span className="font-mono text-muted-foreground">{formatDate(date)} · {shift}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Fármacos: {(protocol.drugs || []).map(d => d.drug_name).join(" · ")}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {patient ? "Dosis calculadas con la SCT y peso actuales del paciente." : "Selecciona al paciente para calcular las dosis."}
                </p>
              </div>
            )}

            {patient && !patient.bsa && (
              <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                El paciente no tiene SCT guardada; se calculará con peso y talla al programar.
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => handleClose(false)}>Cancelar</Button>
              <Button
                onClick={handleGenerate}
                disabled={saving || !patient || !protocol || !doctorName}
                className="gap-2"
              >
                {saving ? "Programando..." : <><Check className="h-4 w-4" /> Programar tratamiento</>}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}