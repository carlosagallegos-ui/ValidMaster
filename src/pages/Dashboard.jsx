import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import InformesDashboard from "@/components/InformesDashboard";
import { ClipboardList, CheckCircle, Clock, XCircle, TestTube, AlertTriangle, CalendarX } from "lucide-react";

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
        <p className="text-muted-foreground text-sm mt-1">Centro de Mezclas Oncológicas · SIVF-ME</p>
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

      {/* Alertas de Caducidad */}
      {(() => {
        const today = new Date();
        const in30Days = new Date(today);
        in30Days.setDate(today.getDate() + 30);

        const expiringSoon = medications.filter(m => {
          if (!m.expiration_date) return false;
          const exp = new Date(m.expiration_date);
          return exp <= in30Days && m.status !== "Caducado";
        }).sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));

        if (expiringSoon.length === 0) return null;

        return (
          <div className="bg-amber-50 border border-amber-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-amber-200 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h2 className="font-semibold text-amber-800">Alertas de Caducidad</h2>
              <span className="ml-auto bg-amber-200 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">{expiringSoon.length} medicamento(s)</span>
            </div>
            <div className="divide-y divide-amber-100">
              {expiringSoon.map(med => {
                const exp = new Date(med.expiration_date);
                const daysLeft = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
                const isUrgent = daysLeft <= 7;
                return (
                  <div key={med.id} className={`flex items-center gap-4 px-6 py-3 ${isUrgent ? "bg-red-50" : ""}`}>
                    <div className={`p-2 rounded-lg shrink-0 ${isUrgent ? "bg-red-100" : "bg-amber-100"}`}>
                      <CalendarX className={`h-4 w-4 ${isUrgent ? "text-red-600" : "text-amber-600"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{med.drug_name}</p>
                      <p className="text-xs text-muted-foreground">{med.concentration} {med.concentration_unit} · Lote: {med.lot_number || "—"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className={`text-sm font-bold ${isUrgent ? "text-red-600" : "text-amber-600"}`}>
                        {daysLeft <= 0 ? "¡Caducado!" : `${daysLeft} día(s)`}
                      </p>
                      <p className="text-xs text-muted-foreground">{exp.toLocaleDateString("es-MX")}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      isUrgent ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                    }`}>
                      {isUrgent ? "🔴 Urgente" : "⚠️ Próximo"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      <InformesDashboard
        prescriptions={prescriptions}
        medications={medications}
        adverseEvents={adverseEvents}
      />
    </div>
  );
}