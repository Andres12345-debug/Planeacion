import { tokenHelper } from "../../utilidades/auth/tokenHelper";
import { URLS } from "../../utilidades/dominios/urls";

type Metodo = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

async function peticion<T>(
  metodo: Metodo,
  endpoint: string,
  body?: Record<string, any> | FormData
): Promise<T> {
  const token = tokenHelper.get();
  const esFormData = body instanceof FormData;

  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(!esFormData ? { "Content-Type": "application/json; charset=UTF-8" } : {}),
  };

  const opciones: RequestInit = {
    method: metodo,
    headers,
    ...(body !== undefined ? { body: esFormData ? body : JSON.stringify(body) } : {}),
  };

  const respuesta = await fetch(URLS.URL_BASE + endpoint, opciones);

  if (!respuesta.ok) {
    let mensaje = `Error ${respuesta.status}`;
    try {
      const err = await respuesta.json();
      mensaje = err.message || mensaje;
    } catch {
      // sin body JSON
    }
    throw new Error(mensaje);
  }

  if (respuesta.status === 204) return undefined as T;
  return respuesta.json();
}

export const ApiServicio = {
  get: <T>(endpoint: string) => peticion<T>("GET", endpoint),
  post: <T>(endpoint: string, body: Record<string, any> | FormData) =>
    peticion<T>("POST", endpoint, body),
  put: <T>(endpoint: string, body: Record<string, any>) =>
    peticion<T>("PUT", endpoint, body),
  patch: <T>(endpoint: string, body: Record<string, any>) =>
    peticion<T>("PATCH", endpoint, body),
  delete: <T>(endpoint: string) => peticion<T>("DELETE", endpoint),
};
