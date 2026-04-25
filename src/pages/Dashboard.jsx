import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import InformesDashboard from "@/components/InformesDashboard";
import { ClipboardList, CheckCircle, Clock, XCircle, TestTube } from "lucide-react";

export default function Dashboard() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medications, setMedications] = useState([]);
  const [adverseEvents, setAdverseEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Prescription.list("-created_date", 500),
      base44.entities.Medication.list("-received_date", 300),
      base44.entities.AdverseEvent.list("-event_date", 500),
    ]).then(([rxs, meds, aevents]) => {
      setPrescriptions(rxs);
      setMedications(meds);
      setAdverseEvents(aevents);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    { label: "Total Mezclas", value: prescriptions.length, icon: ClipboardList, color: "text-foreground", bg: "bg-muted" },
    { label: "Pendientes", value: prescriptions.filter(p => !p.validation_status || p.validation_status === "Pendiente").length, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "En Revisión", value: prescriptions.filter(p => p.validation_status === "Ajustada").length, icon: TestTube, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Validadas", value: prescriptions.filter(p => p.validation_status === "Validada").length, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Rechazadas", value: prescriptions.filter(p => p.validation_status === "Rechazada").length, icon: XCircle, color: "text-red-600", bg: "bg-red-50" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground text-sm mt-1">Centro de Mezclas Oncológicas · ValidMaster</p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className={`mt-4 text-3xl font-bold tracking-tight ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <InformesDashboard
        prescriptions={prescriptions}
        medications={medications}
        adverseEvents={adverseEvents}
      />
    </div>
  );
}