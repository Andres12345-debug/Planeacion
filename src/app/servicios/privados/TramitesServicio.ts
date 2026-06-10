import { ApiServicio } from "../reutilizables/ApiServicio";
import { URLS } from "../../utilidades/dominios/urls";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export type EstadoTramite = "EN_PROCESO" | "COMPLETADO" | "ANULADO" | "CANCELADO";
export type EstadoPaso =
  | "PENDIENTE"
  | "HABILITADO"
  | "EN_REVISION"
  | "APROBADO"
  | "DEVUELTO"
  | "EN_SUBSANACION"
  | "REENVIADO"
  | "CERRADO";

export interface TramiteResumen {
  codTramite: number;
  codigoExpediente: string;
  tipoTramite: string;
  estado: EstadoTramite;
  progreso: number;
  fechaCreacion: string;
}

export interface PasoDetalle {
  codTramitePaso: number;          // ID que va en la URL de todas las acciones
  codPaso: number;                 // ID del paso plantilla
  estado: EstadoPaso;
  habilitado: boolean;
  codDepartamentoResponsable: number;
  numeroDevoluciones?: number;
  fechaInicio?: string;
  fechaFin?: string;
  paso: {
    codigo: string;
    nombre: string;
    requiereDocumentos: boolean;
    ordenVisual?: number;
  };
  documentos?: Array<{
    codDocumentoPaso: number;
    nombreDocumento: string;
    fechaCarga: string;
    estadoValidacion?: string;
  }>;
}

export interface TramiteDetalle {
  codTramite: number;
  codigoExpediente: string;
  tipoTramite: string;
  estado: EstadoTramite;
  progreso: number;
  pasos: PasoDetalle[];
}

export interface PaginadoTramites {
  data: TramiteResumen[];
  total: number;
  page: number;
  limit: number;
}

export interface IniciarTramiteDto {
  codEntidadAsignada: number;
  observacionInicial?: string;
}

export interface TramiteIniciado {
  codTramite: number;
  codigoExpediente: string;
  pasos: PasoDetalle[];
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const TramitesServicio = {
  listar: (filtros?: { estado?: EstadoTramite }) => {
    const params = filtros
      ? "?" + new URLSearchParams(filtros as Record<string, string>).toString()
      : "";
    return ApiServicio.get<PaginadoTramites>(URLS.TRAMITES + params);
  },

  detalle: (id: number) =>
    ApiServicio.get<TramiteDetalle>(URLS.TRAMITE_DETALLE(id)),

  iniciar: (workflowId: number, body: IniciarTramiteDto) =>
    ApiServicio.post<TramiteIniciado>(URLS.INICIAR_TRAMITE(workflowId), body),

  timeline: (id: number) =>
    ApiServicio.get<unknown[]>(URLS.TRAMITE_TIMELINE(id)),
};
