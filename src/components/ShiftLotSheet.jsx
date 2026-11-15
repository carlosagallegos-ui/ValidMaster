import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Printer, ClipboardCheck } from "lucide-react";
import { formatDate } from "@/lib/dateUtils";

const SHIFTS = [
  { id: "MATUTINO", label: "Matutino", range: "07:00 – 14:00" },
  { id: "VESPERTINO", label: "Vespertino", range: "14:00 – 20:00" },
  { id: "NOCTURNO", label: "Nocturno", range: "20:00 – 07:00" },
  { id: "JORNADA", label: "Jornada acumulada", range: "Sáb 07:00 – Lun 07:00" },
];

const AREAS = [
  { id: "Todas", label: "Todas" },
  { id: "Oncologico", label: "Oncológicos" },
  { id: "Antibiotico", label: "Antibióticos" },
  { id: "NPT", label: "NPT" },
];

const normalize = (name) => (name || "").replace(/ bolo$/i, "").replace(/ infusi[oó]n$/i, "").trim().toLowerCase();

const localDateKey = (value) => {
  const d = value ? new Date(value) : new Date();
  if (isNaN(d)) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const atHour = (base, hour) => {
  const d = new Date(base);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const weekendStart = (base) => {
  const start = new Date(base);
  const day = start.getDay();
  start.setDate(start.getDate() - (day === 0 ? 1 : day - 6));
  return atHour(start, 7);
};

const getRange = (dateStr, shift) => {
  const base = new Date(`${dateStr}T00:00:00`);
  if (shift === "MATUTINO") return { start: atHour(base, 7), end: atHour(base, 14) };
  if (shift === "VESPERTINO") return { start: atHour(base, 14), end: atHour(base, 20) };
  if (shift === "NOCTURNO") {
    const end = new Date(base);
    end.setDate(end.getDate() + 1);
    return { start: atHour(base, 20), end: atHour(end, 7) };
  }
  const start = weekendStart(base);
  const end = new Date(start);
  end.setDate(end.getDate() + 2);
  return { start, end };
};

const shiftKeyFor = (dateStr, shift) =>
  shift === "JORNADA" ? `TURNO-FDS-${localDateKey(weekendStart(new Date(`${dateStr}T00:00:00`)))}` : `TURNO-${dateStr}-${shift}`;

const areaLabel = (type) => (type === "Antibiotico" ? "Antibióticos" : type === "NPT" ? "NPT" : "Oncológicos");

export default function ShiftLotSheet() {
  const [date, setDate] = useState(localDateKey());
  const [shift, setShift] = useState("MATUTINO");
  const [area, setArea] = useState("Todas");
  const [medications, setMedications] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [records, setRecords] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const shiftKey = shiftKeyFor(date, shift);
  const { start, end } = getRange(date, shift);
  const shiftInfo = SHIFTS.find(s => s.id === shift);

  useEffect(() => {
    Promise.all([
      base44.entities.Medication.list("-received_date", 300),
      base44.entities.Prescription.list("-created_date", 300),
    ]).then(([meds, rxs]) => {
      setMedications(meds);
      setPrescriptions(rxs);
      setLoading(false);
    });
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    base44.entities.PrepLot.filter({ prescription_id: shiftKey }).then(setRecords);
  }, [shiftKey]);

  const rows = [];
  const seen = new Set();
  prescriptions
    .filter(rx => {
      const created = new Date(rx.created_date);
      if (isNaN(created) || created < start || created >= end) return false;
      return area === "Todas" || (rx.prescription_type || "Oncologico") === area;
    })
    .forEach(rx => {
      (rx.drugs || []).forEach(drug => {
        const lot = medications
          .filter(m => normalize(m.drug_name) === normalize(drug.drug_name) && m.status !== "Caducado")
          .sort((a, b) => ((a.expiration_date || "9999-12-31") > (b.expiration_date || "9999-12-31") ? 1 : -1))[0] || null;
        const lotNumber = lot?.lot_number || "—";
        const rowArea = rx.prescription_type || "Oncologico";
        const key = `${rowArea}|${drug.drug_name}|${lotNumber}`;
        if (seen.has(key)) return;
        seen.add(key);
        rows.push({
          key,
          drug_name: drug.drug_name,
          presentation: lot?.presentation || (lot ? `${lot.concentration} ${lot.concentration_unit}` : "—"),
          lot_number: lotNumber,
          area: rowArea,
          record: records.find(r => r.drug_name === drug.drug_name && (r.lot_number || "—") === lotNumber),
        });
      });
    });

  const verifiedCount = rows.filter(r => r.record?.verified).length;

  const toggleRow = async (row) => {
    const verified = !row.record?.verified;
    const data = {
      verified,
      verified_by: verified ? (user?.full_name || user?.email || "") : "",
      verified_date: verified ? new Date().toISOString() : null,
    };

    if (row.record) {
      await base44.entities.PrepLot.update(row.record.id, data);
      setRecords(prev => prev.map(r => (r.id === row.record.id ? { ...r, ...data } : r)));
    } else {
      const created = await base44.entities.PrepLot.create({
        prescription_id: shiftKey,
        patient_name: `${shiftInfo.label.toUpperCase()} · ${areaLabel(row.area).toUpperCase()}`,
        drug_name: row.drug_name,
        presentation: row.presentation,
        lot_number: row.lot_number,
        ...data,
      });
      setRecords(prev => [...prev, created]);
    }
  };

  const rowHtml = (r) =>
    `<tr><td>${r.drug_name}</td><td>${r.presentation}</td><td>${r.lot_number}</td><td class="chk">${r.record?.verified ? "☑" : "☐"}</td></tr>`;

  const printSheet = () => {
    const win = window.open("", "_blank");
    const groups = area === "Todas"
      ? AREAS.filter(a => a.id !== "Todas").map(a => ({ label: a.label, rows: rows.filter(r => r.area === a.id) })).filter(g => g.rows.length > 0)
      : [{ label: areaLabel(area), rows }];
    const body = groups.length === 0
      ? `<p style="color:#777;font-size:11px;">Sin lotes registrados en este periodo</p>`
      : groups.map(g => `
          <h2>${g.label}</h2>
          <table class="lot-table">
            <thead><tr><th>Medicamento</th><th>Presentación</th><th>Lote</th><th class="chk">Verificado</th></tr></thead>
            <tbody>${g.rows.map(rowHtml).join("")}</tbody>
          </table>`).join("");
    const periodLabel = shift === "JORNADA"
      ? `Jornada acumulada · ${formatDate(localDateKey(start))} 07:00 a ${formatDate(localDateKey(end))} 07:00`
      : `${shiftInfo.label} · ${formatDate(date)} · ${shiftInfo.range}`;

    win.document.write(`
      <html><head><title>Lotes ${shiftInfo.label} ${date}</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 24px; }
        h1 { font-size: 17px; margin: 0 0 2px; }
        h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .06em; margin: 18px 0 6px; padding-bottom: 4px; border-bottom: 1px solid #999; }
        .meta { color: #555; font-size: 11px; margin-bottom: 8px; }
        .lot-table { width: 100%; border-collapse: collapse; }
        .lot-table th, .lot-table td { border: 1px solid #999; padding: 6px 7px; font-size: 11px; text-align: left; }
        .lot-table th { background: #f1f1f1; text-transform: uppercase; font-size: 10px; }
        .lot-table td.chk, .lot-table th.chk { text-align: center; width: 70px; font-size: 14px; }
        .footer { margin-top: 26px; display: flex; justify-content: space-between; font-size: 11px; color: #444; }
        @media print { body { margin: 10px; } }
      </style></head><body>
      <h1>Hoja de Lotes · Área de Preparación</h1>
      <div class="meta">${periodLabel} &nbsp;|&nbsp; Total de lotes: <strong>${rows.length}</strong> &nbsp;|&nbsp; Verificados: <strong>${verifiedCount}</strong></div>
      ${body}
      <div class="footer"><span>Verificó: ______________________________</span><span>Fecha / hora: ____________________</span></div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
  };

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Hoja consolidada por turno y área</p>
            <p className="text-xs text-muted-foreground">Todos los lotes que ingresan al área, sin depender de una preparación</p>
          </div>
          <div className="flex items-end gap-2">
            <div>
              <label className="text-[11px] uppercase tracking-wider text-muted-foreground">Fecha</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-40 h-9" />
            </div>
            <Button size="sm" className="gap-1" onClick={printSheet}>
              <Printer className="h-4 w-4" /> Imprimir
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {SHIFTS.map(s => (
            <Button
              key={s.id}
              variant={shift === s.id ? "default" : "outline"}
              size="sm"
              className="text-xs"
              onClick={() => setShift(s.id)}
            >
              {s.label} <span className="opacity-60 font-normal">{s.range}</span>
            </Button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-1 border-t border-border">
          {AREAS.map(a => (
            <Button
              key={a.id}
              variant={area === a.id ? "secondary" : "ghost"}
              size="sm"
              className="text-xs"
              onClick={() => setArea(a.id)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/20 flex flex-wrap items-center gap-3">
          <ClipboardCheck className="h-4 w-4 text-primary" />
          <div>
            <p className="font-semibold text-sm">
              {shiftInfo.label} · {area === "Todas" ? "Todas las áreas" : areaLabel(area)}
            </p>
            <p className="text-xs text-muted-foreground">
              {shift === "JORNADA"
                ? `${formatDate(localDateKey(start))} 07:00 a ${formatDate(localDateKey(end))} 07:00`
                : `${formatDate(date)} · ${shiftInfo.range}`}
            </p>
          </div>
          <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
            {verifiedCount}/{rows.length} verificados
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Medicamento</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Presentación</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Lote</th>
                {area === "Todas" && (
                  <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Área</th>
                )}
                <th className="text-center px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">Verificar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">Cargando lotes...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-6 text-center text-sm text-muted-foreground">Sin lotes registrados en este turno.</td></tr>
              ) : (
                rows.map(row => (
                  <tr key={row.key} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-2.5 text-sm font-medium">{row.drug_name}</td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">{row.presentation}</td>
                    <td className="px-4 py-2.5 text-sm font-mono">{row.lot_number}</td>
                    {area === "Todas" && (
                      <td className="px-4 py-2.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          row.area === "Antibiotico" ? "bg-emerald-100 text-emerald-700" :
                          row.area === "NPT" ? "bg-amber-100 text-amber-700" :
                          "bg-violet-100 text-violet-700"
                        }`}>
                          {row.area === "Antibiotico" ? "ATB" : row.area === "NPT" ? "NPT" : "QT"}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-2.5 text-center">
                      <Checkbox checked={!!row.record?.verified} onCheckedChange={() => toggleRow(row)} className="mx-auto" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}