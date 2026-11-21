import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { BellRing, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildAlerts } from "@/lib/alertFeed";
import AlertGroup from "@/components/alerts/AlertGroup";

export default function Alertas() {
  const [data, setData] = useState({ prescriptions: [], medications: [], temperatureLogs: [] });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    const [prescriptions, medications, temperatureLogs] = await Promise.all([
      base44.entities.Prescription.list("-created_date", 300),
      base44.entities.Medication.list("-created_date", 300),
      base44.entities.TemperatureLog.list("-recorded_at", 200),
    ]);
    setData({ prescriptions: prescriptions || [], medications: medications || [], temperatureLogs: temperatureLogs || [] });
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const groups = buildAlerts(data);
  const total = groups.reduce((sum, g) => sum + g.items.length, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BellRing className="h-6 w-6 text-primary" /> Centro de Alertas
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Pendientes operativos de validación, inventario, salidas y temperatura
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-lg bg-muted text-sm">
            <span className="font-bold">{total}</span> <span className="text-muted-foreground">pendientes</span>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setRefreshing(true); load(); }} disabled={refreshing}>
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} /> Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {groups.map(group => <AlertGroup key={group.key} group={group} />)}
        </div>
      )}
    </div>
  );
}