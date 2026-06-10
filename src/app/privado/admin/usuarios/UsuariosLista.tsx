import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import PeopleIcon from "@mui/icons-material/People";
import { useNavigate } from "react-router-dom";

import {
  UsuariosServicio,
  UsuarioResumen,
} from "../../../servicios/privados/UsuariosServicio";
import { crearMensaje } from "../../../utilidades/funciones/mensaje";
import { FormSeccion } from "../../../compartido/ui/FormSeccion";
import { CampoTexto } from "../../../compartido/ui/CampoTexto";
import { BotonPrincipal } from "../../../compartido/ui/BotonPrincipal";

// ── Colores por rol ───────────────────────────────────────────────────────────

const ROL_CONFIG: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrador", color: "#f59e0b" },
  supervisor: { label: "Supervisor", color: "#14b8a6" },
  funcionario: { label: "Funcionario", color: "#3b82f6" },
  ciudadano: { label: "Ciudadano", color: "#8b5cf6" },
  visitante: { label: "Visitante", color: "#64748b" },
};

// ── Componente de fila de skeleton ────────────────────────────────────────────

const FilaSkeleton = () => (
  <TableRow>
    {[160, 200, 120, 140, 160, 70].map((w, i) => (
      <TableCell key={i}>
        <Skeleton variant="text" width={w} height={22} />
      </TableCell>
    ))}
  </TableRow>
);

// ── Página principal ──────────────────────────────────────────────────────────

const UsuariosLista: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState<UsuarioResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Dialog de confirmación
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [seleccionado, setSeleccionado] = useState<UsuarioResumen | null>(null);

  // ── Carga inicial ───────────────────────────────────────────────────────────

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await UsuariosServicio.listar();
      setUsuarios(res);
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Filtrado local ──────────────────────────────────────────────────────────

  const lista = usuarios.filter((u) => {
    const texto = busqueda.toLowerCase();
    return (
      u.nombre_usuario.toLowerCase().includes(texto) ||
      (u.correo_usuario ?? "").toLowerCase().includes(texto) ||
      (u.cedula ?? "").toLowerCase().includes(texto) ||
      (u.nombre_entidad ?? "").toLowerCase().includes(texto)
    );
  });

  // ── Eliminar ────────────────────────────────────────────────────────────────

  const abrirConfirmacion = (u: UsuarioResumen) => {
    setSeleccionado(u);
    setDialogAbierto(true);
  };

  const confirmarEliminar = async () => {
    if (!seleccionado) return;
    setEliminando(true);
    try {
      await UsuariosServicio.eliminar(seleccionado.cod_usuario);
      setUsuarios((prev) => prev.filter((u) => u.cod_usuario !== seleccionado.cod_usuario));
      crearMensaje("success", `Usuario "${seleccionado.nombre_usuario}" eliminado`);
      setDialogAbierto(false);
      setSeleccionado(null);
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setEliminando(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", py: 3 }}>

      {/* Encabezado */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <PeopleIcon color="primary" />
          <Box>
            <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
              Usuarios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {cargando ? "Cargando..." : `${usuarios.length} usuario(s) registrado(s)`}
            </Typography>
          </Box>
        </Box>
        <BotonPrincipal
          type="button"
          fullWidth={false}
          onClick={() => navigate("/dashboard/admin/usuarios/crear")}
          sx={{ px: 3, py: 1.2 }}
        >
          <AddIcon sx={{ mr: 0.5, fontSize: 18 }} />
          Agregar usuario
        </BotonPrincipal>
      </Box>

      {/* Filtros */}
      <FormSeccion sx={{ mb: 3 }}>
        <CampoTexto
          label="Buscar por nombre, correo, cédula o entidad"
          size="small"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </FormSeccion>

      {/* Tabla */}
      <FormSeccion>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, whiteSpace: "nowrap" } }}>
                <TableCell>Nombre</TableCell>
                <TableCell>Correo</TableCell>
                <TableCell>Cédula</TableCell>
                <TableCell align="center">Rol</TableCell>
                <TableCell>Entidad</TableCell>
                <TableCell>Cargo</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Skeletons de carga */}
              {cargando && Array.from({ length: 5 }).map((_, i) => <FilaSkeleton key={i} />)}

              {/* Sin resultados */}
              {!cargando && lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      py={5}
                      color="text.secondary"
                      gap={1}
                    >
                      <SearchOffIcon sx={{ fontSize: 48, opacity: 0.3 }} />
                      <Typography variant="body2">
                        {busqueda
                          ? "No hay usuarios que coincidan con la búsqueda"
                          : "Aún no hay usuarios registrados"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {/* Filas */}
              {!cargando &&
                lista.map((u) => {
                  const rolInfo = ROL_CONFIG[u.nombre_rol] ?? { label: u.nombre_rol, color: "#64748b" };
                  return (
                    <TableRow
                      key={u.cod_usuario}
                      sx={{
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                        },
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {u.nombre_usuario}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {u.correo_usuario ?? "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {u.cedula ?? "—"}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={rolInfo.label}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.7rem",
                            color: rolInfo.color,
                            bgcolor: alpha(rolInfo.color, 0.12),
                            border: `1px solid ${alpha(rolInfo.color, 0.4)}`,
                          }}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2">
                          {u.nombre_entidad ?? "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {u.cargo ?? "—"}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Tooltip title="Eliminar usuario" arrow>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => abrirConfirmacion(u)}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </FormSeccion>

      {/* Dialog de confirmación */}
      <Dialog
        open={dialogAbierto}
        onClose={() => !eliminando && setDialogAbierto(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1 }}>
          <WarningAmberIcon color="error" />
          <Typography fontWeight={700}>Eliminar Usuario</Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            ¿Estás seguro de que deseas eliminar al usuario{" "}
            <strong>"{seleccionado?.nombre_usuario}"</strong>? Esta acción no se puede
            deshacer y eliminará sus accesos y vínculos con entidades.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setDialogAbierto(false)}
            disabled={eliminando}
          >
            Cancelar
          </Button>
          <BotonPrincipal
            type="button"
            fullWidth={false}
            color="error"
            cargando={eliminando}
            onClick={confirmarEliminar}
            sx={{ px: 3 }}
          >
            Eliminar
          </BotonPrincipal>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UsuariosLista;
