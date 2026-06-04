import { Paper, Typography, Box } from "@mui/material";
import { ReactNode } from "react";

interface FormCardProps {
  titulo: string;
  subtitulo?: string;
  maxWidth?: number;
  children: ReactNode;
}

export const FormCard = ({ titulo, subtitulo, maxWidth = 480, children }: FormCardProps) => (
  <Paper
    elevation={8}
    sx={{ width: "100%", maxWidth, p: { xs: 4, md: 5 }, borderRadius: 4 }}
  >
    <Typography variant="h4" fontWeight={800} mb={subtitulo ? 0.5 : 3}>
      {titulo}
    </Typography>
    {subtitulo && (
      <Typography variant="body2" color="text.secondary" mb={3}>
        {subtitulo}
      </Typography>
    )}
    <Box>{children}</Box>
  </Paper>
);
