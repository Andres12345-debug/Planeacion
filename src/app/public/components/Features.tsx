import React from "react";
import { Box, Card, CardContent, Typography, Divider, Pagination } from "@mui/material";

// Íconos de Material UI (más representativos)
import DescriptionIcon from "@mui/icons-material/Description";
import EngineeringIcon from "@mui/icons-material/Engineering";
import MapIcon from "@mui/icons-material/Map";
import ConstructionIcon from "@mui/icons-material/Construction";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ChecklistIcon from "@mui/icons-material/Checklist";
import ArchitectureIcon from "@mui/icons-material/Architecture";

const features = [
  {
    icon: <DescriptionIcon fontSize="large" color="secondary" />,
    title: "Concepto de verificación de uso y destinación por licencia de construcción",
    description: "Departamento Administrativo de Planeación Territorial",
  },
  {
    icon: <ArchitectureIcon fontSize="large" color="secondary" />,
    title: "Certificado Línea de paramentos o demarcación",
    description: "Departamento Administrativo de Planeación Territorial",
  },
  {
    icon: <SupportAgentIcon fontSize="large" color="secondary" />,
    title: "Cumplimiento artículo 73 Proyecciones del sistema vial y servicios públicos",
    description: "Departamento Administrativo de Planeación Territorial",
  },
  {
    icon: <EngineeringIcon fontSize="large" color="secondary" />,
    title: "Licencia de Urbanización Modalidad de Desarrollo",
    description: "Curaduría Urbana 2",
  },
  {
    icon: <ConstructionIcon fontSize="large" color="secondary" />,
    title: "Licencia de Construcción Obra Nueva",
    description: "Curaduría Urbana 2",
  },
  {
    icon: <ChecklistIcon fontSize="large" color="secondary" />,
    title: "Aprobación de Planos de Propiedad Horizontal",
    description: "Curaduría Urbana 2",
  },
  {
    icon: <ReceiptIcon fontSize="large" color="secondary" />,
    title: "Certificación de Viabilidad de Servicios (Acueducto y Alcantarillado)",
    description: "VEOLIA",
  },
  {
    icon: <EngineeringIcon fontSize="large" color="secondary" />,
    title: "Certificado de disponibilidad de servicios de gas natural",
    description: "VANTI",
  },
  {
    icon: <ReceiptIcon fontSize="large" color="secondary" />,
    title: "Declaración privada Impuesto de Delineación Urbana",
    description: "Departamento Administrativo de Hacienda Pública",
  },
  {
    icon: <MapIcon fontSize="large" color="secondary" />,
    title: "Desenglobe",
    description: "Departamento Administrativo de Gestión Catastral Multipropósito",
  },
  {
    icon: <DescriptionIcon fontSize="large" color="secondary" />,
    title: "Enajenación de Inmuebles destinados a Vivienda",
    description: "Secretaría de Infraestructura Territorial",
  },
  {
    icon: <SupportAgentIcon fontSize="large" color="secondary" />,
    title: "Licencia de Intervención y Ocupación del Espacio Público",
    description: "Departamento Administrativo de Planeación Territorial",
  },
];

export default function FeaturesSection() {
  const [page, setPage] = React.useState(1);
  const itemsPerPage = 9;

  const pageCount = Math.ceil(features.length / itemsPerPage);

  const handleChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const startIndex = (page - 1) * itemsPerPage;
  const selectedFeatures = features.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Box sx={{ width: "100%", px: 2 }}>
      {/* Título y subtítulo */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 600,
            color: "secondary.main",
            letterSpacing: 1,
            mb: 1,
          }}
        >
          Categorías de trámites
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
          Explora nuestros trámites disponibles
        </Typography>
      </Box>

      {/* Cards */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 3,
          justifyContent: "center",
          mb: 4,
        }}
      >
        {selectedFeatures.map((feature, i) => (
          <Card
            key={i}
            sx={{
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "grey.800" : "grey.300",
              width: { xs: "100%", sm: "30%" },
              minWidth: 250,
              textAlign: "center",
              p: 2,
              cursor: "pointer",
              borderRadius: 4,
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "rotate(3deg) scale(1.03)",
              },
            }}
          >
            <CardContent>
              {/* Ícono con hover independiente */}
              <Box
                sx={{
                  mb: 1,
                  transition: "transform .35s ease",
                  ".MuiCard-root:hover &": {
                    transform: "rotate(10deg) scale(1.2)",
                  },
                }}
              >
                {feature.icon}
              </Box>

              <Typography variant="h6" sx={{ mb: 1 }}>
                {feature.title}
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Typography variant="body2">{feature.description}</Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Paginador */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={handleChange}
          color="secondary"
        />
      </Box>
    </Box>
  );
}
