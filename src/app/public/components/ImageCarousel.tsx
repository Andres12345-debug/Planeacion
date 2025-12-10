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
import KeyboardTab from "@mui/icons-material/KeyboardTab";

type Slide = {
  src: string;
  title?: string;
  caption?: string;
  ctaText?: string;
  ctaHref?: string;
};

type ImageCarouselProps = {
  slides?: Slide[];
  height?: number;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
};

const DEFAULT_SLIDES: Slide[] = [
  {
    src: require("../../../assets/img/carroucel/Alturas.avif"),
    title: "Bienvenidos a la Alcaldía Mayor de Tunja",
    caption: "Aquí encontrarás todos los servicios y trámites en línea",
    ctaText: "Saber más",
  },
  {
    src: require("../../../assets/img/carroucel/alcaldia.avif"),
    title: "Trámites Rápidos",
    caption: "Realiza tus solicitudes de manera eficiente",
    ctaText: "Iniciar trámite",
  },
  {
    src: require("../../../assets/img/carroucel/tunja.jpg"),
    title: "Participa en la Comunidad",
    caption: "Noticias, eventos y más",
    ctaText: "Ver eventos",
  },
];

export default function ImageCarousel({
  slides = DEFAULT_SLIDES,
  height = 600,
  autoPlay = true,
  autoPlayInterval = 4000,
  showDots = true,
}: ImageCarouselProps) {
  const theme = useTheme();
  const [active, setActive] = React.useState(0);
  const [playing, setPlaying] = React.useState(autoPlay);
  const intervalRef = React.useRef<number | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const touchStartX = React.useRef<number | null>(null);
  const touchDelta = 40; // px threshold

  const slidesLength = slides.length;

  const handleNext = React.useCallback(() => {
    setActive((prev) => (prev + 1) % slidesLength);
  }, [slidesLength]);

  const handleBack = React.useCallback(() => {
    setActive((prev) => (prev - 1 + slidesLength) % slidesLength);
  }, [slidesLength]);

  const goTo = (index: number) => {
    setActive(((index % slidesLength) + slidesLength) % slidesLength);
  };

  React.useEffect(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (playing) {
      intervalRef.current = window.setInterval(() => {
        setActive((prev) => (prev + 1) % slidesLength);
      }, autoPlayInterval);
    }

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playing, autoPlayInterval, slidesLength]);

  const handleMouseEnter = () => setPlaying(false);
  const handleMouseLeave = () => autoPlay && setPlaying(true);
  const handleFocus = () => setPlaying(false);
  const handleBlur = () => autoPlay && setPlaying(true);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setPlaying(false);
        handleNext();
      } else if (e.key === "ArrowLeft") {
        setPlaying(false);
        handleBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleNext, handleBack]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchMove = (_e: React.TouchEvent) => {
    // opcional: parallax en swipe
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0].clientX;
    const delta = endX - touchStartX.current;
    if (Math.abs(delta) > touchDelta) {
      setPlaying(false);
      if (delta < 0) handleNext();
      else handleBack();
    }
    touchStartX.current = null;
  };

  if (!slides || slides.length === 0) return null;

  const computedHeight = {
    xs: Math.round(height * 0.55),
    sm: Math.round(height * 0.8),
    md: "100vh",
  };


  return (
    <Box
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      sx={{
        width: "100%",
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
        bgcolor: "background.default",
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Carrusel de imágenes"
    >
      <Box
        sx={{
          display: "flex",
          transition: "transform 600ms cubic-bezier(.2,.8,.2,1)",
          transform: `translateX(-${active * 100}%)`,
          height: { xs: `${computedHeight.xs}px`, sm: `${computedHeight.sm}px`, md: `${computedHeight.md}px` },
          touchAction: "pan-y",
        }}
      >
        {slides.map((s, i) => (
          <Box
            key={i}
            sx={{
              minWidth: "100%",
              position: "relative",
              display: "flex",
              alignItems: "stretch",
              justifyContent: "center",
            }}
            aria-hidden={i !== active}
          >
            <Box
              component="img"
              src={s.src}
              alt={s.title ?? `slide-${i + 1}`}
              loading="lazy"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
                filter: theme.palette.mode === "dark" ? "brightness(.9)" : "none",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                inset: 0,
                pointerEvents: "none",
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 60%)",
              }}
            />

            <Box
              sx={{
                position: "absolute",
                left: { xs: 16, sm: 28 },
                bottom: { xs: 18, sm: 28 },
                right: { xs: 16, sm: "auto" },
                color: "common.white",
                pointerEvents: "auto",
                maxWidth: { xs: "80%", sm: "60%", md: "50%" },
                textShadow: "0 4px 18px rgba(0,0,0,0.35)",
              }}
            >
              {s.title && (
                <Typography
                  component="h1"
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2.25rem" },
                    lineHeight: 1.05,
                  }}
                >
                  {s.title}
                </Typography>
              )}

              {s.caption && (
                <Typography
                  variant="body1"
                  sx={{
                    mb: 2,
                    fontSize: { xs: "0.95rem", sm: "1.05rem" },
                    lineHeight: 1.4,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.95)",
                  }}
                >
                  {s.caption}
                </Typography>
              )}

              {s.ctaText && (
                <Button
                  variant="contained"
                  color="secondary"
                  href={s.ctaHref}
                  sx={{
                    color: "common.white",
                    textTransform: "none",
                    fontSize: { xs: "0.95rem", sm: "1.05rem" },
                    px: 3,
                    py: 1,
                    borderRadius: 2,
                    boxShadow: 3,
                    "&:hover": { transform: "translateY(-3px)", boxShadow: 6 },
                  }}
                >
                  {s.ctaText}
                </Button>
              )}
            </Box>
          </Box>
        ))}
      </Box>

      <IconButton
        aria-label="Anterior"
        onClick={() => {
          setPlaying(false);
          handleBack();
        }}
        sx={{
          position: "absolute",
          top: "50%",
          left: 12,
          transform: "translateY(-50%)",
          bgcolor: "background.paper",
          "&:hover": { bgcolor: "background.paper" },
          boxShadow: 2,
          zIndex: 10,
        }}
      >
        <KeyboardArrowLeft />
      </IconButton>

      <IconButton
        aria-label="Siguiente"
        onClick={() => {
          setPlaying(false);
          handleNext();
        }}
        sx={{
          position: "absolute",
          top: "50%",
          right: 12,
          transform: "translateY(-50%)",
          bgcolor: "background.paper",
          "&:hover": { bgcolor: "background.paper" },
          boxShadow: 2,
          zIndex: 10,
        }}
      >
        <KeyboardArrowRight />
      </IconButton>

      <IconButton
        aria-label={playing ? "Pausar autoplay" : "Iniciar autoplay"}
        onClick={() => setPlaying((p) => !p)}
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          bgcolor: "background.paper",
          "&:hover": { bgcolor: "background.paper" },
          boxShadow: 2,
          zIndex: 11,
        }}
      >
        {playing ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>

      {/* MobileStepper: Self-closing (no children) */}
      {showDots && (
        <MobileStepper
          variant="dots"
          steps={slidesLength}
          position="static"
          activeStep={active}
          nextButton={<span />}
          backButton={<span />}
          sx={{
            position: "absolute",
            bottom: 12,
            left: 0,
            right: 0,
            background: "transparent",
            justifyContent: "center",
            pointerEvents: "none",
            ".MuiMobileStepper-dots": { pointerEvents: "auto" },
          }}
        />
      )}

      {showDots && (
        <Box
          sx={{
            position: "absolute",
            bottom: 8,
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "center",
            gap: 1.25,
            zIndex: 12,
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: slidesLength }).map((_, i) => (
            <Box
              key={i}
              onClick={() => {
                setPlaying(false);
                goTo(i);
              }}
              sx={{
                width: active === i ? 36 : 10,
                height: 10,
                borderRadius: 6,
                transition: "width 300ms ease, background-color 300ms ease",
                bgcolor: active === i ? "secondary.main" : "grey.400",
                cursor: "pointer",
                boxShadow: active === i ? 3 : "none",
                pointerEvents: "auto",
              }}
              role="button"
              aria-label={`Ir a la diapositiva ${i + 1}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  setPlaying(false);
                  goTo(i);
                }
              }}
            />
          ))}
        </Box>
      )}

      <Box
        sx={{
          position: "absolute",
          top: 12,
          left: 12,
          bgcolor: "rgba(0,0,0,0.35)",
          px: 1,
          py: 0.5,
          borderRadius: 1,
          color: "common.white",
          display: { xs: "none", sm: "flex" },
          gap: 0.5,
          alignItems: "center",
          zIndex: 11,
        }}
      >
        <KeyboardTab sx={{ fontSize: 16 }} />
        <Typography variant="caption">← → para navegar</Typography>
      </Box>
    </Box>
  );
}
