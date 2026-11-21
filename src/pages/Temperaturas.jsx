import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Thermometer, Plus, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import moment from "moment";
import { TEMPERATURE_AREAS, isExcursion, rangeLabel } from "@/lib/temperature";
import { areaLabel } from "@/lib/areasCentro";
import { logAudit } from "@/lib/auditLog";
import TemperatureForm from "@/components/temperature/TemperatureForm";
import TemperatureExcursionPanel from "@/components/temperature/TemperatureExcursionPanel";

export default function Temperaturas() {
  const [readings, setReadings] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [areaFilter, setAreaFilter] = useState("TODAS");
  const [onlyExcursions, setOnlyExcursions] = useState(false);

  useEffect(() => {
    Promise.all([
      base44.entities.TemperatureLog.list("-recorded_at", 200),
      base44.auth.me().catch(() => null),
    ]).then(([logs, me]) => {
      setReadings(logs || []);
      setUser(me);
      setLoading(false);
    });
  }, []);

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (reading) => { setEditing(reading); setFormOpen(true); };

  const saveReading = async (data) => {
    if (editing?.id) {
      const updated = await base44.entities.TemperatureLog.update(editing.id, data);
      setReadings(prev => prev.map(r => r.id === editing.id ? updated : r));
      if (data.corrective_action && !(editing.corrective_action || "").trim()) {
        await logAudit({
          action: "Inspección",
          description: `Acción correctiva por excursión de temperatura: ${data.equipment}`,
          entity_id: editing.id,
          details: data.corrective_action,
        });
      }
    } else {
      const created = await base44.entities.TemperatureLog.create(data);
      setReadings(prev => [created, ...prev]);
      await logAudit({
        action: "Inspección",
        description: `Lectura de temperatura: ${data.equipment} ${data.temperature} °C${data.in_range ? "" : " · EXCURSIÓN"}`,
        entity_id: created.id,
        details: `${data.area} · ${data.shift}${data.corrective_action ? ` · Acción: ${data.corrective_action}` : ""}`,
      });
    }
    setFormOpen(false);
    setEditing(null);
  };

  const filtered = readings.filter(r =>
    (areaFilter === "TODAS" || r.area === areaFilter) &&
    (!onlyExcursions || isExcursion(r))
  );

  const today = moment().startOf("day");
  const lastWeek = moment().subtract(7, "days");
  const stats = {
    hoy: readings.filter(r => moment(r.recorded_at).isAfter(today)).length,
    equipos: [...new Set(readings.map(r => r.equipment).filter(Boolean))].length,
    excursiones: readings.filter(r => isExcursion(r) && moment(r.recorded_at).isAfter(lastWeek)).length,
    pendientes: readings.filter(r => isExcursion(r) && moment(r.recorded_at).isAfter(lastWeek) && !(r.corrective_action || "").trim()).length,
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Temperatura de Áreas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registro de refrigeración y congelación con alerta por excursión y acción correctiva
          </p>
        </div>
        <Button className="gap-2" onClick={openNew}>
          <Plus className="h-4 w-4" /> Registrar lectura
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Lecturas de hoy", value: stats.hoy, icon: Clock, color: "text-primary", bg: "bg-primary/10" },
          { label: "Equipos vigilados", value: stats.equipos, icon: Thermometer, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Excursiones (7 días)", value: stats.excursiones, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
          { label: "Sin acción correctiva", value: stats.pendientes, icon: CheckCircle, color: "text-amber-600", bg: "bg-amber-50" },
        ].map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
              <div className={`w-8 h-8 rounded-lg ${stat.bg} flex items-center justify-center mb-2`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <TemperatureExcursionPanel readings={readings} onEdit={openEdit} />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={areaFilter} onValueChange={setAreaFilter}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas las áreas</SelectItem>
            {TEMPERATURE_AREAS.map(a => (
              <SelectItem key={a.area} value={a.area}>{a.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant={onlyExcursions ? "default" : "outline"}
          size="sm"
          onClick={() => setOnlyExcursions(v => !v)}
          className="gap-1.5"
        >
          <AlertTriangle className="h-3.5 w-3.5" /> Solo excursiones
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Thermometer className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Aún no hay lecturas registradas</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Fecha y hora", "Área", "Equipo", "Temperatura", "Rango", "Turno", "Registró", "Estado", "Acción correctiva", ""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const excursion = isExcursion(r);
                  return (
                    <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono whitespace-nowrap">{moment(r.recorded_at).format("DD/MM/YYYY HH:mm")}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{areaLabel(r.area)}</td>
                      <td className="px-4 py-3 text-sm font-medium">{r.equipment}</td>
                      <td className={`px-4 py-3 text-sm font-mono font-bold ${excursion ? "text-red-600" : "text-foreground"}`}>{r.temperature} °C</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{rangeLabel(r)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{r.shift || "—"}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{r.recorded_by || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                          excursion ? "bg-red-50 text-red-700 border-red-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}>
                          {excursion ? "Excursión" : "En rango"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[16rem]">
                        {(r.corrective_action || "").trim() || (excursion ? "—" : "")}
                      </td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>Editar</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <TemperatureForm
        open={formOpen}
        onOpenChange={setFormOpen}
        reading={editing}
        userName={user?.full_name}
        onSave={saveReading}
      />
    </div>
  );
}