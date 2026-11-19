import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, RefreshCw, History } from "lucide-react";
import { formatDateTime } from "@/lib/dateUtils";

const ACTIONS = [
  "Prescripción",
  "Validación",
  "Inspección",
  "Entrega",
  "Aplicación",
  "Evento adverso",
  "Inventario",
  "Lote",
  "Otro",
];

const ACTION_STYLES = {
  "Prescripción": "bg-sky-50 text-sky-700 border-sky-200",
  "Validación": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Inspección": "bg-violet-50 text-violet-700 border-violet-200",
  "Entrega": "bg-teal-50 text-teal-700 border-teal-200",
  "Aplicación": "bg-blue-50 text-blue-700 border-blue-200",
  "Evento adverso": "bg-red-50 text-red-700 border-red-200",
  "Inventario": "bg-amber-50 text-amber-700 border-amber-200",
  "Lote": "bg-slate-100 text-slate-700 border-slate-200",
  "Otro": "bg-muted text-muted-foreground border-border",
};

function toIso(dateStr, endOfDay = false) {
  if (!dateStr) return null;
  return new Date(`${dateStr}T${endOfDay ? "23:59:59" : "00:00:00"}`).toISOString();
}

function csvEscape(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export default function Bitacora() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("todos");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadLogs();
  }, [action, dateFrom, dateTo]);

  const loadLogs = async () => {
    setLoading(true);
    const query = {};
    if (action !== "todos") query.action = action;
    const from = toIso(dateFrom);
    const to = toIso(dateTo, true);
    if (from || to) {
      query.timestamp = {};
      if (from) query.timestamp.$gte = from;
      if (to) query.timestamp.$lte = to;
    }
    const page = await base44.entities.AuditLog.filter(query, { sort: "-timestamp", limit: 500 });
    setLogs(page.items || []);
    setLoading(false);
  };

  const filtered = logs.filter(log => {
    if (!search) return true;
    const term = search.toLowerCase();
    return [log.user_name, log.patient_name, log.drug_name, log.description, log.details]
      .some(field => field?.toLowerCase().includes(term));
  });

  const exportRows = (rows) => rows.map(log => ({
    Fecha: formatDateTime(log.timestamp),
    Tipo: log.action,
    Descripción: log.description,
    Usuario: log.user_name,
    Rol: log.user_role,
    Paciente: log.patient_name,
    Medicamento: log.drug_name,
    Detalle: log.details,
  }));

  const download = (content, filename, type) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const stamp = () => new Date().toISOString().slice(0, 10);

  const exportCsv = () => {
    const rows = exportRows(filtered);
    if (rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csv = [
      headers.map(csvEscape).join(","),
      ...rows.map(row => headers.map(h => csvEscape(row[h])).join(",")),
    ].join("\n");
    download(`\uFEFF${csv}`, `bitacora-${stamp()}.csv`, "text/csv;charset=utf-8;");
  };

  const exportJson = () => {
    if (filtered.length === 0) return;
    download(JSON.stringify(exportRows(filtered), null, 2), `bitacora-${stamp()}.json`, "application/json");
  };

  const clearFilters = () => {
    setAction("todos");
    setDateFrom("");
    setDateTo("");
    setSearch("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bitácora de Auditoría</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Trazabilidad de validación, verificación, etiquetado, entrega, aplicación e inventario
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={exportJson} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" /> JSON
          </Button>
          <Button className="gap-2" onClick={exportCsv} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuario, paciente o medicamento..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={action} onValueChange={setAction}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los eventos</SelectItem>
              {ACTIONS.map(a => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <Input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{filtered.length} evento(s)</span>
          {(action !== "todos" || dateFrom || dateTo || search) && (
            <button onClick={clearFilters} className="hover:text-foreground underline underline-offset-2">
              Limpiar filtros
            </button>
          )}
          <Button variant="ghost" size="sm" className="ml-auto gap-1.5 h-7 text-xs" onClick={loadLogs}>
            <RefreshCw className="h-3 w-3" /> Actualizar
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
          Cargando bitácora...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <History className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No hay eventos registrados con estos filtros</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Fecha", "Evento", "Detalle", "Usuario", "Paciente", "Medicamento"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(log => (
                  <tr key={log.id} className="border-b border-border last:border-0 hover:bg-muted/20 align-top">
                    <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${ACTION_STYLES[log.action] || ACTION_STYLES.Otro}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm max-w-md">
                      <p>{log.description}</p>
                      {log.details && <p className="text-xs text-muted-foreground mt-0.5">{log.details}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <p>{log.user_name}</p>
                      {log.user_role && <p className="text-xs text-muted-foreground">{log.user_role}</p>}
                    </td>
                    <td className="px-4 py-3 text-sm">{log.patient_name || "—"}</td>
                    <td className="px-4 py-3 text-sm">{log.drug_name || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}