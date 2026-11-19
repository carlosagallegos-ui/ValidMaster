import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Printer } from "lucide-react";
import { formatDate, formatDateTime, folioPrefix } from "@/lib/dateUtils";
import { getDrugStability } from "@/lib/drugStability";
import { computeBud } from "@/lib/bud";

function buildFolios(prescriptions) {
  const byDay = {};
  prescriptions.forEach(rx => {
    const dateKey = (rx.prescription_date || rx.created_date || "").slice(0, 10);
    if (!byDay[dateKey]) byDay[dateKey] = [];
    (rx.drugs || []).forEach(drug => {
      byDay[dateKey].push({ rx, drug });
    });
  });
  const folioMap = {};
  Object.entries(byDay).forEach(([dateKey, entries]) => {
    const prefix = folioPrefix(dateKey);
    entries.forEach((entry, idx) => {
      const key = `${entry.rx.id}-${entry.drug.drug_name}`;
      folioMap[key] = `${prefix}${String(idx + 1).padStart(4, "0")}`;
    });
  });
  return folioMap;
}

export default function Etiquetas() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [folioMap, setFolioMap] = useState({});

  useEffect(() => {
    Promise.all([
      base44.entities.Prescription.list("-prescription_date", 200),
      base44.entities.Medication.list("-created_date", 200),
      base44.entities.Patient.list("-created_date", 500),
    ]).then(([rxs, meds, pats]) => {
      setPrescriptions(rxs);
      setMedications(meds);
      setPatients(pats);
      setFolioMap(buildFolios(rxs));
      setLoading(false);
    });
  }, []);

  function getPatientNSS(rx) {
    // First try from prescription, then fallback to Patient entity
    const nss = (rx.patient_nss || "").trim();
    if (nss) return nss;
    const pat = patients.find(p => p.id === rx.patient_id || p.full_name === rx.patient_name);
    return (pat?.nss || "").trim() || "—";
  }

  function getMedInfo(drugName) {
    if (!drugName) return null;
    return medications.find(m =>
      m.drug_name?.toLowerCase().includes(drugName.toLowerCase()) ||
      drugName.toLowerCase().includes(m.drug_name?.toLowerCase())
    );
  }

  const allLabels = [];
  prescriptions.forEach(rx => {
    (rx.drugs || []).forEach(drug => {
      const key = `${rx.id}-${drug.drug_name}`;
      const stability = getDrugStability(drug.drug_name);
      const medInfo = getMedInfo(drug.drug_name);
      const nss = getPatientNSS(rx);
      const bud = computeBud(drug.drug_name, drug.validation_date || rx.validation_date || rx.created_date);
      allLabels.push({ rx, drug, folio: folioMap[key] || "—", stability, medInfo, nss, bud });
    });
  });

  const filtered = allLabels.filter(({ rx, drug }) =>
    !search ||
    rx.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
    drug.drug_name?.toLowerCase().includes(search.toLowerCase()) ||
    rx.protocol_name?.toLowerCase().includes(search.toLowerCase())
  );

  const printLabels = (labels) => {
    const win = window.open("", "_blank");
    win.document.write(`
      <html><head><title>Etiquetas de Mezclas</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; background: #fff; }
        .page { display: flex; flex-wrap: wrap; gap: 8px; padding: 12px; }
        .label {
          width: 10cm; height: 5cm;
          border: 1.5px solid #333; border-radius: 6px;
          padding: 5px 8px 6px;
          page-break-inside: avoid;
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        .label-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; }
        .logo-box {
          width: 1.5cm; height: 1.05cm;
          border: 1px dashed #c4c4c4; border-radius: 3px;
          display: flex; align-items: center; justify-content: center;
          font-size: 6px; color: #c4c4c4; letter-spacing: .12em;
        }
        .folio { font-size: 9px; color: #555; font-family: monospace; text-align: right; }
        .label-body { flex: 1; display: flex; min-height: 0; padding-top: 2px; }
        .drug { font-size: 13px; font-weight: bold; color: #000; margin: 0 0 1px; line-height: 1.15; }
        .dose { font-size: 12px; font-weight: bold; color: #0369a1; }
        .row { font-size: 9px; color: #333; margin-top: 1px; }
        .row b { font-weight: bold; }
        .vdivider { border: none; border-left: 1px solid #ddd; margin: 0 7px; }
        .patient { font-size: 11px; font-weight: bold; }
        .sub { font-size: 8.5px; color: #555; margin-top: 1px; }
        .col-left { flex: 1.1; display: flex; flex-direction: column; }
        .col-right { flex: 1; display: flex; flex-direction: column; }
        .label-foot { display: flex; gap: 5px; margin-top: 3px; }
        .bud-box { flex: 1.2; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 3px; padding: 2px 5px; }
        .bud-box.exp { background: #fef2f2; border-color: #fca5a5; }
        .bud-title { font-size: 7px; font-weight: bold; color: #b45309; text-transform: uppercase; letter-spacing: .04em; }
        .bud-box.exp .bud-title { color: #b91c1c; }
        .bud-val { font-size: 12px; font-weight: bold; color: #92400e; font-family: monospace; }
        .bud-box.exp .bud-val { color: #b91c1c; }
        .bud-sub { font-size: 6.5px; color: #a16207; }
        .bud-box.exp .bud-sub { color: #b91c1c; }
        .storage-box { flex: 1; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 3px; padding: 2px 5px; }
        .storage-box .s-title { font-size: 7px; font-weight: bold; color: #1e40af; text-transform: uppercase; }
        .storage-box .s-val { font-size: 8px; color: #1d4ed8; }
        @media print { body { margin: 0; } }
      </style></head><body>
      <div class="page">
        ${labels.map(({ rx, drug, folio, stability, medInfo, nss, bud }) => `
          <div class="label">
            <div class="label-head">
              <div class="logo-box">LOGO</div>
              <div class="folio">Folio: ${folio}</div>
            </div>
            <div class="label-body">
              <div class="col-left">
                <div class="drug">${drug.drug_name}</div>
                <div class="dose">${drug.prescribed_dose ?? drug.calculated_dose ?? "—"} ${drug.dose_unit || "mg"}</div>
                <div class="row">Vía: <b>${drug.route || "—"}</b> · Inf: <b>${drug.infusion_time || "—"}</b></div>
                ${drug.frequency ? `<div class="row">Frec: <b>${drug.frequency}</b>${drug.duration_days ? ` · <b>${drug.duration_days} días</b>` : ""}</div>` : ""}
                <div class="row">Solución: <b>${drug.solution_type || drug.diluent || "—"}</b>${(drug.prescribed_volume || drug.volume_ml) ? ` <b>${drug.prescribed_volume || drug.volume_ml} mL</b>` : ""}</div>
                <div class="row">Recipiente: <b>${drug.container_material || "—"}</b></div>
              </div>
              <div class="vdivider"></div>
              <div class="col-right">
                <div class="patient">${rx.patient_name}</div>
                <div class="sub">NSS: ${nss ?? (rx.patient_nss?.trim() || "—")}</div>
                <div class="sub">SCT: ${rx.patient_bsa?.toFixed(2) || "—"} m² · Peso: ${rx.patient_weight || "—"} kg</div>
                <div class="sub">${rx.protocol_name}</div>
                ${rx.prescription_type === "Oncologico" || !rx.prescription_type ? `<div class="sub">C${rx.cycle_number} D${rx.day_of_cycle}</div>` : `<div class="sub">${rx.prescription_type === "Antibiotico" ? "Antibiótico IV" : "NPT"}</div>`}
                <div class="sub">Médico: ${rx.prescribing_doctor}</div>
                <div class="sub">Fecha: ${formatDate(rx.prescription_date || rx.created_date)}</div>
              </div>
            </div>
            <div class="label-foot">
              <div class="bud-box ${bud.expired ? "exp" : ""}">
                <div class="bud-title">${bud.expired ? "⚠ Caducada · usar antes de" : "Usar antes de"}</div>
                <div class="bud-val">${formatDateTime(bud.limit)}</div>
                <div class="bud-sub">BUD ${bud.hours} h desde elaboración (${formatDateTime(bud.start)})${bud.known ? "" : " · estabilidad no documentada"}</div>
              </div>
              <div class="storage-box">
                <div class="s-title">🌡 Almacenamiento</div>
                <div class="s-val">${medInfo?.storage_conditions ? medInfo.storage_conditions + " · " : ""}${stability?.storage || "Temperatura ambiente"}</div>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Etiquetas de Mezclas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Una etiqueta por mezcla final · Incluye usar antes de (BUD), almacenamiento y espacio para el logo institucional
          </p>
        </div>
        <Button className="gap-2" onClick={() => printLabels(filtered)}>
          <Printer className="h-4 w-4" /> Imprimir todas ({filtered.length})
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar paciente, medicamento o protocolo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
          No se encontraron mezclas
        </div>
      ) : (
        <div className="flex flex-wrap gap-4">
          {filtered.map(({ rx, drug, folio, stability, medInfo, nss, bud }, i) => (
            <div key={i} className="bg-white border-2 border-border rounded-xl hover:border-primary/40 transition-colors flex flex-col" style={{width:'10cm'}}>
              <div className="flex flex-col" style={{height:'5cm'}}>
                <div className="flex items-start justify-between gap-2 px-3 pt-2">
                  <div className="flex items-center justify-center border border-dashed border-slate-300 rounded" style={{width:'1.5cm', height:'1.05cm'}}>
                    <span className="text-[6px] uppercase tracking-[0.12em] text-slate-300">Logo</span>
                  </div>
                  <span className="font-mono text-[9px] text-muted-foreground">Folio: {folio}</span>
                </div>
                <div className="flex flex-1 min-h-0 px-3 pt-0.5">
                  <div className="flex flex-col" style={{flex:'1.1'}}>
                    <p className="text-xs font-bold leading-tight">{drug.drug_name}</p>
                    <p className="text-xs font-bold text-primary">{drug.prescribed_dose ?? drug.calculated_dose ?? "—"} {drug.dose_unit || "mg"}</p>
                    <p className="text-[9px] text-muted-foreground">{drug.route || "—"} · {drug.infusion_time || "—"}</p>
                    {drug.frequency && <p className="text-[9px] font-medium text-muted-foreground">{drug.frequency}{drug.duration_days ? ` · ${drug.duration_days} días` : ""}</p>}
                    <p className="text-[9px] text-muted-foreground">{drug.solution_type || drug.diluent || "—"}{(drug.prescribed_volume || drug.volume_ml) ? ` · ${drug.prescribed_volume || drug.volume_ml} mL` : ""}</p>
                    <p className="text-[9px] text-muted-foreground">{drug.container_material || "—"}</p>
                  </div>
                  <div className="border-l border-border mx-2" />
                  <div className="flex flex-col" style={{flex:'1'}}>
                    <p className="text-xs font-semibold leading-tight">{rx.patient_name}</p>
                    <p className="text-[9px] text-muted-foreground">NSS: {nss}</p>
                    <p className="text-[9px] text-muted-foreground">SCT: {rx.patient_bsa?.toFixed(2) || "—"} m² · {rx.patient_weight || "—"} kg</p>
                    <p className="text-[9px] text-muted-foreground">{rx.protocol_name}</p>
                    {(rx.prescription_type === "Oncologico" || !rx.prescription_type)
                      ? <p className="text-[9px] text-muted-foreground">C{rx.cycle_number} D{rx.day_of_cycle}</p>
                      : <p className={`text-[9px] font-medium ${rx.prescription_type === "Antibiotico" ? "text-emerald-700" : "text-amber-700"}`}>{rx.prescription_type === "Antibiotico" ? "ATB IV" : "NPT"}</p>
                    }
                    <p className="text-[9px] text-muted-foreground">Dr. {rx.prescribing_doctor}</p>
                    <p className="text-[9px] text-muted-foreground">{formatDate(rx.prescription_date || rx.created_date)}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 px-3 pb-1.5 pt-1">
                  <div className={`rounded border px-1.5 py-0.5 ${bud.expired ? "border-red-300 bg-red-50" : "border-amber-300 bg-amber-50"}`} style={{flex:'1.2'}}>
                    <p className={`text-[7px] font-bold uppercase tracking-wide ${bud.expired ? "text-red-700" : "text-amber-700"}`}>
                      {bud.expired ? "⚠ Caducada · usar antes de" : "Usar antes de"}
                    </p>
                    <p className={`font-mono text-[11px] font-bold ${bud.expired ? "text-red-800" : "text-amber-800"}`}>{formatDateTime(bud.limit)}</p>
                    <p className={`text-[6.5px] leading-tight ${bud.expired ? "text-red-700" : "text-amber-700"}`}>
                      BUD {bud.hours} h desde elaboración ({formatDateTime(bud.start)}){bud.known ? "" : " · estabilidad no documentada"}
                    </p>
                  </div>
                  <div className="flex-1 rounded border border-blue-200 bg-blue-50 px-1.5 py-0.5">
                    <p className="text-[7px] font-bold uppercase tracking-wide text-blue-700">Almacenamiento</p>
                    <p className="text-[8px] leading-tight text-blue-800">{medInfo?.storage_conditions ? `${medInfo.storage_conditions} · ` : ""}{stability?.storage || "Temperatura ambiente"}</p>
                  </div>
                </div>
              </div>
              {/* Print button */}
              <div className="border-t border-border px-3 py-1.5">
                <Button variant="outline" size="sm" className="w-full gap-1.5 h-7 text-xs" onClick={() => printLabels([{ rx, drug, folio, stability, medInfo, nss, bud }])}>
                  <Printer className="h-3 w-3" /> Imprimir esta etiqueta
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}