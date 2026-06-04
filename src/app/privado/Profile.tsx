import React from "react";
import {
  Box,
  Avatar,
  Typography,
  Button,
  CardActions,
  IconButton,
  LinearProgress,
  Chip,
  Tooltip,
  useTheme,
} from "@mui/material";
import CardSistema from "../compartido/ui/CardSistema";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { jwtDecode } from "jwt-decode";
import { tokenHelper } from "../utilidades/auth/tokenHelper";

interface TokenPayload {
  sub: number;
  name: string;
  nombre_rol: string;
  cod_entidad: number | null;
  cod_departamento: number | null;
}

export type ProcessItem = {
  id: string | number;
  title: string;
  description?: string;
  progress?: number;
  status?: "completed" | "in_progress" | "pending";
  updatedAt?: string;
  icon?: React.ReactNode;
};

function useUsuarioJWT() {
  const token = tokenHelper.get();
  if (!token) return null;
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
}

const ETIQUETAS_ROL: Record<string, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  funcionario: "Funcionario",
  ciudadano: "Ciudadano",
  visitante: "Visitante",
};

export default function ProfileSection({
  processes,
  onView,
  onDownload,
  onEditProfile,
}: {
  processes?: ProcessItem[];
  onView?: (p: ProcessItem) => void;
  onDownload?: (p: ProcessItem) => void;
  onEditProfile?: () => void;
}) {
  const theme = useTheme();
  const usuario = useUsuarioJWT();

  const statusToColor = (s?: ProcessItem["status"]) => {
    switch (s) {
      case "completed": return "success";
      case "in_progress": return "secondary";
      case "pending": return "warning";
      default: return "default";
    }
  };

  return (
    <Box component="section" sx={{ width: "100%", py: { xs: 4, md: 8 }, px: { xs: 2, md: 8 } }}>
      {/* Encabezado */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, letterSpacing: 1.2, mb: 1, textTransform: "uppercase" }}>
          Perfil
        </Typography>
        <Typography variant="h3" sx={{ fontWeight: 800 }}>
          Mi cuenta
        </Typography>
        <Typography variant="body2" sx={{ maxWidth: 800, mx: "auto", mt: 1 }}>
          Revisa el estado de tus trámites, descarga documentos y administra tu información.
        </Typography>
      </Box>

      {/* Tarjeta de perfil */}
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
            width: "100%",
            maxWidth: 900,
          }}
        >
          <Avatar
            sx={{ width: { xs: 84, md: 112 }, height: { xs: 84, md: 112 }, bgcolor: "primary.main" }}
          >
            <AccountCircleIcon sx={{ fontSize: { xs: 48, md: 64 } }} />
          </Avatar>

          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {usuario?.name ?? "—"}
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
              {usuario ? (ETIQUETAS_ROL[usuario.nombre_rol] ?? usuario.nombre_rol) : "—"}
            </Typography>

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
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Trámites */}
      {processes && processes.length > 0 ? (
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
          {processes.map((p) => (
            <CardSistema
              key={p.id}
              elevation={3}
              sx={{
                borderRadius: 3,
                display: "flex",
                flexDirection: "column",
                transition: "transform 300ms ease, box-shadow 300ms ease",
                "&:hover": { transform: "translateY(-6px)", boxShadow: 8 },
              }}
            >
              <>
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

                <Box sx={{ mt: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={p.progress ?? 0}
                    sx={{ height: 8, borderRadius: 2 }}
                  />
                  <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
                    {p.progress ?? 0}% completado
                  </Typography>
                </Box>

                <Box sx={{ flexGrow: 1 }} />
              </>

              {
                <CardActions sx={{ px: 2, py: 1.25 }}>
                  <Tooltip title="Ver">
                    <IconButton size="small" onClick={() => onView?.(p)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Descargar">
                    <IconButton size="small" onClick={() => onDownload?.(p)}>
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              }
            </CardSistema>
          ))}
        </Box>
      ) : (
        <Box sx={{ textAlign: "center", py: 6, color: "text.secondary" }}>
          <Typography variant="body1">No tienes trámites activos.</Typography>
        </Box>
      )}
    </Box>
  );
}
