import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Clock, AlertTriangle, CalendarCheck, PackageCheck } from "lucide-react";
import moment from "moment";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { computeKpis, deliveriesByDay, formatHours } from "@/lib/kpis";

const PERIODS = [7, 30, 90];

export default function KPIs() {
  const [period, setPeriod] = useState(30);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const since = moment().subtract(period, "days").toISOString();
    base44.entities.Prescription
      .filter({ created_date: { $gte: since } }, { sort: "-created_date", limit: 500 })
      .then(page => {
        setPrescriptions(page.items || []);
        setLoading(false);
      });
  }, [period]);

  const kpis = computeKpis(prescriptions);
  const chart = deliveriesByDay(prescriptions, Math.min(period, 30));

  const cards = [
    {
      label: "Tiempo de ciclo promedio",
      value: formatHours(kpis.avgCycleHours),
      hint: "De prescripción a entrega",
      icon: Clock,
      color: "text-primary",
    },
    {
      label: "% de rechazos",
      value: kpis.rejectionRate ? `${kpis.rejectionRate.toFixed(1)}%` : "0%",
      hint: "Sobre mezclas validadas o rechazadas",
      icon: AlertTriangle,
      color: "text-red-600",
    },
    {
      label: "Cumplimiento de programación",
      value: kpis.complianceRate === null ? "—" : `${kpis.complianceRate.toFixed(1)}%`,
      hint: kpis.scheduled ? `${kpis.onTime} de ${kpis.scheduled} programadas entregadas en fecha` : "Sin mezclas programadas vencidas",
      icon: CalendarCheck,
      color: "text-emerald-600",
    },
    {
      label: "Mezclas entregadas",
      value: kpis.delivered,
      hint: `${kpis.pending} pendientes de validar`,
      icon: PackageCheck,
      color: "text-accent",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tablero de KPI</h1>
          <p className="text-sm text-muted-foreground mt-1">Tiempo de ciclo, rechazos y cumplimiento de la programación</p>
        </div>
        <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit">
          {PERIODS.map(days => (
            <Button
              key={days}
              size="sm"
              variant={period === days ? "default" : "ghost"}
              onClick={() => setPeriod(days)}
              className="h-7 text-xs px-3"
            >
              {days} días
            </Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {cards.map(card => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="bg-card rounded-xl border border-border p-4">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mb-2">
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                  <p className="text-xs font-medium mt-0.5">{card.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{card.hint}</p>
                </div>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
              <h2 className="font-semibold text-sm mb-4">Mezclas entregadas por día</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chart}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} width={28} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    <Bar dataKey="entregas" name="Entregas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h2 className="font-semibold text-sm">Resumen del periodo</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Prescripciones</span>
                  <span className="font-semibold">{kpis.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Entregadas</span>
                  <span className="font-semibold">{kpis.delivered}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pendientes de validar</span>
                  <span className="font-semibold">{kpis.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Programadas evaluadas</span>
                  <span className="font-semibold">{kpis.scheduled}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Entregadas en fecha</span>
                  <span className="font-semibold text-emerald-600">{kpis.onTime}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground pt-3 border-t border-border">
                El cumplimiento compara la fecha de entrega con el día programado de cada mezcla.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}