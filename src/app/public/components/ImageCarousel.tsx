// src/components/ImageCarousel.tsx
import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import MobileStepper from "@mui/material/MobileStepper";
import Button from "@mui/material/Button";
import { useTheme } from "@mui/material/styles";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import logo from "../../../assets/img/carroucel/Alturas.avif";
import logo1 from "../../../assets/img/carroucel/alcaldia.avif";
import logo2 from "../../../assets/img/carroucel/tunja.jpg";



export default function ImageCarousel({
  slides = [
    {
      src: logo,
      title: "Bienvenidos a la Alcaldía Mayor de Tunja",
      caption: "Aquí encontrarás todos los servicios y trámites en línea",
    },
    {
      src: logo1,
      title: "Trámites Rápidos",
      caption: "Realiza tus solicitudes de manera eficiente",
    },
    {
      src: logo2,
      title: "Participa en la Comunidad",
      caption: "Noticias, eventos y más",
    },
  ],
  height = 600,
  autoPlay = true,
  autoPlayInterval = 4000,
  showDots = true,
}) {
  const theme = useTheme();
  const [active, setActive] = React.useState(0);
  const [playing, setPlaying] = React.useState(autoPlay);

  const touchStart = React.useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStart.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    if (Math.abs(delta) > 40) {
      if (delta < 0) handleNext();
      else handleBack();
    }
    touchStart.current = null;
  };

  const handleNext = () => setActive((prev) => (prev + 1) % slides.length);
  const handleBack = () =>
    setActive((prev) => (prev - 1 + slides.length) % slides.length);

  // Auto play
  React.useEffect(() => {
    if (!playing) return undefined;
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);
    return () => clearInterval(id);
  }, [playing, autoPlayInterval, slides.length]);

  if (!slides || slides.length === 0) return null;

  return (
    <Box sx={{ width: "100%", position: "relative", overflow: "hidden" }}>
      <Box
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        sx={{
          display: "flex",
          transition: "transform 600ms ease",
          transform: `translateX(-${active * 100}%)`,
          height: { xs: `${Math.round(height * 0.6)}px`, sm: `${height}px` },
        }}
      >
        {slides.map((s, i) => (
          <Box
            key={i}
            sx={{
              minWidth: "100%",
              height: "100%",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* Imagen */}
            <Box
              component="img"
              src={s.src}
              alt={s.title || `slide-${i}`}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* Overlay gradiente */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 60%)",
                pointerEvents: "none",
              }}
            />

            {/* Texto + botón */}
            <Box
              sx={{
                position: "absolute",
                left: { xs: 16, sm: 24 },
                bottom: { xs: 16, sm: 24 },
                right: { xs: 16, sm: "auto" },
                color: "common.white",
                pointerEvents: "auto",
                maxWidth: { xs: "80%", sm: "60%" },
              }}
            >
              {s.title && (
                <Typography variant="h1" sx={{ fontWeight: 700, mb: 1 }}>
                  {s.title}
                </Typography>
              )}{s.caption && (
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    fontSize: { xs: "1rem", sm: "1.25rem" }, // más grande en pantallas grandes
                    lineHeight: 1.5,
                    fontWeight: 500,
                  }}
                >
                  {s.caption}
                </Typography>
              )}

              <Button
                variant="contained"
                color="secondary"
                sx={{
                  color: "common.white",
                  textTransform: "none",
                  fontSize: "1.2rem",          // tamaño de la letra
                  px: 4,                       // padding horizontal
                  py: 1.5,                     // padding vertical
                  borderRadius: 2,              // bordes más redondeados
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
        ))}
      </Box>

      {/* Controles izquierda/derecha */}
      <IconButton
        aria-label="anterior"
        onClick={() => {
          setPlaying(false);
          handleBack();
        }}
        sx={{
          position: "absolute",
          top: "50%",
          left: 8,
          transform: "translateY(-50%)",
          bgcolor: "background.paper",
          "&:hover": { bgcolor: "background.paper" },
          boxShadow: 1,
        }}
      >
        <KeyboardArrowLeft />
      </IconButton>

      <IconButton
        aria-label="siguiente"
        onClick={() => {
          setPlaying(false);
          handleNext();
        }}
        sx={{
          position: "absolute",
          top: "50%",
          right: 8,
          transform: "translateY(-50%)",
          bgcolor: "background.paper",
          "&:hover": { bgcolor: "background.paper" },
          boxShadow: 1,
        }}
      >
        <KeyboardArrowRight />
      </IconButton>

      {/* Play/Pause */}
      <IconButton
        aria-label={playing ? "pause" : "play"}
        onClick={() => setPlaying((p) => !p)}
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          bgcolor: "background.paper",
          "&:hover": { bgcolor: "background.paper" },
          boxShadow: 1,
        }}
      >
        {playing ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>

      {/* Dots */}
      {showDots && (
        <MobileStepper
          variant="dots"
          steps={slides.length}
          position="static"
          activeStep={active}
          sx={{
            position: "absolute",
            bottom: 8,
            left: 0,
            right: 0,
            background: "transparent",
            justifyContent: "center",
            pointerEvents: "none",
            ".MuiMobileStepper-dots": { pointerEvents: "auto" },
          }}
          nextButton={<span />}
          backButton={<span />}
        />
      )}
    </Box>
  );
}
