import { ApiServicio } from "../reutilizables/ApiServicio";
import { URLS } from "../../utilidades/dominios/urls";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface CrearWorkflowDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo?: boolean;
}

export interface EtapaResumen {
  codEtapa: number;
  nombre: string;
  orden: number;
  codDepartamentoResponsable: number;
}

export interface PasoResumen {
  codPaso: number;
  codigo: string;
  nombre: string;
  ordenVisual: number;
  requiereDocumentos?: boolean;
  visibleCiudadano?: boolean;
}

export interface WorkflowCreado {
  codWorkflow: number;
  codigo: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  etapas?: EtapaResumen[];
  pasos?: PasoResumen[];
}

export interface PaginadoWorkflows {
  data: WorkflowCreado[];
  total: number;
  page: number;
  limit: number;
}

export interface CrearEtapaDto {
  nombre: string;
  codDepartamentoResponsable: number;
  descripcion?: string;
  orden: number;
}

export interface EtapaCreada {
  codEtapa: number;
  codWorkflow: number;
  nombre: string;
  codDepartamentoResponsable: number;
  descripcion?: string;
  orden: number;
}

export type CanalPaso = "VIRTUAL" | "PRESENCIAL" | "MIXTO";

export interface CrearPasoDto {
  codigo: string;
  nombre: string;
  descripcion?: string;
  canal: CanalPaso;
  slaDias: number;
  ordenVisual: number;
  requiereDocumentos: boolean;
  permiteSubsanacion: boolean;
  visibleCiudadano: boolean;
  activo?: boolean;
}

export interface PasoCreado {
  codPaso: number;
  codWorkflow: number;
  codEtapa: number;
  codigo: string;
  nombre: string;
  canal: CanalPaso;
  slaDias: number;
  ordenVisual: number;
  requiereDocumentos: boolean;
  permiteSubsanacion: boolean;
  visibleCiudadano: boolean;
  activo: boolean;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const WorkflowServicio = {
  crear: (body: CrearWorkflowDto) =>
    ApiServicio.post<WorkflowCreado>(URLS.WORKFLOWS, body),

  listar: (filtros?: { activo?: boolean; nombre?: string }) => {
    const params = filtros
      ? "?" + new URLSearchParams(filtros as Record<string, string>).toString()
      : "";
    return ApiServicio.get<PaginadoWorkflows>(URLS.WORKFLOWS + params);
  },

  detalle: (id: number) =>
    ApiServicio.get<WorkflowCreado>(URLS.WORKFLOW(id)),

  actualizar: (id: number, body: Partial<CrearWorkflowDto>) =>
    ApiServicio.put<WorkflowCreado>(URLS.WORKFLOW(id), body),

  eliminar: (id: number) =>
    ApiServicio.delete<void>(URLS.WORKFLOW(id)),

  crearEtapa: (workflowId: number, body: CrearEtapaDto) =>
    ApiServicio.post<EtapaCreada>(URLS.WORKFLOW_ETAPAS(workflowId), body),

  actualizarEtapa: (workflowId: number, etapaId: number, body: Partial<CrearEtapaDto>) =>
    ApiServicio.put<EtapaCreada>(URLS.WORKFLOW_ETAPA(workflowId, etapaId), body),

  eliminarEtapa: (workflowId: number, etapaId: number) =>
    ApiServicio.delete<void>(URLS.WORKFLOW_ETAPA(workflowId, etapaId)),

  crearPaso: (workflowId: number, etapaId: number, body: CrearPasoDto) =>
    ApiServicio.post<PasoCreado>(URLS.WORKFLOW_PASOS(workflowId, etapaId), body),

  actualizarPaso: (pasoId: number, body: Partial<CrearPasoDto>) =>
    ApiServicio.put<PasoCreado>(URLS.WORKFLOW_PASO(pasoId), body),

  eliminarPaso: (pasoId: number) =>
    ApiServicio.delete<void>(URLS.WORKFLOW_PASO(pasoId)),
};
