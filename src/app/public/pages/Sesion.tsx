// src/app/public/pages/Sesion.tsx
import React, { useEffect, useState, FormEvent, JSX } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Alert,
  Link,
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";

/**
 * Sesion.tsx
 * Componente de inicio de sesión (Login) en TypeScript + MUI
 * - Exporta por defecto para que React.lazy importe sin problemas.
 * - Cambia `authenticate` para conectar con tu backend real.
 */

/** Resultado simulado de autenticación */
type AuthResult = {
  token: string;
  user: { email: string; name?: string };
};

/** Función simulada de autenticación — REEMPLAZAR por llamada real */
const authenticate = async (email: string, password: string): Promise<AuthResult> => {
  // Simulación de demora
  await new Promise((r) => setTimeout(r, 500));

  // Demo: contraseña válida es "123456"
  if (password === "123456") {
    return { token: "fake-jwt-token", user: { email, name: "Usuario Demo" } };
  }

  // Si usas una API real, lanza aquí un error con message del servidor
  throw new Error("Email o contraseña incorrectos");
};

export default function Sesion(): JSX.Element {
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [remember, setRemember] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Si ya hay token, redirige directamente al perfil
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      navigate("/perfil", { replace: true });
    }
  }, [navigate]);

  const validate = (): boolean => {
    setError("");
    if (!email.trim() || !password) {
      setError("Completa todos los campos.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Ingresa un correo válido.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const result = await authenticate(email, password);
      // Guardar token según "recordarme"
      if (remember) {
        localStorage.setItem("token", result.token);
      } else {
        sessionStorage.setItem("token", result.token);
      }
      // Guardar info de usuario simple
      localStorage.setItem("user", JSON.stringify(result.user));
      // Redirigir al perfil (o dashboard)
      navigate("/perfil", { replace: true });
    } catch (err: any) {
      setError(err?.message ?? "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3}>
        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Iniciar sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoComplete="email"
            />

            <TextField
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                      size="large"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 1,
                mb: 2,
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    color="primary"
                  />
                }
                label="Recordarme"
              />

              <Link
                component="button"
                variant="body2"
                onClick={() => navigate("/recuperar", { replace: true })}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              sx={{ py: 1.5 }}
            >
              {loading ? "Iniciando..." : "Iniciar sesión"}
            </Button>
          </Box>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              ¿No tienes cuenta?{" "}
              <Link component="button" onClick={() => navigate("/registro")}>
                Regístrate
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
