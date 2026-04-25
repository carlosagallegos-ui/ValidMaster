import { detectInteractions, SEVERITY_STYLES } from "@/lib/drugInteractions";
import { AlertTriangle, ShieldX, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

function SeverityIcon({ severity }) {
  if (severity === "CONTRAINDICADA") return <ShieldX className="h-4 w-4 shrink-0" />;
  if (severity === "GRAVE") return <AlertTriangle className="h-4 w-4 shrink-0" />;
  return <Zap className="h-4 w-4 shrink-0" />;
}

export default function DrugInteractionAlert({ drugNames }) {
  const interactions = detectInteractions(drugNames);
  // Auto-expand contraindicadas y graves por defecto
  const [expanded, setExpanded] = useState(() =>
    Object.fromEntries(interactions.map((i, idx) => [idx, i.severity !== "MODERADA"]))
  );

  if (interactions.length === 0) return null;

  const hasContraindicated = interactions.some(i => i.severity === "CONTRAINDICADA");
  const hasSevere = interactions.some(i => i.severity === "GRAVE");

  const toggleExpand = (idx) => setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));

  return (
    <div className={`rounded-xl border-2 p-4 space-y-3 ${
      hasContraindicated ? "border-red-500 bg-red-50" :
      hasSevere ? "border-orange-400 bg-orange-50" :
      "border-yellow-400 bg-yellow-50"
    }`}>
      {/* Header */}
      <div className={`flex items-center gap-2 font-semibold text-sm ${
        hasContraindicated ? "text-red-800" :
        hasSevere ? "text-orange-800" :
        "text-yellow-800"
      }`}>
        {hasContraindicated
          ? <ShieldX className="h-5 w-5" />
          : hasSevere
          ? <AlertTriangle className="h-5 w-5" />
          : <Zap className="h-5 w-5" />
        }
        <span>
          {hasContraindicated
            ? `⚠️ ${interactions.filter(i => i.severity === "CONTRAINDICADA").length} interacción(es) CONTRAINDICADA(s) detectada(s)`
            : hasSevere
            ? `${interactions.length} interacción(es) farmacológica(s) detectada(s)`
            : `${interactions.length} interacción(es) moderada(s) detectada(s)`
          }
        </span>
      </div>

      {/* Interactions list */}
      <div className="space-y-2">
        {interactions.map((interaction, idx) => {
          const style = SEVERITY_STYLES[interaction.severity];
          const isOpen = expanded[idx];
          return (
            <div key={idx} className={`rounded-lg border ${style.border} ${style.bg} overflow-hidden`}>
              <button
                className={`w-full flex items-start gap-3 p-3 text-left`}
                onClick={() => toggleExpand(idx)}
              >
                <SeverityIcon severity={interaction.severity} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${style.badge}`}>
                      {style.icon} {style.label}
                    </span>
                    <span className={`text-xs font-semibold ${style.text}`}>
                      {interaction.matchedDrugs[0]} + {interaction.matchedDrugs[1]}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${style.text} opacity-80`}>
                    {interaction.mechanism}
                  </p>
                </div>
                {isOpen
                  ? <ChevronUp className={`h-4 w-4 shrink-0 ${style.text}`} />
                  : <ChevronDown className={`h-4 w-4 shrink-0 ${style.text}`} />
                }
              </button>

              {isOpen && (
                <div className={`px-4 pb-3 pt-0 space-y-2 border-t ${style.border}`}>
                  <div>
                    <p className={`text-xs font-semibold uppercase tracking-wide ${style.text} opacity-70`}>Recomendación clínica</p>
                    <p className={`text-xs mt-0.5 ${style.text} font-medium`}>{interaction.recommendation}</p>
                  </div>
                  {interaction.references && (
                    <p className={`text-xs ${style.text} opacity-60`}>Ref: {interaction.references}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}