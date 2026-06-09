import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  alpha,
  useTheme,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import BuildIcon from "@mui/icons-material/Build";
import InboxIcon from "@mui/icons-material/Inbox";
import { jwtDecode } from "jwt-decode";

import { TramitesServicio, TramiteResumen, TramiteDetalle, EstadoTramite, EstadoPaso } from "../../servicios/privados/TramitesServicio";
import { WorkflowServicio, WorkflowCreado } from "../../servicios/privados/WorkflowServicio";
import { PasosServicio } from "../../servicios/privados/PasosServicio";
import { DocumentosServicio } from "../../servicios/privados/DocumentosServicio";
import { tokenHelper } from "../../utilidades/auth/tokenHelper";
import { crearMensaje } from "../../utilidades/funciones/mensaje";
import { FormSeccion } from "../../compartido/ui/FormSeccion";
import { CampoTexto } from "../../compartido/ui/CampoTexto";
import { BotonPrincipal } from "../../compartido/ui/BotonPrincipal";

// ── Constantes de display ─────────────────────────────────────────────────────

const ESTADO_TRAMITE: Record<EstadoTramite, { label: string; color: "info" | "success" | "error" | "default" }> = {
  EN_PROCESO: { label: "En proceso", color: "info" },
  COMPLETADO: { label: "Completado", color: "success" },
  ANULADO:    { label: "Anulado",    color: "error" },
  CANCELADO:  { label: "Cancelado",  color: "default" },
};

const ESTADO_PASO: Record<EstadoPaso, { label: string; color: "default" | "primary" | "info" | "success" | "error" | "warning" | "secondary" }> = {
  PENDIENTE:       { label: "Pendiente",        color: "default" },
  HABILITADO:      { label: "Habilitado",       color: "primary" },
  EN_REVISION:     { label: "En revisión",      color: "info" },
  APROBADO:        { label: "Aprobado",          color: "success" },
  DEVUELTO:        { label: "Devuelto",          color: "error" },
  EN_SUBSANACION:  { label: "En subsanación",   color: "warning" },
  REENVIADO:       { label: "Reenviado",         color: "secondary" },
  CERRADO:         { label: "Cerrado",           color: "success" },
};

// ── Hook: usuario del JWT ─────────────────────────────────────────────────────

function useUsuarioJWT() {
  const token = tokenHelper.get();
  if (!token) return null;
  try { return jwtDecode<{ name: string; cod_entidad: number | null }>(token); } catch { return null; }
}

// ── Componente ────────────────────────────────────────────────────────────────

const DashboardCiudadano: React.FC = () => {
  const theme = useTheme();
  const usuario = useUsuarioJWT();

  // Trámites
  const [tramites, setTramites]           = useState<TramiteResumen[]>([]);
  const [cargandoT, setCargandoT]         = useState(true);
  const [detalles, setDetalles]           = useState<Record<number, TramiteDetalle>>({});
  const [cargandoD, setCargandoD]         = useState<Record<number, boolean>>({});

  // Workflows
  const [workflows, setWorkflows]         = useState<WorkflowCreado[]>([]);
  const [cargandoW, setCargandoW]         = useState(true);

  // Dialog: iniciar trámite
  const [wfSeleccionado, setWfSeleccionado] = useState<WorkflowCreado | null>(null);
  const [obsIniciar, setObsIniciar]         = useState("");
  const [iniciando, setIniciando]           = useState(false);

  // Dialog: subsanar paso
  const [pasoSubsanar, setPasoSubsanar] = useState<{ tramiteId: number; pasoId: number; nombre: string } | null>(null);
  const [obsSubsanar, setObsSubsanar]   = useState("");
  const [subsanando, setSubsanando]     = useState(false);

  // Upload de documento
  const fileInputRef                          = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget]       = useState<{ tramiteId: number; pasoId: number } | null>(null);
  const [subiendoDoc, setSubiendoDoc]         = useState(false);

  // ── Carga inicial ────────────────────────────────────────────────────────────

  const cargarTramites = useCallback(async () => {
    setCargandoT(true);
    try {
      const res = await TramitesServicio.listar();
      setTramites(res.data);
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setCargandoT(false);
    }
  }, []);

  const cargarWorkflows = useCallback(async () => {
    setCargandoW(true);
    try {
      // ⚠️ BACKEND GAP: agregar 'ciudadano' a @Roles en workflows.controller.ts:37
      // Hasta que se corrija, el 403 se maneja silenciosamente (sección queda vacía)
      const res = await WorkflowServicio.listar({ activo: true });
      setWorkflows(res.data);
    } catch {
      setWorkflows([]);
    } finally {
      setCargandoW(false);
    }
  }, []);

  useEffect(() => {
    cargarTramites();
    cargarWorkflows();
  }, [cargarTramites, cargarWorkflows]);

  // ── Detalle lazy ─────────────────────────────────────────────────────────────

  const expandirTramite = async (codTramite: number, abierto: boolean) => {
    if (!abierto || detalles[codTramite]) return;
    setCargandoD((prev) => ({ ...prev, [codTramite]: true }));
    try {
      const res = await TramitesServicio.detalle(codTramite);
      setDetalles((prev) => ({ ...prev, [codTramite]: res }));
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setCargandoD((prev) => ({ ...prev, [codTramite]: false }));
    }
  };

  // ── Iniciar trámite ──────────────────────────────────────────────────────────

  const confirmarIniciar = async () => {
    if (!wfSeleccionado) return;
    setIniciando(true);
    try {
      const res = await TramitesServicio.iniciar(wfSeleccionado.codWorkflow, {
        codEntidadAsignada: usuario?.cod_entidad ?? 1,
        observacionInicial: obsIniciar || undefined,
      });
      crearMensaje("success", `Trámite ${res.codigoExpediente} iniciado`);
      setWfSeleccionado(null);
      setObsIniciar("");
      cargarTramites();
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setIniciando(false);
    }
  };

  // ── Subsanar paso ────────────────────────────────────────────────────────────

  const confirmarSubsanar = async () => {
    if (!pasoSubsanar || !obsSubsanar.trim()) return;
    setSubsanando(true);
    try {
      await PasosServicio.subsanar(pasoSubsanar.tramiteId, pasoSubsanar.pasoId, obsSubsanar);
      crearMensaje("success", "Subsanación enviada correctamente");
      // Recarga el detalle del trámite afectado
      const res = await TramitesServicio.detalle(pasoSubsanar.tramiteId);
      setDetalles((prev) => ({ ...prev, [pasoSubsanar.tramiteId]: res }));
      setPasoSubsanar(null);
      setObsSubsanar("");
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setSubsanando(false);
    }
  };

  // ── Subir documento ──────────────────────────────────────────────────────────

  const abrirSelectorArchivo = (tramiteId: number, pasoId: number) => {
    setUploadTarget({ tramiteId, pasoId });
    fileInputRef.current?.click();
  };

  const handleArchivoSeleccionado = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (!archivo || !uploadTarget) return;
    setSubiendoDoc(true);
    try {
      await DocumentosServicio.subir(uploadTarget.tramiteId, uploadTarget.pasoId, archivo);
      crearMensaje("success", `"${archivo.name}" subido correctamente`);
    } catch (ex) {
      crearMensaje("error", (ex as Error).message);
    } finally {
      setSubiendoDoc(false);
      setUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ── Render: pasos de un trámite ───────────────────────────────────────────────

  const renderPasos = (codTramite: number) => {
    if (cargandoD[codTramite]) {
      return (
        <Stack spacing={1.5} sx={{ pt: 1 }}>
          {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={44} />)}
        </Stack>
      );
    }

    const detalle = detalles[codTramite];
    if (!detalle) return null;

    return (
      <Stack spacing={1} sx={{ pt: 1 }}>
        {detalle.pasos.map((paso, idx) => {
          const cfg = ESTADO_PASO[paso.estado] ?? { label: paso.estado, color: "default" as const };

          const esDevuelto = paso.estado === "DEVUELTO";

          // Ciudadano puede subir doc cuando el paso lo requiere y está activo
          const necesitaDocumento =
            paso.paso.requiereDocumentos &&
            paso.habilitado &&
            (paso.estado === "PENDIENTE" || paso.estado === "HABILITADO" || paso.estado === "EN_SUBSANACION");

          return (
            <Box
              key={paso.codTramitePaso}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.25,
                borderRadius: 2,
                bgcolor: (t) => t.palette.mode === "dark"
                  ? alpha("#ffffff", 0.03)
                  : alpha("#000000", 0.02),
                border: `1px solid`,
                borderColor: (t) => t.palette.mode === "dark"
                  ? alpha("#ffffff", 0.06)
                  : alpha("#000000", 0.06),
                opacity: paso.habilitado ? 1 : 0.55,
              }}
            >
              {/* Orden */}
              <Typography
                variant="caption"
                sx={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  bgcolor: "action.selected",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  flexShrink: 0,
                  fontSize: "0.7rem",
                }}
              >
                {paso.paso.ordenVisual ?? idx + 1}
              </Typography>

              {/* Nombre */}
              <Typography variant="body2" fontWeight={500} sx={{ flex: 1 }}>
                {paso.paso.nombre}
              </Typography>

              {/* Estado */}
              <Chip
                label={cfg.label}
                color={cfg.color}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600, fontSize: "0.7rem", flexShrink: 0 }}
              />

              {/* Acción: subsanar (solo cuando el funcionario devolvió el paso) */}
              {esDevuelto && (
                <Button
                  size="small"
                  variant="contained"
                  color="warning"
                  onClick={() => setPasoSubsanar({
                    tramiteId: codTramite,
                    pasoId: paso.codTramitePaso,
                    nombre: paso.paso.nombre,
                  })}
                  sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.25, flexShrink: 0 }}
                >
                  <BuildIcon sx={{ fontSize: "0.9rem", mr: 0.5 }} />
                  Subsanar
                </Button>
              )}

              {/* Acción: subir documento */}
              {necesitaDocumento && (
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  disabled={subiendoDoc}
                  onClick={() => abrirSelectorArchivo(codTramite, paso.codTramitePaso)}
                  sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.25, flexShrink: 0 }}
                >
                  <UploadFileIcon sx={{ fontSize: "0.9rem", mr: 0.5 }} />
                  Subir doc.
                </Button>
              )}
            </Box>
          );
        })}
      </Stack>
    );
  };

  // ── Render principal ──────────────────────────────────────────────────────────

  return (
    <Box sx={{ maxWidth: 1300, mx: "auto", py: 3 }}>

      {/* Saludo */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>
          Bienvenido{usuario?.name ? `, ${usuario.name.split(" ")[0]}` : ""}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestiona tus trámites con la Alcaldía de Tunja desde aquí.
        </Typography>
      </Box>

      {/* Layout 2 columnas */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "3fr 2fr" },
          gap: 3,
          alignItems: "start",
        }}
      >

        {/* ── SECCIÓN 1: Mis trámites ── */}
        <FormSeccion
          titulo="Mis trámites activos"
          subtitulo={cargandoT ? "Cargando…" : `${tramites.length} trámite(s) registrado(s)`}
        >
          {/* Skeletons de carga */}
          {cargandoT && (
            <Stack spacing={1.5}>
              {[1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={56} />)}
            </Stack>
          )}

          {/* Estado vacío */}
          {!cargandoT && tramites.length === 0 && (
            <Box sx={{ py: 5, textAlign: "center", color: "text.secondary" }}>
              <InboxIcon sx={{ fontSize: 48, opacity: 0.25, mb: 1, display: "block", mx: "auto" }} />
              <Typography variant="body2">No tienes trámites activos aún.</Typography>
              <Typography variant="caption">Inicia uno desde la sección de la derecha.</Typography>
            </Box>
          )}

          {/* Lista de trámites */}
          {!cargandoT && tramites.map((tr) => {
            const cfg = ESTADO_TRAMITE[tr.estado] ?? { label: tr.estado, color: "default" as const };
            return (
              <Accordion
                key={tr.codTramite}
                disableGutters
                elevation={0}
                onChange={(_, abierto) => expandirTramite(tr.codTramite, abierto)}
                sx={{
                  border: `1px solid`,
                  borderColor: "divider",
                  borderRadius: "12px !important",
                  mb: 1.5,
                  "&:before": { display: "none" },
                  "&.Mui-expanded": {
                    borderColor: theme.palette.primary.main,
                    boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ px: 2, py: 0.5, borderRadius: 3 }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, flexWrap: "wrap", mr: 1 }}>
                    {/* Expediente */}
                    <Typography
                      variant="caption"
                      fontFamily="monospace"
                      fontWeight={700}
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: "primary.main",
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        flexShrink: 0,
                      }}
                    >
                      {tr.codigoExpediente}
                    </Typography>

                    {/* Tipo */}
                    <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                      {tr.tipoTramite}
                    </Typography>

                    {/* Estado + Progreso */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                      <Chip
                        label={cfg.label}
                        color={cfg.color}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: "0.7rem" }}
                      />
                      <Box sx={{ width: 80 }}>
                        <LinearProgress
                          variant="determinate"
                          value={tr.progreso}
                          sx={{ height: 6, borderRadius: 3 }}
                          color={cfg.color === "success" ? "success" : "primary"}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {tr.progreso}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 2, pb: 2, pt: 0 }}>
                  <Divider sx={{ mb: 1.5 }} />
                  {renderPasos(tr.codTramite)}
                </AccordionDetails>
              </Accordion>
            );
          })}
        </FormSeccion>

        {/* ── SECCIÓN 2: Iniciar trámite ── */}
        <FormSeccion
          titulo="Iniciar un trámite"
          subtitulo="Elige el tipo de trámite que necesitas"
        >
          {/* Skeleton */}
          {cargandoW && (
            <Stack spacing={1.5}>
              {[1, 2].map((i) => <Skeleton key={i} variant="rounded" height={80} />)}
            </Stack>
          )}

          {/* Vacío */}
          {!cargandoW && workflows.length === 0 && (
            <Box sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
              <FolderOpenIcon sx={{ fontSize: 40, opacity: 0.25, mb: 1, display: "block", mx: "auto" }} />
              <Typography variant="body2">No hay trámites disponibles por el momento.</Typography>
            </Box>
          )}

          {/* Cards de workflows */}
          <Stack spacing={1.5}>
            {!cargandoW && workflows.map((wf) => (
              <Box
                key={wf.codWorkflow}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: `1px solid`,
                  borderColor: "divider",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                  },
                  transition: "border-color 0.15s, background-color 0.15s",
                }}
              >
                <Typography variant="body2" fontWeight={700} gutterBottom>
                  {wf.nombre}
                </Typography>
                {wf.descripcion && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      mb: 1.5,
                    }}
                  >
                    {wf.descripcion}
                  </Typography>
                )}
                <BotonPrincipal
                  type="button"
                  fullWidth={false}
                  onClick={() => setWfSeleccionado(wf)}
                  sx={{ fontSize: "0.8rem", py: 0.6, px: 2.5 }}
                >
                  <AddCircleOutlineIcon sx={{ fontSize: "0.95rem", mr: 0.5 }} />
                  Iniciar
                </BotonPrincipal>
              </Box>
            ))}
          </Stack>
        </FormSeccion>
      </Box>

      {/* ── Input de archivo oculto ── */}
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: "none" }}
        onChange={handleArchivoSeleccionado}
      />

      {/* ── Dialog: Iniciar trámite ── */}
      <Dialog
        open={!!wfSeleccionado}
        onClose={() => !iniciando && setWfSeleccionado(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography fontWeight={800}>Iniciar trámite</Typography>
          <Typography variant="body2" color="text.secondary">
            {wfSeleccionado?.nombre}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <CampoTexto
            label="Observación inicial (opcional)"
            multiline
            rows={3}
            value={obsIniciar}
            onChange={(e) => setObsIniciar(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setWfSeleccionado(null)} disabled={iniciando}>
            Cancelar
          </Button>
          <BotonPrincipal
            type="button"
            fullWidth={false}
            cargando={iniciando}
            onClick={confirmarIniciar}
            sx={{ px: 3 }}
          >
            Confirmar
          </BotonPrincipal>
        </DialogActions>
      </Dialog>

      {/* ── Dialog: Subsanar paso ── */}
      <Dialog
        open={!!pasoSubsanar}
        onClose={() => !subsanando && setPasoSubsanar(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography fontWeight={800}>Subsanar observación</Typography>
          <Typography variant="body2" color="text.secondary">
            {pasoSubsanar?.nombre}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <CampoTexto
            label="Describe la corrección realizada *"
            multiline
            rows={4}
            value={obsSubsanar}
            onChange={(e) => setObsSubsanar(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setPasoSubsanar(null)} disabled={subsanando}>
            Cancelar
          </Button>
          <BotonPrincipal
            type="button"
            fullWidth={false}
            cargando={subsanando}
            onClick={confirmarSubsanar}
            disabled={!obsSubsanar.trim()}
            sx={{ px: 3 }}
          >
            Enviar subsanación
          </BotonPrincipal>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardCiudadano;
