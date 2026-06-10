import { ApiServicio } from "../reutilizables/ApiServicio";
import { URLS } from "../../utilidades/dominios/urls";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface Entidad {
  codEntidad: number;
  nombreEntidad: string;
  tipoEntidad: string;
  nit: string;
  estado: boolean;
  codCiudad: number;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const EntidadesServicio = {
  listar: () => ApiServicio.get<Entidad[]>(URLS.ENTIDADES_TODOS),

  detalle: (id: number) => ApiServicio.get<Entidad>(URLS.ENTIDAD(id)),
};
