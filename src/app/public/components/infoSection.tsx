// src/components/InfoSection.tsx
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import infoImage from "../../../assets/img/carroucel/alcaldia.jpg"; // ajusta la ruta

export default function InfoSection() {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                alignItems: "center",
                justifyContent: "center",
                gap: 4,
                py: 8,
                px: { xs: 2, md: 8 },
            }}
        >
            {/* Imagen */}
            <Box
                component="img"
                src={infoImage}
                alt="Información"
                sx={{
                    width: { xs: "100%", md: "40%" },
                    height: "auto",
                    borderRadius: 2,
                    boxShadow: 3,
                    cursor: "pointer",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                        transform: "rotate(3deg) scale(1.03)",
                    },
                }}
            />


            {/* Texto */}
            <Box sx={{ width: { xs: "100%", md: "55%" } }}>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontWeight: 600,
                        color: "secondary.main",
                        letterSpacing: 1,
                        mb: 1
                    }}
                >
                    Nuestra identidad
                </Typography>

                <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
                    Nuestra misión y visión
                </Typography>

                <Typography variant="body1" sx={{ fontSize: "1.125rem", lineHeight: 1.6 }}>
                    La Ventanilla Única de Construcción Informativa (VUC-i) es una iniciativa de la Alcaldía Mayor de Tunja para centralizar y simplificar los trámites relacionados con la construcción. Nuestro objetivo es ofrecer un servicio ágil, transparente y accesible para todos los ciudadanos y profesionales del sector.
                </Typography>

                <Button
                    variant="contained"
                    color="secondary"
                    sx={{
                        textTransform: "none",
                        color: "common.white",
                        fontSize: "1.1rem",
                        marginTop: 2,
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        transition: "transform 0.3s, box-shadow 0.3s",
                        "&:hover": {
                            transform: "translateY(-2px)",
                            boxShadow: 4,
                        },
                    }}
                >
                    Saber más
                </Button>
            </Box>

        </Box>
    );
}
