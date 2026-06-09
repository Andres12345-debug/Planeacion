import { ApiServicio } from "../reutilizables/ApiServicio";
import { URLS } from "../../utilidades/dominios/urls";

export const DocumentosServicio = {
  subir: (tramiteId: number, pasoId: number, archivo: File, descripcion?: string) => {
    const form = new FormData();
    form.append("file", archivo);
    if (descripcion) form.append("descripcion", descripcion);
    return ApiServicio.post<void>(URLS.DOCS_SUBIR(tramiteId, pasoId), form);
  },

  listar: (tramiteId: number, pasoId: number) =>
    ApiServicio.get<unknown[]>(URLS.DOCS_LISTAR(tramiteId, pasoId)),
};
