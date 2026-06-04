import { jwtDecode } from "jwt-decode";
import { Navigate, Outlet } from "react-router-dom";
import { tokenHelper } from "../utilidades/auth/tokenHelper";

type RutasVigilante = { children?: any };

interface TokenPayload {
  exp?: number;
}

export const Vigilante = ({ children }: RutasVigilante) => {
  const token = tokenHelper.get();

  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode<TokenPayload>(token);
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      tokenHelper.remove();
      return <Navigate to="/login" replace />;
    }
  } catch {
    tokenHelper.remove();
    return <Navigate to="/login" replace />;
  }

  return children ?? <Outlet />;
};
