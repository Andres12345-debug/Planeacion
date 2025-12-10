// src/components/FaqSection.tsx
import React from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import faqImage from "../../../assets/img/carroucel/Alturas.avif"; // ajusta la ruta

const faqs = [
  {
    question: "¿Cómo puedo realizar un trámite en línea?",
    answer:
      "Puedes acceder a nuestra sección de trámites, seleccionar el servicio que necesitas y seguir los pasos indicados. Recibirás un comprobante de tu solicitud.",
  },
  {
    question: "¿Cuáles son los horarios de atención?",
    answer:
      "Nuestro servicio en línea está disponible las 24 horas, mientras que la atención presencial es de lunes a viernes, de 8:00 a 17:00.",
  },
  {
    question: "¿Cómo puedo contactar a soporte?",
    answer:
      "Puedes comunicarte con nosotros a través del chat en línea, correo electrónico o llamando a los números de atención de la Alcaldía.",
  },
  {
    question: "¿Necesito registrarme para usar los servicios?",
    answer:
      "Algunos servicios requieren registro para acceder a información personalizada o realizar trámites, mientras que otros son abiertos al público.",
  },
];

export default function FaqSection() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "100%",
        py: 8,
      }}
    >
      {/* Contenedor centrado con margen interno */}
      <Box sx={{ width: "100%", px: { xs: 2, md: 8 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 4,
            alignItems: "center",
          }}
        >
          {/* IZQUIERDA: Título + FAQ */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2
              }}
            >
              Preguntas Frecuentes
            </Typography>
            <Typography
              variant="body1"
              sx={{
                maxWidth: 500,
                mb: 4
              }}
            >
              Aquí respondemos las dudas más comunes de nuestros usuarios de manera clara y rápida.
            </Typography>

            {/* Acordeones */}
            <Box>
              {faqs.map((faq, index) => (
                <Accordion
                  key={index}
                  sx={{
                    mb: 2,
                    bgcolor: theme.palette.grey[100],
                    boxShadow: 3,
                    borderRadius: 2,
                    transition: "all 0.3s ease",
                    "&.Mui-expanded": {
                      bgcolor: theme.palette.grey[200],
                      boxShadow: 5,
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.text.disabled }} />}
                    aria-controls={`faq-content-${index}`}
                    id={`faq-header-${index}`}
                  >
                    <Typography sx={{ fontWeight: 600, color: theme.palette.text.disabled }}>{faq.question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography sx={{ color: theme.palette.text.disabled }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>

          {/* DERECHA: Imagen */}
          {/* DERECHA: Imagen */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "rotate(3deg) scale(1.03)",
              },
            }}
          >
            <Box
              component="img"
              src={faqImage}
              alt="FAQ ilustrativa"
              sx={{
                width: { xs: "90%", md: "100%" },  
                maxWidth: 520,                     
                borderRadius: 3,
                boxShadow: 4,
              }}
            />
          </Box>

        </Box>
      </Box>
    </Box>
  );
}
