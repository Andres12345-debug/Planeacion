import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  alpha,
  useTheme,
} from "@mui/material";
import {
  PersonOutline as UserIcon,
  LockOutlined as LockIcon,
  VerifiedUserOutlined as ShieldIcon,
  CloudDoneOutlined as CloudIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

import { Login } from "../../modelos/InicioSesion";
import { AccesoServicio } from "../../servicios/publicos/AccesoServicio";
import { useFormulario } from "../../utilidades/funciones/UsoFormulario";
import { crearMensaje } from "../../utilidades/funciones/mensaje";
import { tokenHelper } from "../../utilidades/auth/tokenHelper";
import { decodeToken } from "../../utilidades/auth/usuarioToken";
import { FormCard } from "../../compartido/ui/FormCard";
import { CampoTexto } from "../../compartido/ui/CampoTexto";
import { BotonPrincipal } from "../../compartido/ui/BotonPrincipal";

const InicioSesion = () => {
  const [enProceso, setEnProceso] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const theme = useTheme();
  const navegacion = useNavigate();

  const { username, claveAcceso, dobleEnlace } = useFormulario<Login>({
    username: "",
    claveAcceso: "",
  });

  const formularioValido =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username.trim()) &&
    claveAcceso.trim().length >= 8 &&
    recaptchaToken !== null;

  const enviarFormulario = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formularioValido) return;
    setEnProceso(true);
    try {
      const respuesta = await AccesoServicio.iniciarSesion({ username, claveAcceso });
      const token = respuesta?.token;
      if (!token) throw new Error("TOKEN_NOT_FOUND");
      const datosToken = decodeToken(token);
      if (!datosToken) throw new Error("TOKEN_INVALIDO");
      tokenHelper.set(token);
      crearMensaje("success", `¡Bienvenido, ${datosToken.name}!`);
      navegacion("/dashboard", { replace: true });
    } catch (error) {
      crearMensaje("error", "Credenciales inválidas o error de conexión");
    } finally {
      setEnProceso(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Panel izquierdo — solo desktop */}
      <Grid
        size={{ xs: 0, md: 7 }}
        sx={{
          display: { xs: "none", md: "flex" },
          background:
            theme.palette.mode === "light"
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #484182 100%)`
              : `linear-gradient(135deg, #0f172a 0%, #1e293b 100%)`,
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          color: "#fff",
          p: 6,
        }}
      >
        <Stack spacing={4} sx={{ maxWidth: 500 }}>
          <Typography variant="h2" fontWeight={900}>
            Ventanilla Única de Construcción
            <Box component="span" sx={{ opacity: 0.7 }}> Tunja.</Box>
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Gestión eficiente de trámites de construcción en una sola plataforma.
          </Typography>
          <Stack spacing={2}>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <ShieldIcon />
              <Typography>Acceso seguro y cifrado</Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <CloudIcon />
              <Typography>Alta disponibilidad</Typography>
            </Box>
          </Stack>
        </Stack>
      </Grid>

      {/* Panel derecho — formulario */}
      <Grid
        size={{ xs: 12, md: 5 }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, md: 6 },
        }}
      >
        <FormCard titulo="Ingresar" subtitulo="Bienvenido de nuevo" maxWidth={520}>
          <Box component="form" onSubmit={enviarFormulario}>
            <Stack spacing={2.5}>
              <CampoTexto
                label="Correo electrónico"
                name="username"
                type="email"
                value={username}
                onChange={dobleEnlace}
                icono={<UserIcon />}
              />
              <CampoTexto
                label="Contraseña"
                name="claveAcceso"
                type="password"
                value={claveAcceso}
                onChange={dobleEnlace}
                icono={<LockIcon />}
              />

              <ReCAPTCHA
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                onChange={setRecaptchaToken}
                onExpired={() => setRecaptchaToken(null)}
              />

              <BotonPrincipal cargando={enProceso} disabled={!formularioValido}>
                Entrar
              </BotonPrincipal>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button
                  variant="text"
                  onClick={() => navegacion("/registro")}
                  sx={{ textTransform: "none", fontSize: "0.85rem" }}
                >
                  ¿No tienes cuenta? Regístrate
                </Button>
                <Button
                  variant="text"
                  onClick={() => navegacion("/recuperar-password")}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.85rem",
                    color: theme.palette.secondary.main,
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </Box>
            </Stack>
          </Box>
        </FormCard>
      </Grid>
    </Grid>
  );
};

export default InicioSesion;
