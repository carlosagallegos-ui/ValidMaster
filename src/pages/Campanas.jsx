import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, ShieldCheck, Droplets, AlertTriangle, CalendarClock } from "lucide-react";
import moment from "moment";
import { HOOD_ACTIVITY_TYPES, groupByEquipment, complianceAlerts, dueStatus, TONE_CLASSES } from "@/lib/hoodMaintenance";
import { areaLabel } from "@/lib/areasCentro";
import { logAudit } from "@/lib/auditLog";
import HoodLogForm from "@/components/hoods/HoodLogForm";
import HoodEquipmentCard from "@/components/hoods/HoodEquipmentCard";

export default function Campanas() {
  const [logs, setLogs] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [activityFilter, setActivityFilter] = useState("TODAS");

  useEffect(() => {
    Promise.all([
      base44.entities.HoodLog.list("-performed_date", 200),
      base44.auth.me().catch(() => null),
    ]).then(([records, me]) => {
      setLogs(records || []);
      setUser(me);
      setLoading(false);
    });
  }, []);

  const saveLog = async (payload) => {
    const created = await base44.entities.HoodLog.create(payload);
    setLogs(prev => [created, ...prev]);
    await logAudit({
      action: "Inspección",
      description: `${payload.activity_type} de ${payload.equipment} · ${payload.result}`,
      entity_id: created.id,
      details: [payload.provider, payload.certificate_number, payload.notes].filter(Boolean).join(" · "),
    });
    setFormOpen(false);
  };

  const groups = groupByEquipment(logs);
  const compliance = complianceAlerts(logs);
  const cleanedRecent = logs.filter(l =>
    (l.activity_type === "Limpieza" || l.activity_type === "Desinfección") &&
    moment(l.performed_date).isAfter(moment().subtract(30, "days"))
  ).length;
  const certified = groups.filter(g => g.certification && g.due?.tone === "green").length;

  const filtered = logs.filter(l => activityFilter === "TODAS" || l.activity_type === activityFilter);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  const stats = [
    { label: "Campanas registradas", value: groups.length, icon: ShieldCheck },
    { label: "Limpiezas (30 días)", value: cleanedRecent, icon: Droplets },
    { label: "Certificaciones vigentes", value: certified, icon: ShieldCheck },
    { label: "Por vencer o vencidas", value: compliance.length, icon: CalendarClock },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Campanas y Certificaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Bitácora de limpieza, desinfección y certificación de campanas de flujo laminar y cabinas
          </p>
        </div>
        <Button className="gap-2" onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Registrar actividad
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {compliance.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-semibold text-amber-800">Certificaciones por atender</p>
          </div>
          <div className="space-y-1.5">
            {compliance.map(g => (
              <div key={g.equipment} className="flex flex-wrap items-center justify-between gap-2 text-sm text-amber-900">
                <span className="font-medium">{g.equipment}</span>
                <div className="flex items-center gap-2 text-xs">
                  <span>{moment(g.certification.next_due_date).format("DD/MM/YYYY")}</span>
                  <span className={`px-2 py-0.5 rounded-full border font-medium ${TONE_CLASSES[g.due.tone]}`}>{g.due.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {groups.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {groups.map(g => <HoodEquipmentCard key={g.equipment} group={g} />)}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Historial de actividades</h2>
        <Select value={activityFilter} onValueChange={setActivityFilter}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="TODAS">Todas las actividades</SelectItem>
            {HOOD_ACTIVITY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <ShieldCheck className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">Aún no hay actividades registradas</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Fecha", "Campana", "Actividad", "Área", "Realizó", "Resultado", "Próximo vencimiento", "Proveedor / Certificado"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => {
                  const due = dueStatus(log.next_due_date);
                  return (
                    <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-sm font-mono whitespace-nowrap">{moment(log.performed_date).format("DD/MM/YYYY")}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium">{log.equipment}</p>
                        <p className="text-xs text-muted-foreground">{log.equipment_type}</p>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">{log.activity_type}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{areaLabel(log.area)}</td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{log.performed_by || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${
                          log.result === "No conforme" ? TONE_CLASSES.red
                            : log.result === "Con observaciones" ? TONE_CLASSES.amber
                            : TONE_CLASSES.green
                        }`}>
                          {log.result || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm whitespace-nowrap">
                        {log.next_due_date ? (
                          <span className="flex items-center gap-1.5">
                            <span className="font-mono text-xs">{moment(log.next_due_date).format("DD/MM/YYYY")}</span>
                            {due && <span className={`px-1.5 py-0.5 rounded text-[10px] border font-medium ${TONE_CLASSES[due.tone]}`}>{due.label}</span>}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {log.provider || log.certificate_number ? (
                          <span>{[log.provider, log.certificate_number].filter(Boolean).join(" · ")}</span>
                        ) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <HoodLogForm open={formOpen} onOpenChange={setFormOpen} userName={user?.full_name} onSave={saveLog} />
    </div>
  );
}