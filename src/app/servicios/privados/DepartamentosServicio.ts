import { ApiServicio } from "../reutilizables/ApiServicio";
import { URLS } from "../../utilidades/dominios/urls";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface Departamento {
  codDepartamento: number;
  codEntidad: number;
  nombreDepartamento: string;
  descripcion?: string;
  estado: boolean;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const DepartamentosServicio = {
  // solo admin: GET /privado/departamentos
  listar: () => ApiServicio.get<Departamento[]>(URLS.DEPARTAMENTOS_TODOS),
};
