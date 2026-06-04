import React, { useState } from "react";
import { Box, Stack, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

import { AccesoServicio } from "../../../app/servicios/publicos/AccesoServicio";
import { crearMensaje } from "../../utilidades/funciones/mensaje";
import { FormCard } from "../../compartido/ui/FormCard";
import { CampoTexto } from "../../compartido/ui/CampoTexto";
import { BotonPrincipal } from "../../compartido/ui/BotonPrincipal";

const RecuperarContrasenia = () => {
  const navigate = useNavigate();
  const [correoUsuario, setCorreoUsuario] = useState("");
  const [enProceso, setEnProceso] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const formularioValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoUsuario.trim()) && recaptchaToken !== null;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formularioValido) return;
    setEnProceso(true);
    try {
      await AccesoServicio.recuperarContrasenia({ correoUsuario });
      crearMensaje("success", "Revisa tu correo para continuar con el cambio de contraseña");
      setTimeout(() => navigate("/login"), 2000);
    } catch {
      crearMensaje("error", "No se pudo enviar el correo");
    } finally {
      setEnProceso(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", px: 2 }}>
      <FormCard
        titulo="Recuperar contraseña"
        subtitulo="Ingresa tu correo registrado y te enviaremos un enlace."
      >
        <Box component="form" onSubmit={enviar}>
          <Stack spacing={2.5}>
            <CampoTexto
              label="Correo electrónico"
              type="email"
              value={correoUsuario}
              onChange={(e) => setCorreoUsuario(e.target.value)}
              required
            />

            <ReCAPTCHA
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
              onChange={setRecaptchaToken}
              onExpired={() => setRecaptchaToken(null)}
            />

            <BotonPrincipal cargando={enProceso} disabled={!formularioValido}>
              Enviar enlace
            </BotonPrincipal>

            <Button
              variant="text"
              onClick={() => navigate("/login")}
              sx={{ textTransform: "none", fontSize: "0.85rem" }}
            >
              Volver al inicio de sesión
            </Button>
          </Stack>
        </Box>
      </FormCard>
    </Box>
  );
};

export default RecuperarContrasenia;
