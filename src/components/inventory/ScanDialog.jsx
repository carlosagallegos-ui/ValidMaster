import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, FilePlus2, Pencil, ScanLine } from "lucide-react";
import moment from "moment";
import BarcodeInput from "@/components/inventory/BarcodeInput";

const Row = ({ label, value, mono }) => (
  <div className="flex items-start justify-between gap-3 py-1.5 border-b border-border last:border-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span className={`text-sm text-right font-medium ${mono ? "font-mono" : ""}`}>{value || "—"}</span>
  </div>
);

export default function ScanDialog({ open, onOpenChange, onLookup, onRegisterLot, onEdit }) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState(undefined); // undefined = sin consultar, null = no registrado
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!open) { setCode(""); setResult(undefined); setLoading(false); } }, [open]);

  const handleCode = async (value) => {
    setCode(value);
    setLoading(true);
    const found = await onLookup(value);
    setResult(found || null);
    setLoading(false);
  };

  const daysToExpire = result?.expiration_date ? moment(result.expiration_date).diff(moment(), "days") : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-primary" /> Escanear código de barras
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <BarcodeInput onCode={handleCode} disabled={loading} />

          {loading && <p className="text-sm text-muted-foreground">Buscando lote...</p>}

          {result && (
            <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-1">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-semibold">{result.drug_name}</p>
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-card border border-border font-mono">{result.barcode}</span>
              </div>
              <Row label="Concentración" value={`${result.concentration ?? "—"} ${result.concentration_unit || ""}${result.vial_volume_ml ? ` / ${result.vial_volume_ml} mL` : ""}`} mono />
              <Row label="Presentación" value={result.presentation} />
              <Row label="Lote" value={result.lot_number} mono />
              <Row label="Caducidad" value={result.expiration_date ? moment(result.expiration_date).format("DD/MM/YYYY") : "—"} mono />
              <Row label="Área" value={result.area} />
              <Row label="Disponibles" value={`${result.quantity_available ?? result.quantity_received ?? 0} de ${result.quantity_received ?? 0}`} mono />
              <Row label="Proveedor" value={result.supplier} />
              <Row label="Estado" value={result.status || "Disponible"} />
              {result.expiration_date && daysToExpire !== null && daysToExpire < 0 && (
                <p className="text-xs text-red-600 font-medium flex items-center gap-1 pt-2">
                  <AlertTriangle className="h-3 w-3" /> Lote caducado hace {Math.abs(daysToExpire)} días
                </p>
              )}
              {result.expiration_date && daysToExpire !== null && daysToExpire >= 0 && daysToExpire <= 30 && (
                <p className="text-xs text-amber-600 font-medium flex items-center gap-1 pt-2">
                  <AlertTriangle className="h-3 w-3" /> Caduca en {daysToExpire} días
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-3">
                <Button size="sm" variant="outline" className="gap-1" onClick={() => { onEdit(result); onOpenChange(false); }}>
                  <Pencil className="h-3.5 w-3.5" /> Editar lote
                </Button>
                <Button size="sm" variant="outline" className="gap-1" onClick={() => { onRegisterLot(result); onOpenChange(false); }}>
                  <FilePlus2 className="h-3.5 w-3.5" /> Nuevo lote de este medicamento
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setResult(undefined); setCode(""); }}>Escanear otro</Button>
              </div>
            </div>
          )}

          {result === null && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <p className="text-sm font-semibold text-amber-800">Código no registrado</p>
              </div>
              <p className="text-xs text-amber-700 font-mono break-all">{code}</p>
              <div className="flex gap-2">
                <Button size="sm" className="gap-1" onClick={() => { onRegisterLot({ barcode: code }); onOpenChange(false); }}>
                  <FilePlus2 className="h-3.5 w-3.5" /> Dar de alta este lote
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setResult(undefined); setCode(""); }}>Escanear otro</Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}