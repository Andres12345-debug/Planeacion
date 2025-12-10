// Footer.tsx
import React, { JSX } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import logo from "../../../assets/img/nav/Logo_Alcaldía_Mayor_de_Tunja.png"; // ajusta la ruta si hace falta

export default function Footer(): JSX.Element {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        color: "text.primary",
        py: 6,
        mt: 8,
        borderTop: "1px solid",
        borderColor: "divider",
      }}
    >
      {/* Contenedor principal: flex con wrap para responsive */}
      <Box
        sx={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          alignItems: "flex-start",
          justifyContent: "center",
          maxWidth: 1200,
          mx: "auto",
          px: 2,
        }}
      >
        {/* COLUMNA 1 - Logo (izquierda) */}
        <Box
          sx={{
            flex: "1 1 260px", // crece, encoge, base 260px
            display: "flex",
            alignItems: "center",
            justifyContent: { xs: "center", md: "flex-start" },
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <img src={logo} alt="Logo" style={{ width: 130, height: "auto" }} />
        </Box>

        {/* COLUMNA 2 - Centro: título, texto, redes sociales */}
        <Box
          sx={{
            flex: "1 1 360px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            px: 1,
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Nuestra Entidad
          </Typography>

          <Typography variant="body1" sx={{ maxWidth: 480 }}>
            Trabajamos para ofrecer servicios eficientes y transparentes a toda la
            comunidad. Nuestro objetivo es facilitar trámites y mantener una comunicación abierta.
          </Typography>

          <Box sx={{ mt: 2, width: "100%" }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Síguenos
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mt: 1 }}>
              <IconButton aria-label="facebook" href="#" size="large" color="primary">
                <FacebookIcon />
              </IconButton>

              <IconButton aria-label="instagram" href="#" size="large" color="primary">
                <InstagramIcon />
              </IconButton>

              <IconButton aria-label="twitter" href="#" size="large" color="primary">
                <TwitterIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* COLUMNA 3 - Contacto (derecha) */}
        <Box
          sx={{
            flex: "1 1 260px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: { xs: "center", md: "flex-end" },
            textAlign: { xs: "center", md: "right" },
            px: 1,
          }}
        >
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Contáctanos
          </Typography>

          <Typography variant="body1" component="div">
            Dirección: Calle 123 #45-67
            <br />
            Teléfono: (601) 123 4567
            <br />
            Correo: contacto@gov.co
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
