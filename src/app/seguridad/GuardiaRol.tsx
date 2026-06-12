import { Navigate, Outlet } from "react-router-dom";
import { tokenHelper } from "../utilidades/auth/tokenHelper";
import { decodeToken } from "../utilidades/auth/usuarioToken";

interface GuardiaRolProps {
  rolesPermitidos: string[];
}

// Redirige al dashboard si el rol del usuario no está en rolesPermitidos.
// Siempre se coloca dentro de <Vigilante>, así que el token ya está validado.
export const GuardiaRol = ({ rolesPermitidos }: GuardiaRolProps) => {
  const token = tokenHelper.get();

  if (!token) return <Navigate to="/login" replace />;

  const decoded = decodeToken(token);
  if (!decoded) return <Navigate to="/login" replace />;

  if (!rolesPermitidos.includes(decoded.nombre_rol)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
