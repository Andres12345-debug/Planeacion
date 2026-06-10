import { ApiServicio } from "../reutilizables/ApiServicio";
import { URLS } from "../../utilidades/dominios/urls";

// ── Tipos ─────────────────────────────────────────────────────────────────────

export interface UsuarioResumen {
  cod_usuario: number;
  nombre_usuario: string;
  telefono_usuario?: string;
  cedula?: string;
  correo_usuario?: string;
  nombre_rol: string;
  nombre_entidad?: string;
  cargo?: string;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const UsuariosServicio = {
  // admin/supervisor/funcionario: GET /privado/usuarios/todos
  // (admin ve todos, supervisor/funcionario ven solo los de su entidad)
  listar: () => ApiServicio.get<UsuarioResumen[]>(URLS.USUARIOS_TODOS),
};
