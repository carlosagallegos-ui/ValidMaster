import { useState } from "react";
import { getDoseAdjustmentRecommendations, SEVERITY_CONFIG } from "@/lib/renalHepaticAdjustments";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, ChevronDown, ChevronUp, AlertTriangle, FlaskConical } from "lucide-react";

export default function DoseAdjustmentPanel({ drugs, patient, onApplyAdjustment }) {
  const [crcl, setCrcl] = useState(patient?.creatinine_clearance || "");
  const [bilirubin, setBilirubin] = useState(patient?.bilirubin || "");
  const [expanded, setExpanded] = useState({});

  const crclNum = parseFloat(crcl) || 0;
  const biliNum = parseFloat(bilirubin) || 0;

  const recommendations = getDoseAdjustmentRecommendations(
    drugs.filter(d => d.drug_name && d.drug_name !== "Mezcla NPT"),
    crclNum > 0 ? crclNum : null,
    biliNum > 0 ? biliNum : null
  );

  const hasAlerts = recommendations.length > 0;
  const hasContraindicated = recommendations.some(r => r.severity === "contraindicated");
  const hasSevere = recommendations.some(r => r.severity === "severe");

  return (
    <div className="space-y-4">
      {/* Inputs de laboratorio */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-4 w-4 text-blue-600" />
          <p className="text-sm font-semibold text-blue-800">Parámetros de Función Renal y Hepática</p>
        </div>
        <p className="text-xs text-blue-600">Ingrese los valores de laboratorio actuales para calcular ajustes de dosis personalizados.</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-blue-700">TFG / CrCl (mL/min)</Label>
            <Input
              type="number"
              min="0"
              max="200"
              step="1"
              placeholder={patient?.creatinine_clearance ? `Previo: ${patient.creatinine_clearance}` : "Ej: 75"}
              value={crcl}
              onChange={e => setCrcl(e.target.value)}
              className="text-sm h-8 bg-white"
            />
            {crclNum > 0 && (
              <p className={`text-xs font-medium ${
                crclNum >= 60 ? "text-emerald-600" :
                crclNum >= 30 ? "text-amber-600" : "text-red-600"
              }`}>
                {crclNum >= 90 ? "Normal" : crclNum >= 60 ? "Levemente reducida" : crclNum >= 30 ? "Moderadamente reducida" : "Severamente reducida"}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-blue-700">Bilirrubina Total (mg/dL)</Label>
            <Input
              type="number"
              min="0"
              max="30"
              step="0.1"
              placeholder="Ej: 1.2"
              value={bilirubin}
              onChange={e => setBilirubin(e.target.value)}
              className="text-sm h-8 bg-white"
            />
            {biliNum > 0 && (
              <p className={`text-xs font-medium ${
                biliNum < 1.2 ? "text-emerald-600" :
                biliNum < 3.0 ? "text-amber-600" : "text-red-600"
              }`}>
                {biliNum < 1.2 ? "Normal" : biliNum < 3.0 ? "Elevada leve-moderada" : "Elevada severa"}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sin alertas */}
      {(crclNum > 0 || biliNum > 0) && !hasAlerts && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <span className="text-emerald-600 text-lg">✅</span>
          <p className="text-sm text-emerald-700 font-medium">Todos los fármacos pueden administrarse a dosis estándar con los valores actuales.</p>
        </div>
      )}

      {/* Recomendaciones */}
      {hasAlerts && (
        <div className={`rounded-xl border-2 p-4 space-y-3 ${
          hasContraindicated ? "border-red-500 bg-red-50" :
          hasSevere ? "border-orange-400 bg-orange-50" :
          "border-yellow-400 bg-yellow-50"
        }`}>
          <div className={`flex items-center gap-2 font-semibold text-sm ${
            hasContraindicated ? "text-red-800" : hasSevere ? "text-orange-800" : "text-yellow-800"
          }`}>
            <AlertTriangle className="h-4 w-4" />
            <span>
              {hasContraindicated
                ? `🚫 ${recommendations.filter(r => r.severity === "contraindicated").length} fármaco(s) CONTRAINDICADO(s) con función actual`
                : `${recommendations.length} ajuste(s) de dosis requerido(s)`
              }
            </span>
          </div>

          <div className="space-y-2">
            {recommendations.map((rec, idx) => {
              const style = SEVERITY_CONFIG[rec.severity] || SEVERITY_CONFIG.moderate;
              const isOpen = expanded[idx] !== false;
              return (
                <div key={idx} className={`rounded-lg border ${style.border} ${style.bg} overflow-hidden`}>
                  <button
                    className="w-full flex items-start gap-3 p-3 text-left"
                    onClick={() => setExpanded(prev => ({ ...prev, [idx]: !(prev[idx] !== false) }))}
                  >
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full shrink-0 mt-0.5 ${style.badge}`}>
                      {style.icon} {rec.type === "renal" ? "RENAL" : "HEPÁTICO"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${style.text}`}>{rec.drugName}</p>
                      <p className={`text-xs ${style.text} opacity-80`}>{rec.label}</p>
                      {rec.adjustedDose !== null && rec.adjustedDose !== undefined && (
                        <p className={`text-xs font-semibold mt-0.5 ${style.text}`}>
                          Dosis sugerida: <span className="font-mono">{rec.adjustedDose} {rec.doseUnit}</span>
                          {rec.adjustment ? ` (${Math.round(rec.adjustment * 100)}% de ${rec.originalDose} ${rec.doseUnit})` : ""}
                        </p>
                      )}
                    </div>
                    {isOpen
                      ? <ChevronUp className={`h-4 w-4 shrink-0 ${style.text}`} />
                      : <ChevronDown className={`h-4 w-4 shrink-0 ${style.text}`} />
                    }
                  </button>

                  {isOpen && (
                    <div className={`px-4 pb-3 space-y-2 border-t ${style.border}`}>
                      <p className={`text-xs mt-2 ${style.text} font-medium`}>{rec.recommendation}</p>
                      {rec.adjustedDose !== null && rec.adjustedDose !== undefined && onApplyAdjustment && (
                        <button
                          onClick={() => onApplyAdjustment(rec.drugName, rec.adjustedDose)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold border-2 ${style.border} ${style.text} hover:opacity-80 transition-opacity`}
                        >
                          ✓ Aplicar dosis ajustada ({rec.adjustedDose} {rec.doseUnit})
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Placeholder cuando no hay valores */}
      {crclNum === 0 && biliNum === 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl text-xs text-muted-foreground">
          <Activity className="h-4 w-4 shrink-0" />
          <span>Ingrese TFG/CrCl y/o Bilirrubina para obtener recomendaciones de ajuste de dosis personalizadas.</span>
        </div>
      )}
    </div>
  );
}