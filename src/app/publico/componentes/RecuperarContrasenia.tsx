import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  useTheme,
  CircularProgress,
} from "@mui/material";

import { crearMensaje } from "../../utilidades/funciones/mensaje";
import { AccesoServicio } from "../../../app/servicios/publicos/AccesoServicio";
import { useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

const RecuperarContrasenia = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [correoUsuario, setCorreoUsuario] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

  const enviarSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!correoUsuario) {
      crearMensaje("warning", "Ingresa tu correo");
      return;
    }

    // Validación de formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correoUsuario)) {
      crearMensaje("warning", "Ingresa un correo electrónico válido");
      return;
    }

    if (!recaptchaToken) {
      crearMensaje("warning", "Completa el reCAPTCHA");
      return;
    }

    try {
      setLoading(true);

      await AccesoServicio.recuperarContrasenia({
        correoUsuario,
      });

      crearMensaje(
        "success",
        "Revisa tu correo para continuar con el cambio de contraseña"
      );

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error(error);
      crearMensaje("error", "No se pudo enviar el correo");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: theme.palette.background.default,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 5,
          width: "100%",
          maxWidth: 420,
          borderRadius: 4,
        }}
      >
        <Typography variant="h5" fontWeight={700} mb={1}>
          Recuperar contraseña
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Ingresa tu correo registrado y te enviaremos un enlace.
        </Typography>

        <form onSubmit={enviarSolicitud}>
          <Stack spacing={3}>
            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              value={correoUsuario}
              onChange={(e) => setCorreoUsuario(e.target.value)}
            />

            {/* reCAPTCHA */}
            <ReCAPTCHA
              sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Clave de prueba de Google
              onChange={setRecaptchaToken}
              onExpired={() => setRecaptchaToken(null)}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ py: 1.5, fontWeight: 700 }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Enviar enlace"
              )}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default RecuperarContrasenia;