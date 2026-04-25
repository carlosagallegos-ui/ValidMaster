import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import InformesDashboard from "@/components/InformesDashboard";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Panel de Control</h1>
        <p className="text-muted-foreground text-sm mt-1">Centro de Mezclas Oncológicas · ValidMaster</p>
      </div>
      <InformesDashboard
        prescriptions={prescriptions}
        medications={medications}
        adverseEvents={adverseEvents}
      />
    </div>
  );
}