import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScanLine, Camera, CameraOff } from "lucide-react";

const FORMATS = ["code_128", "code_39", "code_93", "ean_13", "ean_8", "upc_a", "upc_e", "itf", "codabar", "qr_code", "data_matrix"];

export default function BarcodeInput({ onCode, disabled }) {
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const [value, setValue] = useState("");
  const [camera, setCamera] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!camera) inputRef.current?.focus();
  }, [camera]);

  const submit = () => {
    const code = value.trim();
    if (!code) return;
    onCode(code);
    setValue("");
  };

  useEffect(() => {
    if (!camera) return;
    let cancelled = false;

    const start = async () => {
      if (!("BarcodeDetector" in window)) {
        setError("Este navegador no escanea con cámara. Usa un lector USB o escribe el código.");
        setCamera(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        let detector;
        try {
          detector = new window.BarcodeDetector({ formats: FORMATS });
        } catch {
          detector = new window.BarcodeDetector();
        }
        timerRef.current = setInterval(async () => {
          if (!videoRef.current) return;
          try {
            const found = await detector.detect(videoRef.current);
            if (found.length > 0) {
              const code = found[0].rawValue;
              stopCamera();
              onCode(code);
            }
          } catch {
            /* frame no legible */
          }
        }, 400);
      } catch {
        setError("No se pudo abrir la cámara. Revisa los permisos o usa el lector USB.");
        setCamera(false);
      }
    };

    start();
    return () => { cancelled = true; stopCamera(); };
  }, [camera]);

  const stopCamera = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <ScanLine className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={value}
            disabled={disabled || camera}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); submit(); } }}
            placeholder="Pasa el lector o escribe el código y presiona Enter"
            className="pl-10"
          />
        </div>
        <Button type="button" variant={camera ? "secondary" : "outline"} onClick={() => { setError(""); setCamera(c => !c); }}>
          {camera ? <CameraOff className="h-4 w-4" /> : <Camera className="h-4 w-4" />}
          <span className="hidden sm:inline">{camera ? "Detener" : "Cámara"}</span>
        </Button>
      </div>

      {camera && (
        <div className="rounded-lg overflow-hidden border border-border bg-black">
          <video ref={videoRef} className="w-full max-h-64 object-cover" playsInline muted />
        </div>
      )}

      {error && <p className="text-xs text-amber-600">{error}</p>}
      <p className="text-[11px] text-muted-foreground">
        Compatible con lectores USB/Bluetooth (modo teclado). En el celular puedes usar la cámara.
      </p>
    </div>
  );
}