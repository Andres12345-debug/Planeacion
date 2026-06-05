import { Paper, Typography, Box } from "@mui/material";
import { ReactNode } from "react";

interface FormSeccionProps {
  titulo?: string;
  subtitulo?: string;
  children: ReactNode;
  sx?: object;
}

/**
 * Contenedor de sección dentro de un formulario complejo (multi-paso, acordeón, etc.).
 * Para el card principal de una página usa FormCard.
 */
export const FormSeccion = ({ titulo, subtitulo, children, sx }: FormSeccionProps) => (
  <Paper elevation={2} sx={{ p: 3, borderRadius: 3, ...sx }}>
    {titulo && (
      <Typography variant="h6" fontWeight={700} mb={subtitulo ? 0.5 : 2.5}>
        {titulo}
      </Typography>
    )}
    {subtitulo && (
      <Typography variant="body2" color="text.secondary" mb={2.5}>
        {subtitulo}
      </Typography>
    )}
    <Box>{children}</Box>
  </Paper>
);
