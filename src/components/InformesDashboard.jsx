import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from "recharts";
import { Clock, TrendingUp, ShieldAlert, FlaskConical, Syringe, Beaker, Activity, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

function KpiCard({ label, value, sub, icon: Icon, color = "text-primary", bg = "bg-primary/10" }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
      <div className={`p-2.5 rounded-xl ${bg} shrink-0`}>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">{label}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5 opacity-70">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h3 className="font-semibold text-sm text-foreground">{children}</h3>;
}

export default function InformesDashboard({ prescriptions, medications, adverseEvents }) {
  const rxs = prescriptions || [];
  const meds = medications || [];
  const aevents = adverseEvents || [];

  // ── KPIs base ──
  const total = rxs.length;
  const byType = useMemo(() => ({
    Oncologico: rxs.filter(r => !r.prescription_type || r.prescription_type === "Oncologico").length,
    Antibiotico: rxs.filter(r => r.prescription_type === "Antibiotico").length,
    NPT: rxs.filter(r => r.prescription_type === "NPT").length,
  }), [rxs]);

  // ── Tiempos prescripción → validación ──
  const validatedRxs = rxs.filter(r => r.validation_date && r.created_date);
  const validationTimes = validatedRxs.map(r => {
    const created = new Date(r.created_date);
    const validated = new Date(r.validation_date);
    return (validated - created) / (1000 * 60 * 60); // hours
  }).filter(h => h >= 0 && h < 720); // sanity: max 30 days

  const avgValidationHours = validationTimes.length > 0
    ? Math.round((validationTimes.reduce((a, b) => a + b, 0) / validationTimes.length) * 10) / 10
    : null;
  const medianValidationHours = validationTimes.length > 0
    ? (() => { const s = [...validationTimes].sort((a, b) => a - b); return Math.round(s[Math.floor(s.length / 2)] * 10) / 10; })()
    : null;

  // Histograma de tiempos de validación (buckets en horas)
  const timeBuckets = [
    { label: "<1h", min: 0, max: 1 },
    { label: "1-4h", min: 1, max: 4 },
    { label: "4-8h", min: 4, max: 8 },
    { label: "8-24h", min: 8, max: 24 },
    { label: "1-3 días", min: 24, max: 72 },
    { label: ">3 días", min: 72, max: Infinity },
  ];
  const timeDistData = timeBuckets.map(b => ({
    label: b.label,
    count: validationTimes.filter(t => t >= b.min && t < b.max).length
  }));

  // ── Alertas clínicas detectadas ──
  const rxWithAlerts = rxs.filter(r => r.alerts && r.alerts.length > 0);
  const totalAlerts = rxs.reduce((sum, r) => sum + (r.alerts?.length || 0), 0);
  const alertRate = total > 0 ? Math.round((rxWithAlerts.length / total) * 100) : 0;

  // Desglose de alertas
  const alertKeywords = [
    { label: "Función renal", pattern: /renal|creatinina|cisplatino/i },
    { label: "Función hepática", pattern: /hepática|hep[aá]tic|bilirrubina|taxano/i },
    { label: "SCT elevada", pattern: /SCT|superficie/i },
    { label: "Dosis fuera de rango", pattern: /rango|dosis/i },
    { label: "Otros", pattern: /./i },
  ];
  const alertBreakdown = [];
  rxs.forEach(r => (r.alerts || []).forEach(alert => {
    const match = alertKeywords.find(k => k.pattern.test(alert));
    if (match) {
      const existing = alertBreakdown.find(a => a.label === match.label);
      if (existing) existing.count++;
      else alertBreakdown.push({ label: match.label, count: 1 });
    }
  }));

  // ── Volumen por tipo ──
  const typeData = [
    { name: "Oncológico", value: byType.Oncologico, color: "#8b5cf6" },
    { name: "Antibiótico IV", value: byType.Antibiotico, color: "#10b981" },
    { name: "NPT", value: byType.NPT, color: "#f59e0b" },
  ].filter(d => d.value > 0);

  // ── Tendencia mensual ──
  const monthlyMap = {};
  rxs.forEach(r => {
    const d = new Date(r.created_date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!monthlyMap[key]) monthlyMap[key] = { mes: key, total: 0, validadas: 0, adversos: 0 };
    monthlyMap[key].total++;
    if (r.validation_status === "Validada") monthlyMap[key].validadas++;
    if (r.application_result === "Reacción adversa") monthlyMap[key].adversos++;
  });
  const monthlyData = Object.values(monthlyMap).sort((a, b) => a.mes.localeCompare(b.mes)).slice(-12);

  // ── Eventos adversos por fármaco (usando entidad AdverseEvent si disponible) ──
  const adverseByDrug = {};
  aevents.forEach(e => {
    adverseByDrug[e.drug_name] = (adverseByDrug[e.drug_name] || 0) + 1;
  });
  const adverseByDrugData = Object.entries(adverseByDrug).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));

  // ── Estado de validación ──
  const validadas = rxs.filter(r => r.validation_status === "Validada").length;
  const pendientes = rxs.filter(r => !r.validation_status || r.validation_status === "Pendiente").length;
  const rechazadas = rxs.filter(r => r.validation_status === "Rechazada").length;

  return (
    <div className="space-y-6">
      {/* ── KPIs principales ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Prescripciones" value={total} icon={Activity} color="text-primary" bg="bg-primary/10"
          sub={`${validadas} validadas (${total > 0 ? Math.round(validadas/total*100) : 0}%)`} />
        <KpiCard label="Tiempo prom. validación" value={avgValidationHours !== null ? `${avgValidationHours}h` : "—"}
          icon={Clock} color="text-blue-600" bg="bg-blue-50"
          sub={medianValidationHours !== null ? `Mediana: ${medianValidationHours}h · ${validatedRxs.length} validadas` : "Sin datos"} />
        <KpiCard label="Prescripciones con alertas" value={`${alertRate}%`}
          icon={AlertTriangle} color="text-amber-600" bg="bg-amber-50"
          sub={`${totalAlerts} alertas en ${rxWithAlerts.length} prescripciones`} />
        <KpiCard label="Eventos adversos" value={aevents.length}
          icon={ShieldAlert} color="text-red-600" bg="bg-red-50"
          sub={`${aevents.filter(e => e.ctcae_grade >= 3).length} grado ≥3 (severos)`} />
      </div>

      {/* ── Volumen por tipo + Estado validación ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Volumen por tipo */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <SectionTitle>Volumen por Tipo de Prescripción</SectionTitle>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {typeData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2">
            {[
              { label: "Oncológico", value: byType.Oncologico, color: "bg-violet-500", icon: FlaskConical },
              { label: "Antibiótico IV", value: byType.Antibiotico, color: "bg-emerald-500", icon: Syringe },
              { label: "NPT", value: byType.NPT, color: "bg-amber-500", icon: Beaker },
            ].map(t => (
              <div key={t.label} className="flex items-center gap-2 text-xs">
                <div className={`w-2.5 h-2.5 rounded-full ${t.color} shrink-0`} />
                <span className="flex-1 text-muted-foreground">{t.label}</span>
                <span className="font-mono font-bold">{t.value}</span>
                <span className="text-muted-foreground w-10 text-right">{total > 0 ? `${Math.round(t.value/total*100)}%` : "—"}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Estado de validación */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <SectionTitle>Estado de Validación</SectionTitle>
          <div className="space-y-3">
            {[
              { label: "Validadas", value: validadas, color: "bg-emerald-500", textColor: "text-emerald-700", icon: CheckCircle },
              { label: "Pendientes", value: pendientes, color: "bg-amber-400", textColor: "text-amber-700", icon: Clock },
              { label: "Rechazadas", value: rechazadas, color: "bg-red-500", textColor: "text-red-700", icon: XCircle },
            ].map(s => (
              <div key={s.label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className={`font-medium ${s.textColor}`}>{s.label}</span>
                  <span className="font-mono font-bold">{s.value} <span className="text-muted-foreground font-normal">({total > 0 ? Math.round(s.value/total*100) : 0}%)</span></span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${s.color} rounded-full transition-all`}
                    style={{ width: `${total > 0 ? (s.value/total)*100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-border space-y-1 text-xs text-muted-foreground">
            <p>Tasa de validación: <span className="font-bold text-emerald-600">{total > 0 ? Math.round(validadas/total*100) : 0}%</span></p>
            <p>Tasa de rechazo: <span className="font-bold text-red-600">{total > 0 ? Math.round(rechazadas/total*100) : 0}%</span></p>
          </div>
        </div>

        {/* Tiempo de validación - distribución */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <SectionTitle>Distribución Tiempos de Validación</SectionTitle>
          {validationTimes.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">Sin datos de validación</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={timeDistData} margin={{ bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="Prescripciones" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="text-xs text-muted-foreground space-y-0.5">
            <p>Promedio: <span className="font-bold text-primary">{avgValidationHours !== null ? `${avgValidationHours}h` : "—"}</span></p>
            <p>Mediana: <span className="font-bold text-primary">{medianValidationHours !== null ? `${medianValidationHours}h` : "—"}</span></p>
          </div>
        </div>
      </div>

      {/* ── Tendencia mensual ── */}
      {monthlyData.length > 0 && (
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <SectionTitle>Tendencia Mensual de Prescripciones</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={monthlyData} margin={{ left: -10, right: 10 }}>
              <defs>
                <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="validadasGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="total" name="Total" stroke="#0ea5e9" fill="url(#totalGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="validadas" name="Validadas" stroke="#10b981" fill="url(#validadasGrad)" strokeWidth={2} />
              {monthlyData.some(m => m.adversos > 0) && (
                <Line type="monotone" dataKey="adversos" name="Reacciones adversas" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Alertas clínicas + Eventos adversos por fármaco ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <SectionTitle>Prevalencia de Alertas Clínicas</SectionTitle>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-amber-600">{alertRate}%</p>
              <p className="text-xs text-muted-foreground mt-1">de prescripciones con alertas</p>
            </div>
            <div className="flex-1 space-y-2">
              {alertBreakdown.slice(0, 4).map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <div className="flex-1 text-muted-foreground truncate">{a.label}</div>
                  <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${totalAlerts > 0 ? (a.count / totalAlerts) * 100 : 0}%` }} />
                  </div>
                  <span className="font-mono w-6 text-right font-bold">{a.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 space-y-0.5">
            <p>Total alertas generadas: <strong>{totalAlerts}</strong></p>
            <p>Prescripciones sin alertas: <strong>{total - rxWithAlerts.length} ({total > 0 ? Math.round((total - rxWithAlerts.length)/total*100) : 0}%)</strong></p>
          </div>
        </div>

        {/* Eventos adversos por fármaco */}
        <div className="bg-card rounded-xl border border-border p-5 space-y-4">
          <SectionTitle>Eventos Adversos por Fármaco</SectionTitle>
          {adverseByDrugData.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">Sin eventos adversos registrados</div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={adverseByDrugData} layout="vertical" margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={110} />
                <Tooltip />
                <Bar dataKey="count" name="Eventos" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}