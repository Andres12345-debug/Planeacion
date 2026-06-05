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
  Stack,
  alpha,
  useTheme,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SearchOffIcon from "@mui/icons-material/SearchOff";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { useNavigate } from "react-router-dom";

import {
  WorkflowServicio,
  WorkflowCreado,
} from "../../../servicios/privados/WorkflowServicio";
import { crearMensaje } from "../../../utilidades/funciones/mensaje";
import { FormSeccion } from "../../../compartido/ui/FormSeccion";
import { CampoTexto } from "../../../compartido/ui/CampoTexto";
import { BotonPrincipal } from "../../../compartido/ui/BotonPrincipal";

// ── Componente de fila de skeleton ────────────────────────────────────────────

const FilaSkeleton = () => (
  <TableRow>
    {[100, 180, 240, 70, 80].map((w, i) => (
      <TableCell key={i}>
        <Skeleton variant="text" width={w} height={22} />
      </TableCell>
    ))}
  </TableRow>
);

// ── Página principal ──────────────────────────────────────────────────────────

const WorkflowLista: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState<WorkflowCreado[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroActivo, setFiltroActivo] = useState<"todos" | "activo" | "inactivo">("todos");

  // Dialog de confirmación
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [seleccionado, setSeleccionado] = useState<WorkflowCreado | null>(null);

  // ── Carga inicial ───────────────────────────────────────────────────────────

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await WorkflowServicio.listar();
      setWorkflows(res.data);
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  // ── Filtrado local ──────────────────────────────────────────────────────────

  const lista = workflows.filter((w) => {
    const coincideBusqueda =
      w.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      w.codigo.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado =
      filtroActivo === "todos" ||
      (filtroActivo === "activo" && w.activo) ||
      (filtroActivo === "inactivo" && !w.activo);
    return coincideBusqueda && coincideEstado;
  });

  // ── Eliminar ────────────────────────────────────────────────────────────────

  const abrirConfirmacion = (w: WorkflowCreado) => {
    setSeleccionado(w);
    setDialogAbierto(true);
  };

  const confirmarEliminar = async () => {
    if (!seleccionado) return;
    setEliminando(true);
    try {
      await WorkflowServicio.eliminar(seleccionado.codWorkflow);
      setWorkflows((prev) => prev.filter((w) => w.codWorkflow !== seleccionado.codWorkflow));
      crearMensaje("success", `Workflow "${seleccionado.nombre}" eliminado`);
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
    <Box sx={{ maxWidth: 1100, mx: "auto", py: 3 }}>

      {/* Encabezado */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box display="flex" alignItems="center" gap={1.5}>
          <AccountTreeIcon color="primary" />
          <Box>
            <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
              Workflows
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {cargando ? "Cargando..." : `${workflows.length} workflow(s) registrado(s)`}
            </Typography>
          </Box>
        </Box>
        <BotonPrincipal
          type="button"
          fullWidth={false}
          onClick={() => navigate("/dashboard/admin/workflows/crear")}
          sx={{ px: 3, py: 1.2 }}
        >
          <AddIcon sx={{ mr: 0.5, fontSize: 18 }} />
          Nuevo Workflow
        </BotonPrincipal>
      </Box>

      {/* Filtros */}
      <FormSeccion sx={{ mb: 3 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center">
          <CampoTexto
            label="Buscar por código o nombre"
            size="small"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            sx={{ flex: 1, minWidth: 220 }}
          />
          <Box display="flex" gap={1} flexShrink={0}>
            {(["todos", "activo", "inactivo"] as const).map((f) => (
              <Chip
                key={f}
                label={f === "todos" ? "Todos" : f === "activo" ? "Activos" : "Inactivos"}
                variant={filtroActivo === f ? "filled" : "outlined"}
                color={filtroActivo === f ? "primary" : "default"}
                onClick={() => setFiltroActivo(f)}
                size="small"
                sx={{ fontWeight: 600, cursor: "pointer" }}
              />
            ))}
          </Box>
        </Stack>
      </FormSeccion>

      {/* Tabla */}
      <FormSeccion>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ "& th": { fontWeight: 700, whiteSpace: "nowrap" } }}>
                <TableCell>Código</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell align="center">Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {/* Skeletons de carga */}
              {cargando && Array.from({ length: 5 }).map((_, i) => <FilaSkeleton key={i} />)}

              {/* Sin resultados */}
              {!cargando && lista.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
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
                        {busqueda || filtroActivo !== "todos"
                          ? "No hay workflows que coincidan con el filtro"
                          : "Aún no hay workflows creados"}
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}

              {/* Filas */}
              {!cargando &&
                lista.map((w) => (
                  <TableRow
                    key={w.codWorkflow}
                    sx={{
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                    }}
                  >
                    <TableCell>
                      <Typography
                        variant="caption"
                        fontFamily="monospace"
                        fontWeight={700}
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                        }}
                      >
                        {w.codigo}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {w.nombre}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {w.descripcion ?? "—"}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        label={w.activo ? "Activo" : "Inactivo"}
                        size="small"
                        color={w.activo ? "success" : "default"}
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                      />
                    </TableCell>

                    <TableCell align="center">
                      <Tooltip title="Eliminar workflow" arrow>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => abrirConfirmacion(w)}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
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
          <Typography fontWeight={700}>Eliminar Workflow</Typography>
        </DialogTitle>

        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            ¿Estás seguro de que deseas eliminar el workflow{" "}
            <strong>"{seleccionado?.nombre}"</strong>? Esta acción no se puede deshacer y
            eliminará todas sus etapas y pasos asociados.
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

export default WorkflowLista;
