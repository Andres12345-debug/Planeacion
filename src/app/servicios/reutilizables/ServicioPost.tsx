export class ServicioPost {
  public static async peticionPost<T>(
    urlServicio: string,
    objRegistro: any,
    isMultipart: boolean = false,
    requiereAuth: boolean = true
  ): Promise<T> {
    const token = localStorage.getItem("TOKEN_AUTORIZACION");

    const headers: any = isMultipart
      ? {}
      : { "Content-Type": "application/json; charset=UTF-8" };

    // ✅ Solo agrega token si se necesita
    if (requiereAuth && token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const datosEnviar: RequestInit = {
      method: "POST",
      headers,
      body: isMultipart ? objRegistro : JSON.stringify(objRegistro),
    };

    const res = await fetch(urlServicio, datosEnviar);

    // ✅ Manejo correcto de errores
    if (!res.ok) {
      let mensaje = "Error en la petición";

      try {
        const errorData = await res.json();
        mensaje = errorData.message || mensaje;
      } catch {
        // fallback
      }

      throw new Error(mensaje);
    }

    return await res.json();
  }
}