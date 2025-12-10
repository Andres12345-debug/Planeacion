// src/components/AlliedEntitiesSection.tsx
import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

// Importa tus imágenes locales
import Vui from "../../../assets/img/agradecimientos/vui.jpeg";
import Bid from "../../../assets/img/agradecimientos/bid.jpeg";
import Turismo from "../../../assets/img/agradecimientos/city.png";

const allies = [
  { name: "Vui Colombia", logo: Vui },
  { name: "Bid", logo: Bid },
  { name: "Industria y turismo", logo: Turismo },
  // puedes añadir más aliados aquí
];

export default function ThankYouSection() {
  const theme = useTheme();

  // Responsive items per view (deseado)
  const isXs = useMediaQuery(theme.breakpoints.down("sm")); // xs
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));

  const itemsPerView = isXs ? 1 : isSm ? 2 : isMd ? 3 : 4;

  // visibleCount = número real de items que se mostrarán en la vista (evita "huecos")
  const visibleCount = Math.min(itemsPerView, allies.length);

  // maxStart dependiendo de visibleCount (no itemsPerView)
  const maxStart = Math.max(0, allies.length - visibleCount);

  const [startIndex, setStartIndex] = React.useState(0);

  React.useEffect(() => {
    // si cambió el itemsPerView/visibleCount, ajusta startIndex para que no se pase
    setStartIndex((s) => Math.min(s, maxStart));
  }, [visibleCount, maxStart]);

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(prev - visibleCount, 0));
  };

  const handleNext = () => {
    setStartIndex((prev) => Math.min(prev + visibleCount, maxStart));
  };

  // pageCount y currentPage basados en visibleCount
  const pageCount = Math.ceil(allies.length / visibleCount);
  const currentPage = Math.floor(startIndex / visibleCount);

  // ancho de cada item en % usando visibleCount (evita huecos)
  const itemWidth = 100 / visibleCount;

  return (
    <Box sx={{ width: "100%", py: 8, px: { xs: 2, sm: 6 }}}>
      {/* Header */}
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            color: "secondary.main",
            letterSpacing: 1.2,
            mb: 1,
          }}
        >
          Agradecimientos
        </Typography>

        <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
          Agradecimientos
        </Typography>
      </Box>

      {/* Carousel container */}
      <Box sx={{ position: "relative" }}>
        {/* Slider viewport */}
        <Box
          sx={{
            overflow: "hidden",
            width: "100%",
          }}
        >
          {/* Slider track */}
          <Box
            sx={{
              display: "flex",
              gap: 3,
              transition: "transform 500ms cubic-bezier(.2,.8,.2,1)",
              cursor: "pointer",
              // transform usa visibleCount para moverse en "páginas" correctas
              transform: `translateX(-${startIndex * (100 / visibleCount)}%)`,
              // ensure children don't shrink y usan el ancho calculado por visibleCount
              "& > *": { flex: `0 0 ${itemWidth}%` },
              // Si hay menos items que el itemsPerView, centramos el track para que quede estético
              justifyContent: allies.length <= visibleCount ? "center" : "flex-start",
            }}
          >
            {allies.map((ally, idx) => (
              <Card
                key={ally.name + idx}
                elevation={3}
                sx={{
                  m: 0,
                  borderRadius: 3,
                  minHeight: 160,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 2,
                  transition: "transform 300ms ease, box-shadow 300ms ease",
                  "&:hover": {
                    transform: "translateY(-8px) rotate(-1.5deg) scale(1.03)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                    p: 0,
                    width: "100%",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={ally.logo}
                    alt={ally.name}
                    sx={{
                      maxHeight: 90,
                      maxWidth: "90%",
                      objectFit: "contain",
                      filter:
                        theme.palette.mode === "dark"
                          ? "brightness(.95) saturate(.9)"
                          : "none",
                    }}
                  />
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mt: 1.2,
                      fontWeight: 700,
                      textAlign: "center",
                      color: "text.primary",
                    }}
                  >
                    {ally.name}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Prev button */}
        <IconButton
          onClick={handlePrev}
          disabled={startIndex === 0}
          aria-label="Anterior"
          sx={{
            position: "absolute",
            top: "50%",
            left: -12,
            transform: "translateY(-50%)",
            bgcolor: "rgba(0,0,0,0.04)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.06)" },
            borderRadius: "50%",
            boxShadow: 3,
            zIndex: 10,
          }}
        >
          <KeyboardArrowLeft />
        </IconButton>

        {/* Next button */}
        <IconButton
          onClick={handleNext}
          disabled={startIndex >= maxStart}
          aria-label="Siguiente"
          sx={{
            position: "absolute",
            top: "50%",
            right: -12,
            transform: "translateY(-50%)",
            bgcolor: "rgba(0,0,0,0.04)",
            "&:hover": { bgcolor: "rgba(0,0,0,0.06)" },
            borderRadius: "50%",
            boxShadow: 3,
            zIndex: 10,
          }}
        >
          <KeyboardArrowRight />
        </IconButton>
      </Box>

      {/* Indicators */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 1.25, mt: 3 }}>
        {Array.from({ length: pageCount }).map((_, i) => (
          <Box
            key={i}
            onClick={() => setStartIndex(i * visibleCount)}
            sx={{
              width: currentPage === i ? 36 : 10,
              height: 10,
              borderRadius: 6,
              transition: "width 300ms, background-color 300ms",
              bgcolor: currentPage === i ? "secondary.main" : "grey.400",
              cursor: "pointer",
              boxShadow: currentPage === i ? 3 : "none",
            }}
            aria-label={`Ir a la página ${i + 1}`}
          />
        ))}
      </Box>
    </Box>
  );
}
