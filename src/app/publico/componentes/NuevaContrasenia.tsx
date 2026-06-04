import React, { useState } from "react";
import { Box, Stack, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";

import { AccesoServicio } from "../../../app/servicios/publicos/AccesoServicio";
import { crearMensaje } from "../../utilidades/funciones/mensaje";
import { FormCard } from "../../compartido/ui/FormCard";
import { CampoTexto } from "../../compartido/ui/CampoTexto";
import { BotonPrincipal } from "../../compartido/ui/BotonPrincipal";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const NuevaContrasenia = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [nuevaClave, setNuevaClave] = useState("");
  const [confirmarClave, setConfirmarClave] = useState("");
  const [enProceso, setEnProceso] = useState(false);

  const cambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nuevaClave || !confirmarClave) {
      crearMensaje("warning", "Completa ambos campos");
      return;
    }
    if (nuevaClave !== confirmarClave) {
      crearMensaje("warning", "Las contraseñas no coinciden");
      return;
    }
    if (!PASSWORD_REGEX.test(nuevaClave)) {
      crearMensaje(
        "warning",
        "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)"
      );
      return;
    }

    setEnProceso(true);
    try {
      await AccesoServicio.nuevaContrasenia(token!, { nuevaClave });
      crearMensaje("success", "Contraseña actualizada correctamente");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error: any) {
      crearMensaje("error", error.message || "Token inválido o expirado");
    } finally {
      setEnProceso(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", px: 2 }}>
      <FormCard
        titulo="Nueva contraseña"
        subtitulo="Elige una contraseña segura para tu cuenta."
      >
        <Box component="form" onSubmit={cambiarPassword}>
          <Stack spacing={2.5}>
            <CampoTexto
              label="Nueva contraseña"
              type="password"
              value={nuevaClave}
              onChange={(e) => setNuevaClave(e.target.value)}
              required
            />
            <CampoTexto
              label="Confirmar contraseña"
              type="password"
              value={confirmarClave}
              onChange={(e) => setConfirmarClave(e.target.value)}
              required
            />

            <BotonPrincipal cargando={enProceso}>Actualizar contraseña</BotonPrincipal>

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

export default NuevaContrasenia;
