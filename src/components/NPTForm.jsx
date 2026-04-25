import { useEffect } from "react";
import { calculateNPT, validateNPT, NPT_SOLUTIONS } from "@/lib/nptCalculations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Beaker, Zap, Activity } from "lucide-react";

export default function NPTForm({ nptData, onChange, patientWeight }) {
  const results = calculateNPT({ ...nptData, weight_kg: patientWeight });
  const alerts = validateNPT(results, patientWeight);

  const set = (field, value) => onChange({ ...nptData, [field]: value });
  const setElectrolyte = (field, value) => onChange({
    ...nptData,
    electrolytes: { ...(nptData.electrolytes || {}), [field]: parseFloat(value) || 0 }
  });

  const e = nptData.electrolytes || {};

  return (
    <div className="space-y-6">
      {/* Macronutrientes */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Beaker className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Macronutrientes</h3>
        </div>

        {/* Glucosa */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Glucosa (concentración)</Label>
            <Select
              value={String(nptData.glucose_percent || 20)}
              onValueChange={v => set("glucose_percent", parseFloat(v))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NPT_SOLUTIONS.glucose.map(s => (
                  <SelectItem key={s.percent} value={String(s.percent)}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Volumen glucosa (mL)</Label>
            <Input
              type="number" min={0} step={10}
              value={nptData.glucose_ml || ""}
              onChange={e => set("glucose_ml", parseFloat(e.target.value) || 0)}
              className="h-8 text-sm font-mono"
              placeholder="500"
            />
          </div>
        </div>

        {/* Aminoácidos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Aminoácidos (concentración)</Label>
            <Select
              value={String(nptData.aminoacids_percent || 10)}
              onValueChange={v => set("aminoacids_percent", parseFloat(v))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NPT_SOLUTIONS.aminoacids.map(s => (
                  <SelectItem key={s.percent} value={String(s.percent)}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Volumen aminoácidos (mL)</Label>
            <Input
              type="number" min={0} step={10}
              value={nptData.aminoacids_ml || ""}
              onChange={e => set("aminoacids_ml", parseFloat(e.target.value) || 0)}
              className="h-8 text-sm font-mono"
              placeholder="250"
            />
          </div>
        </div>

        {/* Lípidos */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Lípidos (concentración)</Label>
            <Select
              value={String(nptData.lipids_percent ?? 20)}
              onValueChange={v => set("lipids_percent", parseFloat(v))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NPT_SOLUTIONS.lipids.map(s => (
                  <SelectItem key={s.percent} value={String(s.percent)}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Volumen lípidos (mL)</Label>
            <Input
              type="number" min={0} step={10}
              value={nptData.lipids_ml || ""}
              onChange={e => set("lipids_ml", parseFloat(e.target.value) || 0)}
              className="h-8 text-sm font-mono"
              placeholder="100"
              disabled={!nptData.lipids_percent}
            />
          </div>
        </div>

        {/* Infusión */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Horas de infusión</Label>
            <Select
              value={String(nptData.infusion_hours || 24)}
              onValueChange={v => set("infusion_hours", parseFloat(v))}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 horas</SelectItem>
                <SelectItem value="16">16 horas</SelectItem>
                <SelectItem value="20">20 horas</SelectItem>
                <SelectItem value="24">24 horas (continua)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Vía de administración</Label>
            <Select
              value={nptData.route || "Central"}
              onValueChange={v => set("route", v)}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Central">Central (CVC/PICC)</SelectItem>
                <SelectItem value="Periférica">Periférica</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Electrolitos y aditivos */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <h3 className="font-semibold text-sm">Electrolitos y Aditivos</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">NaCl (mEq)</Label>
            <Input type="number" min={0} value={e.nacl_meq || ""} onChange={ev => setElectrolyte("nacl_meq", ev.target.value)} className="h-8 text-sm font-mono" placeholder="40" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">KCl (mEq)</Label>
            <Input type="number" min={0} value={e.kcl_meq || ""} onChange={ev => setElectrolyte("kcl_meq", ev.target.value)} className="h-8 text-sm font-mono" placeholder="20" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Gluconato de Ca (mL)</Label>
            <Input type="number" min={0} value={e.calcium_gluconate_ml || ""} onChange={ev => setElectrolyte("calcium_gluconate_ml", ev.target.value)} className="h-8 text-sm font-mono" placeholder="10" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sulfato de Mg (mL)</Label>
            <Input type="number" min={0} value={e.magnesium_sulfate_ml || ""} onChange={ev => setElectrolyte("magnesium_sulfate_ml", ev.target.value)} className="h-8 text-sm font-mono" placeholder="5" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">KH₂PO₄ (mL)</Label>
            <Input type="number" min={0} value={e.kh2po4_ml || ""} onChange={ev => setElectrolyte("kh2po4_ml", ev.target.value)} className="h-8 text-sm font-mono" placeholder="5" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Multivitamínicos (mL)</Label>
            <Input type="number" min={0} value={e.multivitamins_ml || ""} onChange={ev => setElectrolyte("multivitamins_ml", ev.target.value)} className="h-8 text-sm font-mono" placeholder="10" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Oligoelementos (mL)</Label>
            <Input type="number" min={0} value={e.trace_elements_ml || ""} onChange={ev => setElectrolyte("trace_elements_ml", ev.target.value)} className="h-8 text-sm font-mono" placeholder="5" />
          </div>
        </div>
      </div>

      {/* Resultados calculados */}
      {(results.total_volume_ml > 0) && (
        <div className="bg-primary/5 rounded-xl border border-primary/20 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-primary">Resumen Calculado</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-lg border border-border p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vol. Total</p>
              <p className="text-lg font-bold text-primary font-mono">{results.total_volume_ml}</p>
              <p className="text-[10px] text-muted-foreground">mL</p>
            </div>
            <div className="bg-white rounded-lg border border-border p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Calorías</p>
              <p className="text-lg font-bold text-amber-600 font-mono">{results.kcal_total}</p>
              <p className="text-[10px] text-muted-foreground">kcal · {results.kcal_kg} kcal/kg</p>
            </div>
            <div className="bg-white rounded-lg border border-border p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Proteínas</p>
              <p className="text-lg font-bold text-emerald-600 font-mono">{results.protein_g}</p>
              <p className="text-[10px] text-muted-foreground">g · {results.protein_g_kg} g/kg</p>
            </div>
            <div className="bg-white rounded-lg border border-border p-3 text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Osmolaridad</p>
              <p className={`text-lg font-bold font-mono ${results.osmolarity_mosm_l > 900 ? "text-red-600" : results.osmolarity_mosm_l > 600 ? "text-amber-600" : "text-emerald-600"}`}>
                {results.osmolarity_mosm_l}
              </p>
              <p className="text-[10px] text-muted-foreground">mOsm/L</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <div className="bg-white rounded-lg border border-border px-3 py-2">
              <span className="text-muted-foreground">Velocidad: </span>
              <span className="font-mono font-semibold">{results.infusion_rate_ml_h} mL/h</span>
            </div>
            <div className={`rounded-lg border px-3 py-2 ${results.osmolarity_mosm_l > 900 ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
              <span className="text-muted-foreground">Vía recomendada: </span>
              <span className={`font-semibold ${results.osmolarity_mosm_l > 900 ? "text-red-700" : "text-emerald-700"}`}>{results.route}</span>
            </div>
          </div>

          {alerts.length > 0 && (
            <div className="space-y-1.5">
              {alerts.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}