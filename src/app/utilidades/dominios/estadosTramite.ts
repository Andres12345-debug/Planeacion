// ── Tipos ─────────────────────────────────────────────────────────────────────
// Deben mantenerse en sync con EstadoTramiteEnum / EstadoPasoEnum del backend
// (src/modelos/enums/*.enum.ts).

export type EstadoTramite = "EN_PROCESO" | "COMPLETADO" | "ANULADO" | "DEVUELTO" | "CANCELADO";

export type EstadoPaso =
  | "PENDIENTE"
  | "HABILITADO"
  | "EN_REVISION"
  | "APROBADO"
  | "DEVUELTO"
  | "EN_SUBSANACION"
  | "REENVIADO"
  | "RECHAZADO"
  | "CERRADO";

// ── Constantes de display ─────────────────────────────────────────────────────

export const ESTADO_TRAMITE: Record<EstadoTramite, { label: string; color: "info" | "success" | "error" | "default" }> = {
  EN_PROCESO: { label: "En proceso", color: "info" },
  COMPLETADO: { label: "Completado", color: "success" },
  ANULADO:    { label: "Anulado",    color: "error" },
  DEVUELTO:   { label: "Devuelto",   color: "error" },
  CANCELADO:  { label: "Cancelado",  color: "default" },
};

export const ESTADO_PASO: Record<EstadoPaso, { label: string; color: "default" | "primary" | "info" | "success" | "error" | "warning" | "secondary" }> = {
  PENDIENTE:       { label: "Pendiente",        color: "default" },
  HABILITADO:      { label: "Habilitado",       color: "primary" },
  EN_REVISION:     { label: "En revisión",      color: "info" },
  APROBADO:        { label: "Aprobado",          color: "success" },
  DEVUELTO:        { label: "Devuelto",          color: "error" },
  EN_SUBSANACION:  { label: "En subsanación",   color: "warning" },
  REENVIADO:       { label: "Reenviado",         color: "secondary" },
  RECHAZADO:       { label: "Rechazado",         color: "error" },
  CERRADO:         { label: "Cerrado",           color: "success" },
};
