// src/components/ProfileSection.tsx
import React from "react";
import {
  Box,
  Avatar,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  LinearProgress,
  Chip,
  Tooltip,
  useTheme,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// Tipos
export type ProcessItem = {
  id: string | number;
  title: string;
  description?: string;
  progress?: number; // 0 - 100
  status?: "completed" | "in_progress" | "pending"; // para chips/colores
  updatedAt?: string;
  icon?: React.ReactNode;
};

export type Profile = {
  name: string;
  role?: string;
  avatarSrc?: string;
  email?: string;
};

export default function ProfileSection({
  profile,
  processes,
  onView,
  onDownload,
  onEditProfile,
}: {
  profile?: Profile;
  processes?: ProcessItem[];
  onView?: (p: ProcessItem) => void;
  onDownload?: (p: ProcessItem) => void;
  onEditProfile?: () => void;
}) {
  const theme = useTheme();

  const defaultProfile: Profile = {
    name: "Julian Andres Montañez Parra",
    role: "Ciudadano / Solicitante",
    avatarSrc: undefined, // si quieres, importa y coloca aquí la imagen
    email: "julian.m@example.com",
  };

  const defaultProcesses: ProcessItem[] = [
    {
      id: 1,
      title: "Solicitud Licencia de Construcción",
      description: "Revisión de requisitos y radicación de documentos",
      progress: 65,
      status: "in_progress",
      updatedAt: "2025-11-28",
      icon: <PendingActionsIcon fontSize="large" color="secondary" />,
    },
    {
      id: 2,
      title: "Certificado de Disponibilidad de Servicios",
      description: "Verificación por entidad prestadora",
      progress: 100,
      status: "completed",
      updatedAt: "2025-10-15",
      icon: <CheckCircleOutlineIcon fontSize="large" color="success" />,
    },
    {
      id: 3,
      title: "Pago Impuesto de Delineación",
      description: "Pendiente de pago",
      progress: 0,
      status: "pending",
      updatedAt: "2025-12-01",
      icon: <HourglassTopIcon fontSize="large" color="warning" />,
    },
  ];

  const user = profile ?? defaultProfile;
  const list = processes ?? defaultProcesses;

  const statusToColor = (s?: ProcessItem["status"]) => {
    switch (s) {
      case "completed":
        return "success";
      case "in_progress":
        return "secondary";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box component="section" sx={{ width: "100%", py: { xs: 4, md: 8 }, px: { xs: 2, md: 8 } }}>
      {/* Header: título + subtítulo */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: "secondary.main", letterSpacing: 1.2, mb: 1, textTransform: "uppercase" }}
        >
          Perfil
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          Mi cuenta
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 800, mx: "auto", mt: 1 }}>
          Revisa el estado de tus procesos, descarga documentos y administra tu información de usuario.
        </Typography>
      </Box>

      {/* Perfil + acciones */}
      <Box
        sx={{
          display: "flex",
          gap: 4,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: { xs: "column", md: "row" },
          mb: 6,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 3,
            alignItems: "center",
            bgcolor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "background.paper"),
            p: 3,
            borderRadius: 3,
            boxShadow: 2,
            minWidth: { md: 420 },
            width: "100%",
            maxWidth: 900,
          }}
        >
          <Avatar
            src={user.avatarSrc}
            alt={user.name}
            sx={{
              width: { xs: 84, md: 112 },
              height: { xs: 84, md: 112 },
              bgcolor: "primary.main",
            }}
          >
            {!user.avatarSrc && <AccountCircleIcon sx={{ fontSize: { xs: 48, md: 64 } }} />}
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {user.name}
            </Typography>
            {user.role && (
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
                {user.role}
              </Typography>
            )}
            {user.email && (
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {user.email}
              </Typography>
            )}

            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<EditIcon />}
                onClick={() => onEditProfile?.()}
                sx={{ textTransform: "none" }}
              >
                Editar perfil
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<VisibilityIcon />}
                sx={{ textTransform: "none" }}
                onClick={() => {
                  /* ejemplo: abrir modal de actividad */
                }}
              >
                Actividad
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Procesos: cards en grid responsivo (sin Grid) */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
          width: "100%",
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        {list.map((p) => (
          <Card
            key={p.id}
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              transition: "transform 300ms ease, box-shadow 300ms ease",
              "&:hover": { transform: "translateY(-6px)", boxShadow: 8 },
            }}
          >
            <CardContent sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Box sx={{ width: 64, height: 64, display: "grid", placeItems: "center" }}>
                {p.icon ?? <PendingActionsIcon fontSize="large" />}
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {p.title}
                </Typography>
                {p.description && (
                  <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
                    {p.description}
                  </Typography>
                )}

                <Box sx={{ display: "flex", gap: 1, alignItems: "center", mt: 1 }}>
                  <Chip label={p.status ?? "pending"} color={statusToColor(p.status)} size="small" />
                  {p.updatedAt && (
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      • {p.updatedAt}
                    </Typography>
                  )}
                </Box>

                {/* Progress */}
                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant={typeof p.progress === "number" ? "determinate" : "indeterminate"}
                    value={p.progress ?? 0}
                    sx={{
                      height: 8,
                      borderRadius: 2,
                      backgroundColor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "#eee"),
                      "& .MuiLinearProgress-bar": { borderRadius: 2 },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary", mt: 1, display: "block" }}>
                    {typeof p.progress === "number" ? `${p.progress}% completado` : "En progreso"}
                  </Typography>
                </Box>
              </Box>
            </CardContent>

            <Box sx={{ flexGrow: 1 }} />

            <CardActions sx={{ px: 2, py: 1.25, display: "flex", justifyContent: "space-between" }}>
              <Box>
                <Tooltip title="Ver">
                  <IconButton
                    size="small"
                    onClick={() => onView?.(p)}
                    aria-label={`Ver ${p.title}`}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Descargar">
                  <IconButton
                    size="small"
                    onClick={() => onDownload?.(p)}
                    aria-label={`Descargar ${p.title}`}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {p.status === "completed" ? (
                  <Chip label="Completado" color="success" size="small" />
                ) : p.status === "in_progress" ? (
                  <Chip label="En trámite" color="secondary" size="small" />
                ) : (
                  <Chip label="Pendiente" color="warning" size="small" />
                )}
              </Box>
            </CardActions>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
