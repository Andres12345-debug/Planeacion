import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet } from "react-router-dom";
import { tokenHelper } from "../utilidades/auth/tokenHelper";

interface TokenPayload {
  nombre_rol: string;
}

interface GuardiaRolProps {
  rolesPermitidos: string[];
}

// Redirige al dashboard si el rol del usuario no está en rolesPermitidos.
// Siempre se coloca dentro de <Vigilante>, así que el token ya está validado.
export const GuardiaRol = ({ rolesPermitidos }: GuardiaRolProps) => {
  const token = tokenHelper.get();

  if (!token) return <Navigate to="/login" replace />;

  try {
    const { nombre_rol } = jwtDecode<TokenPayload>(token);
    if (!rolesPermitidos.includes(nombre_rol)) {
      return <Navigate to="/dashboard" replace />;
    }
  } catch {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
