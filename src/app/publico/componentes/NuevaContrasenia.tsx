import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Stack,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { crearMensaje } from "../../utilidades/funciones/mensaje";
import { AccesoServicio } from "../../../app/servicios/publicos/AccesoServicio";

const NuevaContrasenia = () => {
  const { token } = useParams();  // Aquí obtienes el token de la URL
  const navigate = useNavigate();
  const theme = useTheme();

  const [nuevaClave, setNuevaClave] = useState(""); // Estado para la nueva contraseña
  const [loading, setLoading] = useState(false); // Estado para cargar mientras se envía la solicitud

  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación si la nueva clave no está vacía
    if (!nuevaClave) {
      crearMensaje("warning", "Ingresa la nueva contraseña");
      return;
    }

    // Validación de contraseña (al menos 8 caracteres, 1 mayúscula, 1 número)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(nuevaClave)) {
      crearMensaje("warning", "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula y un número.");
      return;
    }

    try {
      setLoading(true);  // Inicia el cargando mientras la solicitud está en proceso

      // Envía la nueva contraseña y el token al backend
      await AccesoServicio.nuevaContrasenia(token!, { nuevaClave });

      // Notifica al usuario que la contraseña ha sido actualizada correctamente
      crearMensaje("success", "Contraseña actualizada correctamente");

      setTimeout(() => {
        navigate("/login"); // Redirige al login después de 2 segundos
      }, 2000);
    } catch (error: any) {
      console.error(error);

      // Manejo de error, si el token es inválido o ha expirado
      if (error.response && error.response.data && error.response.data.message === 'Token expirado') {
        crearMensaje("error", "El token ha expirado, por favor solicita un nuevo enlace.");
      } else {
        crearMensaje("error", "Token inválido o expirado");
      }
    } finally {
      setLoading(false); // Detiene el cargando una vez que la solicitud se haya procesado
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
      <Paper elevation={10} sx={{ p: 5, width: "100%", maxWidth: 420, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={3}>
          Nueva contraseña
        </Typography>

        <form onSubmit={cambiarPassword}>
          <Stack spacing={3}>
            <TextField
              label="Nueva contraseña"
              type="password"
              fullWidth
              value={nuevaClave}
              onChange={(e) => setNuevaClave(e.target.value)} // Actualiza el estado con la nueva contraseña
            />

            <Button type="submit" variant="contained" disabled={loading} sx={{ py: 1.5, fontWeight: 700 }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Actualizar contraseña"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
};

export default NuevaContrasenia;