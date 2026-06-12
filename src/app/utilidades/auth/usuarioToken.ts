import { jwtDecode } from "jwt-decode";
import { tokenHelper } from "./tokenHelper";

export interface TokenPayload {
  sub: number;
  name: string;
  nombre_rol: string;
  cod_entidad: number | null;
  cod_departamento: number | null;
  exp?: number;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
}

// Lee el token de sessionStorage y lo decodifica. Devuelve null si no hay
// token o si está corrupto.
export function useUsuarioToken(): TokenPayload | null {
  const token = tokenHelper.get();
  if (!token) return null;
  return decodeToken(token);
}
