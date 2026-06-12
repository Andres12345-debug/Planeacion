import { Navigate, Outlet } from "react-router-dom";
import { tokenHelper } from "../utilidades/auth/tokenHelper";
import { decodeToken } from "../utilidades/auth/usuarioToken";

type RutasVigilante = { children?: any };

export const Vigilante = ({ children }: RutasVigilante) => {
  const token = tokenHelper.get();

  if (!token) return <Navigate to="/login" replace />;

  const decoded = decodeToken(token);
  if (!decoded) {
    tokenHelper.remove();
    return <Navigate to="/login" replace />;
  }

  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    tokenHelper.remove();
    return <Navigate to="/login" replace />;
  }

  return children ?? <Outlet />;
};
