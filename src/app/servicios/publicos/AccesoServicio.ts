import { URLS } from "../../utilidades/dominios/urls";

async function peticionPublica<T>(
  metodo: "POST" | "PATCH",
  endpoint: string,
  body: Record<string, any>
): Promise<T> {
  const respuesta = await fetch(URLS.URL_BASE + endpoint, {
    method: metodo,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json; charset=UTF-8" },
  });

  if (!respuesta.ok) {
    let mensaje = "Error en la solicitud";
    try {
      const err = await respuesta.json();
      mensaje = err.message || mensaje;
    } catch {
      // sin body JSON
    }
    throw new Error(mensaje);
  }

  return respuesta.json();
}

export const AccesoServicio = {
  iniciarSesion: (body: { username: string; claveAcceso: string }) =>
    peticionPublica<{ token: string; mensaje: string }>("POST", URLS.INICIAR_SESION, body),

  registrarUsuario: (body: Record<string, any>) =>
    peticionPublica<{ token: string; mensaje: string }>("POST", URLS.REGISTRO, body),

  recuperarContrasenia: (body: { correoUsuario: string }) =>
    peticionPublica<{ mensaje: string }>("POST", URLS.RECUPERAR_PASSWORD, body),

  nuevaContrasenia: (token: string, body: { nuevaClave: string }) =>
    peticionPublica<{ mensaje: string }>("PATCH", URLS.NUEVA_PASSWORD, { token, ...body }),
};
