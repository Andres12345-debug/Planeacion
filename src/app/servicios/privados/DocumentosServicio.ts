import { ApiServicio, parsearError } from "../reutilizables/ApiServicio";
import { URLS } from "../../utilidades/dominios/urls";
import { tokenHelper } from "../../utilidades/auth/tokenHelper";

export const DocumentosServicio = {
  subir: (tramiteId: number, pasoId: number, archivo: File, descripcion?: string) => {
    const form = new FormData();
    form.append("file", archivo);
    if (descripcion) form.append("descripcion", descripcion);
    return ApiServicio.post<void>(URLS.DOCS_SUBIR(tramiteId, pasoId), form);
  },

  listar: (tramiteId: number, pasoId: number) =>
    ApiServicio.get<unknown[]>(URLS.DOCS_LISTAR(tramiteId, pasoId)),

  // El endpoint devuelve el binario con Content-Disposition: attachment, así que
  // no se puede usar un <a href> directo (necesita el header Authorization).
  descargar: async (tramiteId: number, pasoId: number, docId: number, nombreArchivo: string) => {
    const token = tokenHelper.get();
    const respuesta = await fetch(URLS.URL_BASE + URLS.DOCS_DESCARGAR(tramiteId, pasoId, docId), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

    if (!respuesta.ok) {
      throw new Error(await parsearError(respuesta));
    }

    const blob = await respuesta.blob();
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  },
};
