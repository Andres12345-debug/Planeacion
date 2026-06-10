import { ApiServicio } from "../reutilizables/ApiServicio";
import { URLS } from "../../utilidades/dominios/urls";

export const PasosServicio = {
  iniciarRevision: (tramiteId: number, pasoId: number, observacion?: string) =>
    ApiServicio.post<void>(URLS.PASO_INICIAR(tramiteId, pasoId), observacion ? { observacion } : {}),

  subsanar: (tramiteId: number, pasoId: number, observacion: string) =>
    ApiServicio.post<void>(URLS.PASO_SUBSANAR(tramiteId, pasoId), { observacion }),

  reenviar: (tramiteId: number, pasoId: number, observacion: string) =>
    ApiServicio.post<void>(URLS.PASO_REENVIAR(tramiteId, pasoId), { observacion }),

  aprobar: (tramiteId: number, pasoId: number, observacion?: string) =>
    ApiServicio.post<void>(URLS.PASO_APROBAR(tramiteId, pasoId), observacion ? { observacion } : {}),

  devolver: (tramiteId: number, pasoId: number, observacion: string) =>
    ApiServicio.post<void>(URLS.PASO_DEVOLVER(tramiteId, pasoId), { observacion }),

  asignarFuncionario: (tramiteId: number, pasoId: number, codFuncionarioAsignado: number) =>
    ApiServicio.post<void>(URLS.PASO_ASIGNAR(tramiteId, pasoId), { codFuncionarioAsignado }),
};
