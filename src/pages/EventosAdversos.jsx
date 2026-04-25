import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ShieldAlert, TrendingUp, BarChart2, AlertTriangle, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { formatDate } from "@/lib/dateUtils";

const SEVERITY_COLORS = {
  "Leve": "#22c55e",
  "Moderada": "#f59e0b",
  "Severa": "#ef4444",
  "Amenaza para la vida": "#7c3aed",
  "Fatal": "#1f2937"
};

const GRADE_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#7c3aed", "#1f2937"];

function StatCard({ label, value, sub, color = "text-foreground", icon: Icon }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-start gap-4">
      {Icon && (
        <div className="p-2 bg-muted rounded-lg shrink-0">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function EventosAdversos() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [view, setView] = useState("dashboard"); // dashboard | list

  useEffect(() => {
    base44.entities.AdverseEvent.list("-event_date", 500).then(data => {
      setEvents(data);
      setLoading(false);
    });
  }, []);

  // ── Stats ──
  const total = events.length;
  const severe = events.filter(e => e.ctcae_grade >= 3).length;
  const resolved = events.filter(e => e.outcome === "Resuelto").length;
  const fatal = events.filter(e => e.ctcae_grade === 5 || e.outcome === "Fatal").length;

  // Frecuencia por fármaco
  const byDrug = {};
  events.forEach(e => {
    byDrug[e.drug_name] = (byDrug[e.drug_name] || 0) + 1;
  });
  const drugData = Object.entries(byDrug)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Por tipo de evento
  const byType = {};
  events.forEach(e => {
    byType[e.event_type] = (byType[e.event_type] || 0) + 1;
  });
  const typeData = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Por severidad
  const bySeverity = {};
  events.forEach(e => {
    bySeverity[e.severity] = (bySeverity[e.severity] || 0) + 1;
  });
  const severityData = Object.entries(bySeverity).map(([name, value]) => ({ name, value }));

  // Por grado CTCAE
  const byGrade = [1, 2, 3, 4, 5].map(g => ({
    grade: `G${g}`,
    count: events.filter(e => e.ctcae_grade === g).length
  }));

  // ── Filtered list ──
  const filtered = events.filter(e => {
    const matchSearch = !search ||
      e.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.drug_name?.toLowerCase().includes(search.toLowerCase()) ||
      e.event_type?.toLowerCase().includes(search.toLowerCase());
    const matchSeverity = filterSeverity === "all" || e.severity === filterSeverity;
    const matchType = filterType === "all" || e.event_type === filterType;
    return matchSearch && matchSeverity && matchType;
  });

  const uniqueTypes = [...new Set(events.map(e => e.event_type))].filter(Boolean);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-red-500" />
            Eventos Adversos
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reportes de farmacovigilancia y análisis estadístico
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setView("dashboard")}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${view === "dashboard" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${view === "list" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
          >
            Listado
          </button>
        </div>
      </div>

      {/* ── DASHBOARD ── */}
      {view === "dashboard" && (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total de reportes" value={total} icon={Activity} />
            <StatCard label="Grado ≥3 (Severos)" value={severe} color="text-red-600" icon={AlertTriangle}
              sub={total > 0 ? `${Math.round((severe / total) * 100)}% del total` : undefined} />
            <StatCard label="Resueltos" value={resolved} color="text-emerald-600" icon={TrendingUp}
              sub={total > 0 ? `${Math.round((resolved / total) * 100)}% del total` : undefined} />
            <StatCard label="Fatales / G5" value={fatal} color={fatal > 0 ? "text-red-900" : "text-foreground"} icon={ShieldAlert} />
          </div>

          {/* Gráficas principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fármacos con más eventos */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">Eventos por Fármaco</h3>
              </div>
              {drugData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={drugData} layout="vertical" margin={{ left: 10, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip />
                    <Bar dataKey="count" name="Eventos" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Distribución por severidad */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-red-500" />
                <h3 className="font-semibold text-sm">Distribución por Severidad</h3>
              </div>
              {severityData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Sin datos</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={severityData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => `${name} (${Math.round(percent * 100)}%)`}
                      labelLine={false}
                    >
                      {severityData.map((entry) => (
                        <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name] || "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Grados CTCAE + Tipos de evento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grados CTCAE */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-sm">Distribución por Grado CTCAE</h3>
              <div className="flex items-end gap-3 h-32">
                {byGrade.map((g, i) => {
                  const pct = total > 0 ? (g.count / total) : 0;
                  return (
                    <div key={g.grade} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-bold text-muted-foreground">{g.count}</span>
                      <div
                        className="w-full rounded-t-md transition-all"
                        style={{
                          height: `${Math.max(pct * 100, g.count > 0 ? 8 : 2)}px`,
                          backgroundColor: GRADE_COLORS[i]
                        }}
                      />
                      <span className="text-xs font-semibold">{g.grade}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex gap-3 flex-wrap text-xs text-muted-foreground">
                {CTCAE_GRADES_LABELS.map((l, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: GRADE_COLORS[i] }} />
                    G{i + 1}: {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Tipos de evento más frecuentes */}
            <div className="bg-card rounded-xl border border-border p-5 space-y-4">
              <h3 className="font-semibold text-sm">Tipos de Evento más Frecuentes</h3>
              {typeData.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">Sin datos</p>
              ) : (
                <div className="space-y-2">
                  {typeData.map(({ name, count }) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground w-44 truncate" title={name}>{name}</span>
                      <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                        <div
                          className="h-2 bg-primary rounded-full"
                          style={{ width: `${(count / typeData[0].count) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold w-6 text-right">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LISTADO ── */}
      {view === "list" && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por paciente, fármaco o tipo..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Severidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las severidades</SelectItem>
                {["Leve", "Moderada", "Severa", "Amenaza para la vida", "Fatal"].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-56">
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {uniqueTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {/* Tabla */}
          {filtered.length === 0 ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
              No hay eventos adversos registrados
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(ev => (
                <div key={ev.id} className={`bg-card rounded-xl border p-4 space-y-3 ${
                  ev.ctcae_grade >= 4 ? "border-red-300" :
                  ev.ctcae_grade === 3 ? "border-orange-300" :
                  "border-border"
                }`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-start gap-3">
                      <span className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                        ev.ctcae_grade >= 4 ? "bg-red-100 text-red-700" :
                        ev.ctcae_grade === 3 ? "bg-orange-100 text-orange-700" :
                        ev.ctcae_grade === 2 ? "bg-amber-100 text-amber-700" :
                        "bg-emerald-100 text-emerald-700"
                      }`}>
                        G{ev.ctcae_grade}
                      </span>
                      <div>
                        <p className="font-semibold text-sm">{ev.patient_name}</p>
                        <p className="text-xs text-muted-foreground">{ev.drug_name} · {ev.protocol_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: `${SEVERITY_COLORS[ev.severity]}22`, color: SEVERITY_COLORS[ev.severity] }}>
                        {ev.severity}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        ev.outcome === "Resuelto" ? "bg-emerald-100 text-emerald-700" :
                        ev.outcome === "Fatal" ? "bg-red-100 text-red-700" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {ev.outcome}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div><span className="text-muted-foreground block">Tipo de evento</span><span>{ev.event_type}{ev.event_type === "Otro" ? `: ${ev.event_type_other}` : ""}</span></div>
                    <div><span className="text-muted-foreground block">Acción tomada</span><span>{ev.action_taken}</span></div>
                    {ev.onset_time && <div><span className="text-muted-foreground block">Inicio</span><span>{ev.onset_time}</span></div>}
                    {ev.duration && <div><span className="text-muted-foreground block">Duración</span><span>{ev.duration}</span></div>}
                    <div><span className="text-muted-foreground block">Reportado por</span><span>{ev.reported_by}</span></div>
                    <div><span className="text-muted-foreground block">Fecha</span><span>{formatDate(ev.event_date)}</span></div>
                  </div>

                  {ev.notes && (
                    <p className="text-xs text-muted-foreground border-l-2 border-primary/30 pl-2 italic">{ev.notes}</p>
                  )}
                  {ev.rescue_medication && (
                    <p className="text-xs"><span className="text-muted-foreground">Rescate: </span>{ev.rescue_medication}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const CTCAE_GRADES_LABELS = ["Leve", "Moderado", "Severo", "Amenaza vida", "Fatal"];