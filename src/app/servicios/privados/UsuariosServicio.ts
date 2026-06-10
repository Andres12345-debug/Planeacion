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

export interface CrearUsuarioPayload {
  codRol: number;
  nombreUsuario: string;
  fechaNacimientoUsuario: string;
  telefonoUsuario: string;
  sexoBiologico: number;
  cedula: string;
  correoUsuario: string;
  claveAcceso: string;
  codEntidad: number;
  codDepartamento?: number;
  cargo: string;
}

export interface AsignarEntidadPayload {
  codEntidad: number;
  codDepartamento: number;
  cargo: string;
  codRol: 2 | 3 | 5;
}

export interface UsuarioVinculado {
  codUsuario: number;
  nombreUsuario: string;
  cedula?: string;
  rolActual: string;
  departamento: string;
  vinculoCreado: {
    entidad: string;
    cargo: string;
    fechaAsignacion: string;
  } | null;
}

// ── Servicio ──────────────────────────────────────────────────────────────────

export const UsuariosServicio = {
  // admin/supervisor: GET /privado/usuarios/todos
  // (admin ve todos, supervisor ve solo los de su entidad)
  listar: () => ApiServicio.get<UsuarioResumen[]>(URLS.USUARIOS_TODOS),

  // admin (cualquier entidad) / supervisor (su entidad): POST /privado/usuarios/agregar
  crear: (datos: CrearUsuarioPayload) =>
    ApiServicio.post<{ mensaje: string }>(URLS.USUARIOS_AGREGAR, datos),

  // solo admin: DELETE /privado/usuarios/delete/:id
  eliminar: (id: number) =>
    ApiServicio.delete<{ mensaje: string }>(URLS.USUARIO_ELIMINAR(id)),

  // solo admin: PUT /privado/usuarios/asignar-entidad/:id
  asignarEntidad: (id: number, datos: AsignarEntidadPayload) =>
    ApiServicio.put<{ mensaje: string; usuario: UsuarioVinculado }>(
      URLS.USUARIO_ASIGNAR_ENTIDAD(id),
      datos
    ),
};
