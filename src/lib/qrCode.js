// Código QR de la etiqueta: al escanearlo abre la ficha de la mezcla en el celular.

// Ruta interna de la ficha, resuelta sobre el dominio desde el que se imprime
// (app publicada, dominio propio o vista previa).
export function mixUrl(prescriptionId) {
  if (!prescriptionId) return "";
  return `${window.location.origin}/prescripcion/${prescriptionId}`;
}

// La imagen del QR se resuelve como PNG para poder imprimirla en la etiqueta.
export function qrImageUrl(text, size = 160) {
  if (!text) return "";
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=0&data=${encodeURIComponent(text)}`;
}