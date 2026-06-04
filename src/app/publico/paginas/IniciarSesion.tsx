import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  InputAdornment,
  Paper,
  useTheme,
  IconButton,
  alpha,
  Grid,
} from "@mui/material";
import {
  PersonOutline as UserIcon,
  LockOutlined as LockIcon,
  Visibility,
  VisibilityOff,
  VerifiedUserOutlined as ShieldIcon,
  CloudDoneOutlined as CloudIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ReCAPTCHA from "react-google-recaptcha";

import { Login } from "../../modelos/InicioSesion";
import { AccesoServicio } from "../../servicios/publicos/AccesoServicio";
import { useFormulario } from "../../utilidades/funciones/UsoFormulario";
import { crearMensaje } from "../../utilidades/funciones/mensaje";
import { tokenHelper } from "../../utilidades/auth/tokenHelper";

interface TokenPayload {
  sub: number;
  name: string;
  nombre_rol: string;
  cod_entidad: number | null;
  cod_departamento: number | null;
  exp?: number;
}

const InicioSesion = () => {
  const [enProceso, setEnProceso] = useState(false);
  const [mostrarClave, setMostrarClave] = useState(false);
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

  // ✅ Submit
  const enviarFormulario = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formularioValido) return;

    setEnProceso(true);

    try {
      const respuesta = await AccesoServicio.iniciarSesion({
        username,
        claveAcceso,
      });

      const token = respuesta?.token;

      if (!token) throw new Error("TOKEN_NOT_FOUND");

      const datosToken = jwtDecode<TokenPayload>(token);

      tokenHelper.set(token);

      crearMensaje("success", `¡Bienvenido, ${datosToken.name}!`);

      navegacion("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login Error:", error);
      crearMensaje("error", "Credenciales inválidas o error de conexión");
    } finally {
      setEnProceso(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* PANEL IZQUIERDO */}
      <Grid
        size={{ xs: 0, md: 7 }}
        sx={{
          display: { xs: "none", md: "flex" },
          background:
            theme.palette.mode === "light"
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, #4338ca 100%)`
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
            VENTANILLA UNICA DE CONSTRUCCIÓN  <br />
            <Box component="span" sx={{ opacity: 0.7 }}>
              TUNJA.
            </Box>
          </Typography>

          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Gestión eficiente de servicios y usuarios en una sola plataforma.
          </Typography>

          <Stack spacing={3}>
            <Box sx={{ display: "flex", gap: 2 }}>
              <ShieldIcon />
              <Typography>Cifrado de datos AES-256</Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <CloudIcon />
              <Typography>Alta disponibilidad</Typography>
            </Box>
          </Stack>
        </Stack>
      </Grid>

      {/* PANEL DERECHO */}
      {/* PANEL DERECHO */}
      <Grid
        size={{ xs: 12, md: 5 }}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 3, md: 6 },
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 560, // 🔥 MÁS GRANDE
            p: { xs: 4, md: 6 }, // 🔥 MÁS ESPACIO INTERNO
            borderRadius: 4,
          }}
        >
          <Typography
            variant="h3"
            fontWeight={800}
            mb={1}
            sx={{
              fontSize: { xs: "2rem", md: "2rem" }, // 🔥 TÍTULO MÁS GRANDE
            }}
          >
            Ingresar
          </Typography>

          <Typography
            mb={4}
            sx={{
              color: "text",
              fontSize: "1rem",
            }}
          >
            Bienvenido de nuevo
          </Typography>

          <Box component="form" onSubmit={enviarFormulario}>
            <Stack spacing={3}>
              {/* CORREO */}
              <TextField
                label="Correo electrónico"
                name="username"
                type="email"
                value={username}
                onChange={dobleEnlace}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    height: 60, // 🔥 INPUT MÁS GRANDE
                    fontSize: "1rem",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <UserIcon />
                    </InputAdornment>
                  ),
                }}
              />

              {/* CONTRASEÑA */}
              <TextField
                label="Contraseña"
                name="claveAcceso"
                type={mostrarClave ? "text" : "password"}
                value={claveAcceso}
                onChange={dobleEnlace}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 3,
                    height: 60, // 🔥 INPUT MÁS GRANDE
                    fontSize: "1rem",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() =>
                          setMostrarClave(!mostrarClave)
                        }
                      >
                        {mostrarClave ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* reCAPTCHA */}
              <ReCAPTCHA
                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Clave de prueba de Google
                onChange={setRecaptchaToken}
                onExpired={() => setRecaptchaToken(null)}
              />

              {/* BOTÓN */}
              <Button
                type="submit"
                variant="contained"
                disabled={!formularioValido || enProceso}
                sx={{
                  py: 1.8,
                  borderRadius: 3,
                  fontWeight: 800,
                  fontSize: "1rem",
                  textTransform: "none",
                  boxShadow: `0 8px 20px ${alpha(
                    theme.palette.secondary.main,
                    0.3
                  )}`,
                }}
              >
                {enProceso ? "Autenticando..." : "Entrar"}
              </Button>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
                <Button
                  variant="text"
                  onClick={() => navegacion("/registro")}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: theme.palette.text.secondary,
                  }}
                >
                  ¿No tienes cuenta? Regístrate
                </Button>
                <Button
                  variant="text"
                  onClick={() => navegacion("/recuperar-password")}
                  sx={{
                    textTransform: "none",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: theme.palette.secondary.main,
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </Button>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default InicioSesion;