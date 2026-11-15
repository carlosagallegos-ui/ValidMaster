import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Printer, Package, FlaskConical, AlertTriangle } from "lucide-react";
import moment from "moment";

const SIN_AREA = "SIN ÁREA ASIGNADA";

const getArea = (med) =>
  (med.area && med.area.trim()) ||
  (med.storage_conditions && med.storage_conditions.trim()) ||
  SIN_AREA;

function printHoja(areaName, list) {
  const rows = list.map(m => {
    const conc = `${m.concentration ?? ""} ${m.concentration_unit || ""}${m.vial_volume_ml ? ` / ${m.vial_volume_ml} mL` : ""}`.trim();
    return `<tr>
      <td>${m.drug_name || ""}</td>
      <td>${conc}</td>
      <td>${m.presentation || ""}</td>
      <td class="mono">${m.lot_number || "—"}</td>
      <td class="mono">${m.expiration_date ? moment(m.expiration_date).format("DD/MM/YYYY") : "—"}</td>
      <td class="mono">${m.quantity_received ?? ""}</td>
      <td class="mono">${m.quantity_available ?? m.quantity_received ?? ""}</td>
      <td>${m.supplier || ""}</td>
      <td>${m.status || ""}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
  <title>Hoja de lotes · ${areaName}</title>
  <style>
    *{box-sizing:border-box}
    body{font-family:Arial,Helvetica,sans-serif;color:#111;margin:28px;font-size:11px}
    h1{font-size:16px;margin:0 0 2px;letter-spacing:.5px}
    .sub{font-size:10px;color:#555;margin:0 0 12px}
    .meta{display:flex;gap:18px;flex-wrap:wrap;border-top:2px solid #0b81b7;border-bottom:1px solid #ccc;padding:6px 0;margin-bottom:12px;font-size:11px}
    table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #bbb;padding:4px 5px;text-align:left;vertical-align:top}
    th{background:#eef4f8;font-size:10px;text-transform:uppercase;letter-spacing:.3px}
    .mono{font-family:"Courier New",monospace}
    .sign{display:flex;gap:40px;margin-top:40px}
    .sign div{flex:1;border-top:1px solid #333;padding-top:4px;font-size:10px;text-align:center}
    @page{size:letter;margin:12mm}
  </style></head><body>
    <h1>HOJA DE LOTES POR ÁREA</h1>
    <p class="sub">SIVF-ME · Centro de Mezclas Estériles</p>
    <div class="meta">
      <span><strong>Área:</strong> ${areaName}</span>
      <span><strong>Fecha de impresión:</strong> ${moment().format("DD/MM/YYYY HH:mm")}</span>
      <span><strong>Lotes:</strong> ${list.length}</span>
      <span><strong>Frascos disponibles:</strong> ${list.reduce((s, m) => s + (m.quantity_available ?? m.quantity_received ?? 0), 0)}</span>
    </div>
    <table>
      <thead><tr>
        <th>Medicamento</th><th>Concentración</th><th>Presentación</th><th>Lote</th>
        <th>Caducidad</th><th>Recibidos</th><th>Disponibles</th><th>Proveedor</th><th>Estado</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="sign">
      <div>Elaboró</div><div>Revisó</div><div>Vo. Bo.</div>
    </div>
  </body></html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  w.print();
}

export default function HojasLotes() {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeArea, setActiveArea] = useState("TODAS");

  useEffect(() => {
    base44.entities.Medication.list("-received_date", 500).then(data => {
      setMedications(data);
      setLoading(false);
    });
  }, []);

  const matchesSearch = (m) =>
    !search ||
    m.drug_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.lot_number?.toLowerCase().includes(search.toLowerCase()) ||
    m.supplier?.toLowerCase().includes(search.toLowerCase());

  const areas = [...new Set(medications.map(getArea))].sort((a, b) => {
    if (a === SIN_AREA) return 1;
    if (b === SIN_AREA) return -1;
    return a.localeCompare(b);
  });

  const visible = medications.filter(m =>
    matchesSearch(m) && (activeArea === "TODAS" || getArea(m) === activeArea)
  );

  const grouped = visible.reduce((acc, m) => {
    const area = getArea(m);
    acc[area] = acc[area] || [];
    acc[area].push(m);
    return acc;
  }, {});

  const areaNames = Object.keys(grouped).sort((a, b) => {
    if (a === SIN_AREA) return 1;
    if (b === SIN_AREA) return -1;
    return a.localeCompare(b);
  });

  const totalFrascos = visible.reduce((s, m) => s + (m.quantity_available ?? m.quantity_received ?? 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hoja de Lotes por Área</h1>
          <p className="text-sm text-muted-foreground mt-1">Lotes de medicamentos resguardados en cada área del centro</p>
        </div>
        <Button className="gap-2" onClick={() => printHoja(activeArea === "TODAS" ? "Todas las áreas" : activeArea, visible)} disabled={visible.length === 0}>
          <Printer className="h-4 w-4" /> Imprimir hoja
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center mb-2">
            <Package className="h-4 w-4 text-foreground" />
          </div>
          <p className="text-2xl font-bold tracking-tight">{visible.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Lotes en la hoja</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
            <FlaskConical className="h-4 w-4 text-primary" />
          </div>
          <p className="text-2xl font-bold tracking-tight">{totalFrascos}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Frascos disponibles</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold tracking-tight">{areaNames.filter(a => a !== SIN_AREA).length}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Áreas con lotes</p>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por medicamento, lote o proveedor..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {["TODAS", ...areas].map(area => (
          <button
            key={area}
            onClick={() => setActiveArea(area)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              activeArea === area
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {area === "TODAS" ? "Todas las áreas" : area}
          </button>
        ))}
      </div>

      {areaNames.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No hay lotes que coincidan</p>
        </div>
      ) : (
        <div className="space-y-6">
          {areaNames.map(area => {
            const list = grouped[area];
            const frascos = list.reduce((s, m) => s + (m.quantity_available ?? m.quantity_received ?? 0), 0);
            return (
              <div key={area} className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="font-semibold text-sm">{area}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {list.length} lote(s) · {frascos} frasco(s) disponible(s)
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => printHoja(area, list)}>
                    <Printer className="h-3.5 w-3.5" /> Imprimir área
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        {["Medicamento", "Concentración", "Lote", "Caducidad", "Recibidos", "Disponibles", "Proveedor", "Estado"].map(h => (
                          <th key={h} className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {list.map(med => {
                        const days = med.expiration_date ? moment(med.expiration_date).diff(moment(), "days") : null;
                        const soon = days !== null && days <= 30;
                        return (
                          <tr key={med.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-2.5">
                              <div className="flex items-center gap-2">
                                <FlaskConical className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                                <span className="text-sm font-medium">{med.drug_name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-2.5 text-sm font-mono">
                              {med.concentration} {med.concentration_unit}{med.vial_volume_ml ? ` / ${med.vial_volume_ml} mL` : ""}
                            </td>
                            <td className="px-4 py-2.5 text-sm font-mono">{med.lot_number || "—"}</td>
                            <td className="px-4 py-2.5 text-sm">
                              {med.expiration_date ? (
                                <span className={soon ? "text-amber-600 font-medium" : ""}>
                                  {moment(med.expiration_date).format("DD/MM/YYYY")}
                                </span>
                              ) : "—"}
                            </td>
                            <td className="px-4 py-2.5 text-sm font-mono text-center">{med.quantity_received}</td>
                            <td className="px-4 py-2.5 text-sm font-mono text-center font-semibold">{med.quantity_available ?? med.quantity_received}</td>
                            <td className="px-4 py-2.5 text-sm text-muted-foreground">{med.supplier || "—"}</td>
                            <td className="px-4 py-2.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-muted/40 text-muted-foreground border-border">
                                {med.status || "Disponible"}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}