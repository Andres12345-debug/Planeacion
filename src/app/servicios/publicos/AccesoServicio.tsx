import { Login } from "../../modelos/InicioSesion";
import { URLS } from "../../utilidades/dominios/urls";

export class AccesoServicio {
  public static async iniciarSesion(objLogin: Login): Promise<any> {
    const datosEnviar = {
      method: "POST",
      body: JSON.stringify(objLogin),
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    };

    const urlEnviar = URLS.URL_BASE + URLS.INICIAR_SESION;

    const respuesta = await fetch(urlEnviar, datosEnviar);

    if (!respuesta.ok) {
      let mensaje = "Error en la autenticación";

      try {
        const errorData = await respuesta.json();
        mensaje = errorData.message || mensaje;
      } catch {
        // fallback si no viene JSON
      }

      throw new Error(mensaje);
    }

    return await respuesta.json();
  }

  public static async recuperarContrasenia(correo: { correoUsuario: string }): Promise<any> {
    const respuesta = await fetch(
      URLS.URL_BASE + URLS.RECUPERAR_PASSWORD,
      {
        method: "POST",
        body: JSON.stringify(correo),
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );

    if (!respuesta.ok) {
      throw new Error("Error al enviar correo de recuperación");
    }

    return await respuesta.json();
  }
  public static async nuevaContrasenia(
    token: string,
    body: { nuevaClave: string }
  ): Promise<any> {
    const respuesta = await fetch(
      URLS.URL_BASE + URLS.NUEVA_PASSWORD + `/${token}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      }
    );

    if (!respuesta.ok) {
      let mensaje = "Error al cambiar contraseña";

      try {
        const errorData = await respuesta.json();
        mensaje = errorData.message || mensaje;
      } catch { }

      throw new Error(mensaje);
    }

    return await respuesta.json();
  }
}