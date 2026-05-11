import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";

export const Error = () => {
  return (
    <Box
      className="container"
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 3,
      }}
    >
      <ConstructionIcon sx={{ fontSize: 80, color: "orange" }} />
      <Typography variant="h3" sx={{ mt: 2, fontWeight: "bold" }}>
        Ruta Errónea
      </Typography>
      <Typography variant="body1" sx={{ mt: 1, maxWidth: 400 }}>
        Parece que llegaste a un camino en construcción.  
        Vuelve al inicio para seguir navegando correctamente.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 3 }}
        onClick={() => (window.location.href = "/")}
      >
        Ir al Inicio
      </Button>
    </Box>
  );
};

export default Error;
