import { useState, useMemo } from "react";
import { ANTIBIOTICOS_IV, calculateAntibioticDose, validateAntibioticDose } from "@/lib/antibioticoProtocols";
import { Search, Plus, X, AlertTriangle, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const CATEGORIES = [...new Set(ANTIBIOTICOS_IV.map(d => d.category))];

export default function AntibioticSelector({ selectedDrugs, onDrugsChange, patientWeight }) {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filtered = useMemo(() =>
    ANTIBIOTICOS_IV.filter(d => {
      const matchSearch = d.drug_name.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "all" || d.category === categoryFilter;
      const notSelected = !selectedDrugs.find(s => s.drug_name === d.drug_name);
      return matchSearch && matchCat && notSelected;
    }), [search, selectedDrugs, categoryFilter]);

  const addDrug = (drug) => {
    const { calculated, minDose, maxDose } = calculateAntibioticDose(drug, patientWeight);
    const validation = validateAntibioticDose(calculated, minDose, maxDose);
    const newDrug = {
      ...drug,
      prescribed_dose: calculated,
      calculated_dose: calculated,
      min_dose: minDose,
      max_dose: maxDose,
      dose_unit: "mg",
      solution_type: drug.diluent,
      container_material: "Bolsa PVC",
      is_valid: validation.isValid,
      validation_notes: validation.message
    };
    onDrugsChange([...selectedDrugs, newDrug]);
    setSearch("");
    setShowSearch(false);
  };

  const removeDrug = (name) => {
    onDrugsChange(selectedDrugs.filter(d => d.drug_name !== name));
  };

  const updateDrug = (index, field, value) => {
    const updated = [...selectedDrugs];
    updated[index] = { ...updated[index], [field]: value };

    if (field === "prescribed_dose") {
      const prescribed = parseFloat(value) || 0;
      const validation = validateAntibioticDose(
        prescribed,
        updated[index].min_dose,
        updated[index].max_dose
      );
      updated[index].is_valid = validation.isValid;
      updated[index].validation_notes = validation.message;
    }
    onDrugsChange(updated);
  };

  return (
    <div className="space-y-4">
      {/* Selected drugs */}
      {selectedDrugs.length > 0 && (
        <div className="space-y-3">
          {selectedDrugs.map((drug, i) => (
            <div key={drug.drug_name} className={`border rounded-xl p-4 space-y-3 ${!drug.is_valid ? "border-amber-300 bg-amber-50/30" : "border-border bg-muted/20"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap">
                  {drug.is_valid
                    ? <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    : <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />}
                  <span className="font-semibold text-sm">{drug.drug_name}</span>
                  <Badge variant="outline" className="text-xs">{drug.category}</Badge>
                  <span className="text-xs text-muted-foreground">{drug.route}</span>
                </div>
                <button onClick={() => removeDrug(drug.drug_name)} className="text-muted-foreground hover:text-destructive transition-colors ml-2">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block">Rango terapéutico</span>
                  <span className="font-mono font-medium text-primary">{drug.min_dose}–{drug.max_dose} mg</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Calculado ({drug.dose_mg_kg_typical} mg/kg)</span>
                  <span className="font-mono font-medium">{drug.calculated_dose} mg</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Vía / Inf.</span>
                  <span>{drug.route} · {drug.infusion_time}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Diluyente</span>
                  <span>{drug.diluent} {drug.volume_ml} mL</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Dosis prescrita (mg)</Label>
                  <Input
                    type="number"
                    step="1"
                    value={drug.prescribed_dose}
                    onChange={e => updateDrug(i, "prescribed_dose", e.target.value)}
                    className={`font-mono h-8 text-sm ${!drug.is_valid ? "border-amber-400 focus-visible:ring-amber-400" : ""}`}
                  />
                  {!drug.is_valid && (
                    <p className="text-xs text-amber-600">{drug.validation_notes}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Frecuencia</Label>
                  <Select value={drug.default_frequency} onValueChange={v => updateDrug(i, "default_frequency", v)}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {drug.frequencies?.map(f => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Duración (días)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={drug.duration_days || 7}
                    onChange={e => updateDrug(i, "duration_days", parseInt(e.target.value) || 7)}
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              {drug.notes && (
                <p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-2">{drug.notes}</p>
              )}
              {drug.renal_adjustment && (
                <p className="text-xs text-amber-600 font-medium">⚠️ Requiere ajuste en insuficiencia renal</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      {showSearch ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                autoFocus
                placeholder="Buscar antibiótico..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las clases</SelectItem>
                {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-lg max-h-64 overflow-auto bg-card shadow-sm">
            {filtered.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">No encontrado</p>
            ) : (
              filtered.map(drug => {
                const { calculated } = calculateAntibioticDose(drug, patientWeight);
                return (
                  <button
                    key={drug.drug_name}
                    onClick={() => addDrug(drug)}
                    className="w-full text-left px-4 py-3 hover:bg-muted border-b last:border-0 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <span className="text-sm font-medium">{drug.drug_name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{drug.category}</span>
                      </div>
                      <div className="text-right text-xs text-muted-foreground shrink-0">
                        <div className="font-mono">{drug.dose_mg_kg_typical} mg/kg · {drug.default_frequency}</div>
                        {patientWeight && <div className="text-primary font-medium">≈ {calculated} mg</div>}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => { setShowSearch(false); setSearch(""); }}>
            Cancelar
          </Button>
        </div>
      ) : (
        <Button variant="outline" className="w-full gap-2" onClick={() => setShowSearch(true)}>
          <Plus className="h-4 w-4" />
          Agregar antibiótico
        </Button>
      )}

      {!patientWeight && (
        <p className="text-xs text-amber-600">⚠️ Selecciona un paciente con peso registrado para calcular dosis automáticamente.</p>
      )}
    </div>
  );
}