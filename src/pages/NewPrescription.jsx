import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import PrescriptionRecipe from "@/components/PrescriptionRecipe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ArrowRight, Check, AlertTriangle, Syringe, Beaker, FlaskConical } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PatientSearchSelect from "@/components/PatientSearchSelect";
import DoctorSearchSelect from "@/components/DoctorSearchSelect";
import DrugSelector from "@/components/DrugSelector";
import AntibioticSelector from "@/components/AntibioticSelector";
import NPTForm from "@/components/NPTForm";
import { calculateDose, validateDose, generateAlerts } from "@/lib/chemoProtocols";
import DrugInteractionAlert from "@/components/DrugInteractionAlert";
import { detectInteractions } from "@/lib/drugInteractions";
import { calculateNPT, validateNPT } from "@/lib/nptCalculations";

const PRESCRIPTION_TYPES = [
  {
    value: "Oncologico",
    label: "Oncológico",
    description: "Quimioterapia con protocolos y validación por BSA",
    icon: FlaskConical,
    color: "border-violet-300 bg-violet-50 text-violet-700",
    activeColor: "border-violet-500 bg-violet-100 ring-2 ring-violet-400"
  },
  {
    value: "Antibiotico",
    label: "Antibiótico IV",
    description: "Antibióticos parenterales con dosificación por peso",
    icon: Syringe,
    color: "border-emerald-300 bg-emerald-50 text-emerald-700",
    activeColor: "border-emerald-500 bg-emerald-100 ring-2 ring-emerald-400"
  },
  {
    value: "NPT",
    label: "NPT",
    description: "Nutrición Parenteral Total con cálculo de macronutrientes",
    icon: Beaker,
    color: "border-amber-300 bg-amber-50 text-amber-700",
    activeColor: "border-amber-500 bg-amber-100 ring-2 ring-amber-400"
  }
];

export default function NewPrescription() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [prescriptionType, setPrescriptionType] = useState("Oncologico");

  // Step 1 — datos comunes
  const [patient, setPatient] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctorName, setDoctorName] = useState("");
  const [doctorLicense, setDoctorLicense] = useState("");
  const [cycleNumber, setCycleNumber] = useState(1);
  const [dayOfCycle, setDayOfCycle] = useState(1);
  const [prescriptionDate, setPrescriptionDate] = useState(new Date().toISOString().split("T")[0]);
  const [indication, setIndication] = useState("");

  // Step 2 — Oncológico
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [detectedProtocol, setDetectedProtocol] = useState(null);

  // Step 2 — Antibiótico
  const [antibioticDrugs, setAntibioticDrugs] = useState([]);

  // Step 2 — NPT
  const [nptData, setNptData] = useState({
    glucose_percent: 20,
    glucose_ml: 500,
    aminoacids_percent: 10,
    aminoacids_ml: 250,
    lipids_percent: 20,
    lipids_ml: 100,
    infusion_hours: 24,
    route: "Central",
    electrolytes: {
      nacl_meq: 40,
      kcl_meq: 20,
      calcium_gluconate_ml: 10,
      magnesium_sulfate_ml: 5,
      kh2po4_ml: 5,
      multivitamins_ml: 10,
      trace_elements_ml: 5
    }
  });

  // Step 3 — Oncológico
  const [drugDoses, setDrugDoses] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [saving, setSaving] = useState(false);
  const [showRecipe, setShowRecipe] = useState(false);
  const [savedRx, setSavedRx] = useState(null);

  // ── Handlers Oncológico ──
  const handleDrugsChange = (drugs) => {
    setOverrideInteractions(false);
    setSelectedDrugs(drugs);
    if (patient && drugs.length > 0) {
      const doses = drugs.map(drug => {
        const calc = calculateDose(drug, patient.bsa, patient.weight_kg, patient.creatinine_clearance);
        const unit = drug.dose_basis === "AUC" ? "mg" : drug.dose_basis.replace("/m²", "").replace("/kg", "");
        return {
          ...drug,
          calculated_dose: calc,
          prescribed_dose: calc,
          prescribed_volume: drug.volume_ml || 0,
          dose_unit: unit,
          solution_type: drug.diluent || "SSN 0.9%",
          container_material: "Bolsa PVC",
          is_valid: true,
          variance_percent: 0,
          validation_notes: "Dosis dentro del rango aceptable"
        };
      });
      setDrugDoses(doses);
      setAlerts(generateAlerts(drugs, patient));
    } else {
      setDrugDoses([]);
      setAlerts([]);
    }
  };

  const handleProtocolDetected = (detected) => setDetectedProtocol(detected);

  const handleDoseChange = (index, value) => {
    const updated = [...drugDoses];
    const prescribed = parseFloat(value) || 0;
    const validation = validateDose(prescribed, updated[index].calculated_dose);
    updated[index] = {
      ...updated[index],
      prescribed_dose: prescribed,
      is_valid: validation.isValid,
      variance_percent: validation.variance,
      validation_notes: validation.message
    };
    setDrugDoses(updated);
  };

  const handleVolumeChange = (index, value) => {
    const updated = [...drugDoses];
    updated[index] = { ...updated[index], prescribed_volume: parseFloat(value) || 0 };
    setDrugDoses(updated);
  };

  const handleSolutionChange = (index, value) => {
    const updated = [...drugDoses];
    updated[index] = { ...updated[index], solution_type: value };
    setDrugDoses(updated);
  };

  const handleContainerChange = (index, value) => {
    const updated = [...drugDoses];
    updated[index] = { ...updated[index], container_material: value };
    setDrugDoses(updated);
  };

  // ── Navegación ──
  const goToStep3 = () => {
    if (prescriptionType === "Oncologico") {
      if (drugDoses.length === 0 && selectedDrugs.length > 0 && patient) {
        handleDrugsChange(selectedDrugs);
      }
    }
    setStep(3);
  };

  const canGoToStep2 = patient && doctorName && doctorLicense;

  const canGoToStep3 = () => {
    if (prescriptionType === "Oncologico") return selectedDrugs.length > 0;
    if (prescriptionType === "Antibiotico") return antibioticDrugs.length > 0;
    if (prescriptionType === "NPT") {
      return (nptData.glucose_ml > 0 || nptData.aminoacids_ml > 0);
    }
    return false;
  };

  // ── Guardar ──
  const handleSubmit = async () => {
    setSaving(true);
    const user = await base44.auth.me();

    let data = {
      prescription_type: prescriptionType,
      patient_id: patient.id,
      patient_name: patient.full_name,
      patient_nss: patient.nss || "",
      patient_bsa: patient.bsa,
      patient_weight: patient.weight_kg,
      patient_height: patient.height_cm,
      prescribing_doctor: doctorName,
      doctor_license: doctorLicense,
      prescription_date: prescriptionDate,
      validation_status: "Pendiente",
      cie10_code: patient.cie10_code || "",
      diagnosis: patient.diagnosis || ""
    };

    if (prescriptionType === "Oncologico") {
      const protocolName = detectedProtocol ? detectedProtocol.name : "Protocolo personalizado";
      data = {
        ...data,
        protocol_name: protocolName,
        cycle_number: cycleNumber,
        day_of_cycle: dayOfCycle,
        drugs: drugDoses.map(d => ({
          drug_name: d.drug_name,
          prescribed_dose: d.prescribed_dose,
          prescribed_volume: d.prescribed_volume ?? d.volume_ml,
          dose_unit: d.dose_unit,
          calculated_dose: d.calculated_dose,
          dose_per_unit: d.dose_per_unit,
          dose_basis: d.dose_basis,
          route: d.route,
          infusion_time: d.infusion_time,
          diluent: d.diluent,
          volume_ml: d.volume_ml,
          vial_size: d.vial_size,
          vial_unit: d.vial_unit,
          solution_type: d.solution_type,
          container_material: d.container_material,
          is_valid: d.is_valid,
          variance_percent: d.variance_percent,
          validation_notes: d.validation_notes
        })),
        alerts
      };
    } else if (prescriptionType === "Antibiotico") {
      const hasInvalid = antibioticDrugs.some(d => !d.is_valid);
      data = {
        ...data,
        protocol_name: indication || "Antibioticoterapia",
        cycle_number: 1,
        day_of_cycle: 1,
        drugs: antibioticDrugs.map(d => ({
          drug_name: d.drug_name,
          prescribed_dose: d.prescribed_dose,
          calculated_dose: d.calculated_dose,
          dose_unit: "mg",
          dose_basis: d.dose_basis,
          dose_mg_kg: d.dose_mg_kg_typical,
          route: d.route,
          infusion_time: d.infusion_time,
          diluent: d.diluent,
          volume_ml: d.volume_ml,
          prescribed_volume: d.volume_ml,
          solution_type: d.solution_type || d.diluent,
          container_material: "Bolsa PVC",
          frequency: d.default_frequency,
          duration_days: d.duration_days || 7,
          is_valid: d.is_valid,
          validation_notes: d.validation_notes,
          variance_percent: 0
        })),
        alerts: hasInvalid ? ["⚠️ Existen dosis fuera del rango terapéutico. Requiere validación farmacéutica."] : []
      };
    } else if (prescriptionType === "NPT") {
      const nptResults = calculateNPT({ ...nptData, weight_kg: patient.weight_kg });
      const nptAlerts = validateNPT(nptResults, patient.weight_kg);
      data = {
        ...data,
        protocol_name: "Nutrición Parenteral Total",
        cycle_number: 1,
        day_of_cycle: 1,
        npt_components: {
          ...nptData,
          ...nptResults
        },
        drugs: [
          {
            drug_name: "Mezcla NPT",
            prescribed_dose: nptResults.kcal_total,
            dose_unit: "kcal",
            calculated_dose: nptResults.kcal_total,
            route: nptData.route || "Central",
            infusion_time: `${nptData.infusion_hours || 24}h`,
            volume_ml: nptResults.total_volume_ml,
            prescribed_volume: nptResults.total_volume_ml,
            solution_type: "Mezcla Ternaria",
            container_material: "Bolsa EVA",
            is_valid: nptAlerts.filter(a => a.startsWith("🔴")).length === 0,
            validation_notes: nptAlerts.length > 0 ? nptAlerts[0] : "NPT calculada sin alertas críticas",
            variance_percent: 0
          }
        ],
        alerts: nptAlerts
      };
    }

    const created = await base44.entities.Prescription.create(data);
    setSavedRx(created);
    setShowRecipe(true);
    setSaving(false);
  };

  const hasOutOfRange = prescriptionType === "Oncologico"
    ? drugDoses.some(d => !d.is_valid)
    : prescriptionType === "Antibiotico"
    ? antibioticDrugs.some(d => !d.is_valid)
    : false;

  // Detección de interacciones en tiempo real
  const currentDrugNames = prescriptionType === "Oncologico"
    ? selectedDrugs.map(d => d.drug_name)
    : prescriptionType === "Antibiotico"
    ? antibioticDrugs.map(d => d.drug_name)
    : [];
  const activeInteractions = detectInteractions(currentDrugNames);
  const hasContraindicated = activeInteractions.some(i => i.severity === "CONTRAINDICADA");
  const [overrideInteractions, setOverrideInteractions] = useState(false);

  const typeConfig = PRESCRIPTION_TYPES.find(t => t.value === prescriptionType);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Nueva Prescripción</h1>
          <p className="text-sm text-muted-foreground">Paso {step} de 3 · {typeConfig?.label}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-2 items-center">
        {[1, 2, 3].map(s => (
          <div key={s} className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
        {activeInteractions.length > 0 && step === 2 && (
          <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse ${
            hasContraindicated ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
          }`}>
            {hasContraindicated ? "🚫 Contraindicación" : `⚠️ ${activeInteractions.length} interacción(es)`}
          </span>
        )}
      </div>

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Selección de tipo */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-semibold">Tipo de Prescripción</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PRESCRIPTION_TYPES.map(type => {
                const Icon = type.icon;
                const isActive = prescriptionType === type.value;
                return (
                  <button
                    key={type.value}
                    onClick={() => {
                      setPrescriptionType(type.value);
                      setSelectedDrugs([]);
                      setAntibioticDrugs([]);
                      setDrugDoses([]);
                    }}
                    className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all ${
                      isActive ? type.activeColor : "border-border bg-card hover:bg-muted/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? "" : "bg-muted"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{type.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{type.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Paciente */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-semibold">Datos del Paciente</h2>
            <PatientSearchSelect onSelect={setPatient} selectedPatient={patient} />
            {patient && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-muted/40 rounded-lg p-3">
                <div><span className="text-muted-foreground">Peso: </span><span className="font-mono font-medium">{patient.weight_kg} kg</span></div>
                {patient.bsa && <div><span className="text-muted-foreground">SCT: </span><span className="font-mono font-medium">{patient.bsa?.toFixed(2)} m²</span></div>}
                {patient.creatinine_clearance && <div><span className="text-muted-foreground">CrCl: </span><span className="font-mono font-medium">{patient.creatinine_clearance} mL/min</span></div>}
                {patient.allergies && <div className="col-span-2"><span className="text-muted-foreground">Alergias: </span><span className="font-medium text-amber-600">{patient.allergies}</span></div>}
              </div>
            )}
          </div>

          {/* Médico */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-semibold">Médico Prescriptor</h2>
            <DoctorSearchSelect
              selectedDoctor={selectedDoctor}
              onSelect={(doc) => {
                setSelectedDoctor(doc);
                if (doc) {
                  setDoctorName(doc.full_name);
                  setDoctorLicense(doc.license);
                } else {
                  setDoctorName("");
                  setDoctorLicense("");
                }
              }}
            />
          </div>

          {/* Datos generales */}
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            <h2 className="font-semibold">Datos Generales</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Fecha de prescripción</Label>
                <Input type="date" value={prescriptionDate} onChange={e => setPrescriptionDate(e.target.value)} />
              </div>
              {prescriptionType === "Oncologico" && (
                <>
                  <div>
                    <Label>Número de ciclo</Label>
                    <Input type="number" min={1} value={cycleNumber} onChange={e => setCycleNumber(parseInt(e.target.value) || 1)} />
                  </div>
                  <div>
                    <Label>Día del ciclo</Label>
                    <Input type="number" min={1} value={dayOfCycle} onChange={e => setDayOfCycle(parseInt(e.target.value) || 1)} />
                  </div>
                </>
              )}
              {prescriptionType === "Antibiotico" && (
                <div className="sm:col-span-2">
                  <Label>Indicación clínica</Label>
                  <Input placeholder="Ej: Sepsis de foco abdominal, Neumonía nosocomial..." value={indication} onChange={e => setIndication(e.target.value)} />
                </div>
              )}
              {prescriptionType === "NPT" && (
                <div className="sm:col-span-2">
                  <Label>Indicación / Diagnóstico nutricional</Label>
                  <Input placeholder="Ej: Desnutrición severa, Postquirúrgico..." value={indication} onChange={e => setIndication(e.target.value)} />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep(2)} disabled={!canGoToStep2} className="gap-2">
              Siguiente <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div className="space-y-6">

          {/* Resumen del paciente */}
          <div className="bg-muted/40 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><span className="text-muted-foreground">Paciente: </span><span className="font-medium">{patient?.full_name}</span></div>
            <div><span className="text-muted-foreground">Peso: </span><span className="font-mono font-medium">{patient?.weight_kg} kg</span></div>
            {patient?.bsa && <div><span className="text-muted-foreground">SCT: </span><span className="font-mono font-medium">{patient?.bsa?.toFixed(2)} m²</span></div>}
            {patient?.creatinine_clearance && <div><span className="text-muted-foreground">CrCl: </span><span className="font-mono font-medium">{patient?.creatinine_clearance} mL/min</span></div>}
          </div>

          {/* ── Oncológico ── */}
          {prescriptionType === "Oncologico" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div>
                <h2 className="font-semibold">Medicamentos Prescritos</h2>
                <p className="text-sm text-muted-foreground mt-1">Agregue los medicamentos y el sistema detectará el protocolo automáticamente</p>
              </div>
              <DrugSelector
                selectedDrugs={selectedDrugs}
                onDrugsChange={handleDrugsChange}
                onProtocolDetected={handleProtocolDetected}
              />
              {selectedDrugs.length >= 2 && (
                <DrugInteractionAlert drugNames={selectedDrugs.map(d => d.drug_name)} />
              )}
              {selectedDrugs.length > 0 && (
                <div className={`rounded-xl border p-4 ${detectedProtocol ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                  {detectedProtocol ? (
                    <div>
                      <p className="text-sm font-semibold text-emerald-700">✅ Protocolo detectado: {detectedProtocol.name}</p>
                      <p className="text-xs text-emerald-600 mt-1">
                        {detectedProtocol.indication} · Ciclo cada {detectedProtocol.cycle_days} días · {detectedProtocol.total_cycles} ciclos · Coincidencia {Math.round(detectedProtocol.score * 100)}%
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-amber-700">⚠️ No se identificó un protocolo estándar. Se guardará como prescripción personalizada.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Antibiótico ── */}
          {prescriptionType === "Antibiotico" && (
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div>
                <h2 className="font-semibold">Antibióticos Prescritos</h2>
                <p className="text-sm text-muted-foreground mt-1">Seleccione el antibiótico. Las dosis se calculan automáticamente por peso.</p>
              </div>
              <AntibioticSelector
                selectedDrugs={antibioticDrugs}
                onDrugsChange={(drugs) => { setOverrideInteractions(false); setAntibioticDrugs(drugs); }}
                patientWeight={patient?.weight_kg}
              />
              {antibioticDrugs.length >= 2 && (
                <DrugInteractionAlert drugNames={antibioticDrugs.map(d => d.drug_name)} />
              )}
            </div>
          )}

          {/* ── NPT ── */}
          {prescriptionType === "NPT" && (
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-6 space-y-1">
                <h2 className="font-semibold">Formulación de NPT</h2>
                <p className="text-sm text-muted-foreground">Complete los volúmenes y concentraciones de cada componente.</p>
              </div>
              <NPTForm
                nptData={nptData}
                onChange={setNptData}
                patientWeight={patient?.weight_kg}
              />
            </div>
          )}

          {/* Bloqueo por contraindicación grave */}
          {hasContraindicated && !overrideInteractions && canGoToStep3() && (
            <div className="bg-red-50 border-2 border-red-400 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚫</span>
                <div>
                  <p className="font-bold text-red-800 text-sm">Contraindicación detectada — Revisión obligatoria</p>
                  <p className="text-xs text-red-600 mt-1">
                    Existe al menos una interacción CONTRAINDICADA entre los fármacos seleccionados.
                    Para continuar, el médico debe revisar y confirmar explícitamente.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOverrideInteractions(true)}
                className="w-full text-sm font-semibold text-red-700 border-2 border-red-400 rounded-lg py-2 hover:bg-red-100 transition-colors"
              >
                Entendido — Asumo la responsabilidad clínica y continúo
              </button>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Anterior
            </Button>
            <Button
              onClick={goToStep3}
              disabled={!canGoToStep3() || (hasContraindicated && !overrideInteractions)}
              className={`gap-2 ${hasContraindicated && !overrideInteractions ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              Siguiente <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 3 — Revisión y confirmación ── */}
      {step === 3 && (
        <div className="space-y-6">

          {/* Interacciones farmacológicas */}
          {prescriptionType === "Oncologico" && drugDoses.length >= 2 && (
            <DrugInteractionAlert drugNames={drugDoses.map(d => d.drug_name)} />
          )}
          {prescriptionType === "Antibiotico" && antibioticDrugs.length >= 2 && (
            <DrugInteractionAlert drugNames={antibioticDrugs.map(d => d.drug_name)} />
          )}

          {/* Alertas */}
          {alerts.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1">
              <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
                <AlertTriangle className="h-4 w-4" /> Alertas Clínicas
              </div>
              {alerts.map((a, i) => <p key={i} className="text-sm text-amber-700">{a}</p>)}
            </div>
          )}

          {/* Resumen del paciente */}
          <div className="bg-muted/50 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div><span className="text-muted-foreground">Paciente: </span><span className="font-medium">{patient?.full_name}</span></div>
            {patient?.bsa && <div><span className="text-muted-foreground">SCT: </span><span className="font-mono font-medium">{patient?.bsa?.toFixed(2)} m²</span></div>}
            <div><span className="text-muted-foreground">Peso: </span><span className="font-mono font-medium">{patient?.weight_kg} kg</span></div>
            <div><span className="text-muted-foreground">Tipo: </span><span className="font-medium">{typeConfig?.label}</span></div>
          </div>

          {/* ── Revisión Oncológico ── */}
          {prescriptionType === "Oncologico" && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold">Validación de Dosis</h2>
                <p className="text-xs text-muted-foreground mt-1">Modifique las dosis prescritas. Tolerancia aceptable: ±10%</p>
              </div>
              <div className="divide-y divide-border">
                {drugDoses.map((drug, i) => (
                  <div key={i} className={`p-4 sm:p-6 ${!drug.is_valid ? "bg-amber-50/30" : ""}`}>
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {drug.is_valid
                            ? <Check className="h-4 w-4 text-emerald-500" />
                            : <AlertTriangle className="h-4 w-4 text-amber-500" />}
                          <span className="font-semibold text-sm">{drug.drug_name}</span>
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{drug.route}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div><span className="text-muted-foreground block">Referencia</span><span className="font-mono font-medium">{drug.dose_per_unit} {drug.dose_basis}</span></div>
                          <div><span className="text-muted-foreground block">Calculada</span><span className="font-mono font-medium text-primary">{drug.calculated_dose} {drug.dose_unit}</span></div>
                          <div><span className="text-muted-foreground block">Infusión</span><span>{drug.infusion_time}</span></div>
                          <div><span className="text-muted-foreground block">Vol. estándar</span><span className="font-mono">{drug.volume_ml > 0 ? `${drug.volume_ml} mL` : "—"}</span></div>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Tipo de solución</Label>
                          <Select value={drug.solution_type} onValueChange={v => handleSolutionChange(i, v)}>
                            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SSN 0.9%">SSN 0.9%</SelectItem>
                              <SelectItem value="SG 5%">SG 5%</SelectItem>
                              <SelectItem value="Hartmann">Hartmann</SelectItem>
                              <SelectItem value="Agua inyectable">Agua inyectable</SelectItem>
                              <SelectItem value="Directo">Directo (sin dilución)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="sm:w-auto flex flex-col sm:flex-row gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs">Dosis prescrita ({drug.dose_unit})</Label>
                          <Input type="number" step="0.01" value={drug.prescribed_dose} onChange={e => handleDoseChange(i, e.target.value)}
                            className={`font-mono w-36 ${!drug.is_valid ? "border-amber-400 focus-visible:ring-amber-400" : ""}`} />
                          <div className="text-xs space-y-0.5">
                            <span className="text-muted-foreground">Calculada: </span>
                            <span className="font-mono font-medium text-primary">{drug.calculated_dose} {drug.dose_unit}</span>
                            {drug.variance_percent !== 0 && (
                              <p className={`font-medium ${drug.is_valid ? "text-emerald-600" : "text-amber-600"}`}>
                                {drug.variance_percent > 0 ? "+" : ""}{drug.variance_percent}% vs calculado
                              </p>
                            )}
                          </div>
                        </div>
                        {drug.volume_ml > 0 && (
                          <div className="space-y-2">
                            <Label className="text-xs">Volumen prescrito (mL)</Label>
                            <Input type="number" step="1" value={drug.prescribed_volume ?? drug.volume_ml} onChange={e => handleVolumeChange(i, e.target.value)}
                              className={`font-mono w-36 ${
                                drug.prescribed_volume > 0 && drug.volume_ml > 0 &&
                                Math.abs((drug.prescribed_volume - drug.volume_ml) / drug.volume_ml) > 0.10
                                  ? "border-amber-400 focus-visible:ring-amber-400" : ""
                              }`} />
                            <div className="text-xs space-y-0.5">
                              <span className="text-muted-foreground">Estándar: </span>
                              <span className="font-mono font-medium text-primary">{drug.volume_ml} mL</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Revisión Antibiótico ── */}
          {prescriptionType === "Antibiotico" && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-semibold">Resumen de Antibioticoterapia</h2>
                <p className="text-xs text-muted-foreground mt-1">Indicación: {indication || "No especificada"}</p>
              </div>
              <div className="divide-y divide-border">
                {antibioticDrugs.map((drug, i) => (
                  <div key={i} className={`p-5 ${!drug.is_valid ? "bg-amber-50/30" : ""}`}>
                    <div className="flex items-start gap-3 flex-wrap">
                      {drug.is_valid
                        ? <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        : <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{drug.drug_name}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 text-xs">
                          <div><span className="text-muted-foreground block">Dosis prescrita</span><span className="font-mono font-medium text-primary">{drug.prescribed_dose} mg</span></div>
                          <div><span className="text-muted-foreground block">Frecuencia</span><span className="font-medium">{drug.default_frequency}</span></div>
                          <div><span className="text-muted-foreground block">Duración</span><span className="font-medium">{drug.duration_days || 7} días</span></div>
                          <div><span className="text-muted-foreground block">Dilución</span><span className="font-mono">{drug.diluent} {drug.volume_ml} mL</span></div>
                          <div><span className="text-muted-foreground block">Rango terapéutico</span><span className="font-mono">{drug.min_dose}–{drug.max_dose} mg</span></div>
                          <div><span className="text-muted-foreground block">Infusión</span><span>{drug.infusion_time}</span></div>
                        </div>
                        {!drug.is_valid && <p className="text-xs text-amber-600 mt-1">{drug.validation_notes}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Revisión NPT ── */}
          {prescriptionType === "NPT" && (() => {
            const nptResults = calculateNPT({ ...nptData, weight_kg: patient?.weight_kg });
            const nptAlerts = validateNPT(nptResults, patient?.weight_kg);
            const e = nptData.electrolytes || {};
            return (
              <div className="space-y-4">
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border">
                    <h2 className="font-semibold">Resumen de NPT</h2>
                  </div>
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-muted/40 rounded-lg p-3"><span className="text-muted-foreground block">Glucosa {nptData.glucose_percent}%</span><span className="font-mono font-medium">{nptData.glucose_ml} mL</span></div>
                      <div className="bg-muted/40 rounded-lg p-3"><span className="text-muted-foreground block">Aminoácidos {nptData.aminoacids_percent}%</span><span className="font-mono font-medium">{nptData.aminoacids_ml} mL</span></div>
                      <div className="bg-muted/40 rounded-lg p-3"><span className="text-muted-foreground block">Lípidos {nptData.lipids_percent}%</span><span className="font-mono font-medium">{nptData.lipids_ml || 0} mL</span></div>
                      <div className="bg-primary/5 rounded-lg p-3 border border-primary/20"><span className="text-muted-foreground block">Vol. total</span><span className="font-mono font-bold text-primary">{nptResults.total_volume_ml} mL</span></div>
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200"><span className="text-muted-foreground block">Kcal totales</span><span className="font-mono font-bold text-amber-700">{nptResults.kcal_total} kcal</span></div>
                      <div className="bg-emerald-50 rounded-lg p-3 border border-emerald-200"><span className="text-muted-foreground block">Proteínas</span><span className="font-mono font-bold text-emerald-700">{nptResults.protein_g} g</span></div>
                      <div className="bg-muted/40 rounded-lg p-3"><span className="text-muted-foreground block">Osmolaridad</span><span className={`font-mono font-bold ${nptResults.osmolarity_mosm_l > 900 ? "text-red-600" : "text-foreground"}`}>{nptResults.osmolarity_mosm_l} mOsm/L</span></div>
                      <div className="bg-muted/40 rounded-lg p-3"><span className="text-muted-foreground block">Velocidad infusión</span><span className="font-mono font-bold">{nptResults.infusion_rate_ml_h} mL/h</span></div>
                      <div className="bg-muted/40 rounded-lg p-3"><span className="text-muted-foreground block">Vía</span><span className="font-mono font-bold">{nptData.route}</span></div>
                    </div>
                    {/* Electrolitos */}
                    <div className="border-t border-border pt-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Electrolitos y Aditivos</p>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {e.nacl_meq > 0 && <span className="bg-muted rounded-full px-2.5 py-1 font-mono">NaCl {e.nacl_meq} mEq</span>}
                        {e.kcl_meq > 0 && <span className="bg-muted rounded-full px-2.5 py-1 font-mono">KCl {e.kcl_meq} mEq</span>}
                        {e.calcium_gluconate_ml > 0 && <span className="bg-muted rounded-full px-2.5 py-1 font-mono">Ca Gluconato {e.calcium_gluconate_ml} mL</span>}
                        {e.magnesium_sulfate_ml > 0 && <span className="bg-muted rounded-full px-2.5 py-1 font-mono">MgSO₄ {e.magnesium_sulfate_ml} mL</span>}
                        {e.kh2po4_ml > 0 && <span className="bg-muted rounded-full px-2.5 py-1 font-mono">KH₂PO₄ {e.kh2po4_ml} mL</span>}
                        {e.multivitamins_ml > 0 && <span className="bg-muted rounded-full px-2.5 py-1 font-mono">Multivit. {e.multivitamins_ml} mL</span>}
                        {e.trace_elements_ml > 0 && <span className="bg-muted rounded-full px-2.5 py-1 font-mono">Oligoelem. {e.trace_elements_ml} mL</span>}
                      </div>
                    </div>
                    {nptAlerts.length > 0 && (
                      <div className="space-y-1.5">
                        {nptAlerts.map((a, i) => (
                          <div key={i} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span>{a}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {hasOutOfRange && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-700 font-medium">
                ⚠️ Existen dosis fuera del rango aceptable. Quedará como "Pendiente" para revisión del farmacéutico.
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Anterior
            </Button>
            <Button onClick={handleSubmit} disabled={saving} className="gap-2">
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
              ) : (
                <><Check className="h-4 w-4" /> Guardar Prescripción</>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Recipe modal */}
      {showRecipe && savedRx && (
        <PrescriptionRecipe rx={savedRx} onClose={() => navigate("/")} />
      )}
    </div>
  );
}