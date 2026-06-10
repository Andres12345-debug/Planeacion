import React, { useCallback, useEffect, useState } from "react";
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
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InboxIcon from "@mui/icons-material/Inbox";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { jwtDecode } from "jwt-decode";

import { TramitesServicio, TramiteResumen, TramiteDetalle, EstadoTramite, EstadoPaso, PasoDetalle } from "../../servicios/privados/TramitesServicio";
import { PasosServicio } from "../../servicios/privados/PasosServicio";
import { DocumentosServicio } from "../../servicios/privados/DocumentosServicio";
import { UsuariosServicio, UsuarioResumen } from "../../servicios/privados/UsuariosServicio";
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

type PasoRef = { tramiteId: number; pasoId: number; nombre: string };

// ── Hook: usuario del JWT ─────────────────────────────────────────────────────

function useUsuarioJWT() {
  const token = tokenHelper.get();
  if (!token) return null;
  try { return jwtDecode<{ name: string; nombre_rol: string }>(token); } catch { return null; }
}

// ── Componente ────────────────────────────────────────────────────────────────

const DashboardGestionTramites: React.FC = () => {
  const theme = useTheme();
  const usuario = useUsuarioJWT();
  const rol = usuario?.nombre_rol ?? "";

  const puedeActuar = rol === "funcionario" || rol === "supervisor" || rol === "admin";
  const puedeAsignar = rol === "supervisor" || rol === "admin";

  // Trámites
  const [tramites, setTramites]   = useState<TramiteResumen[]>([]);
  const [cargandoT, setCargandoT] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<EstadoTramite | "">("");
  const [detalles, setDetalles]   = useState<Record<number, TramiteDetalle>>({});
  const [cargandoD, setCargandoD] = useState<Record<number, boolean>>({});

  // Descarga de documentos
  const [descargando, setDescargando] = useState<Record<number, boolean>>({});

  // Dialog: iniciar revisión
  const [pasoIniciar, setPasoIniciar] = useState<PasoRef | null>(null);
  const [obsIniciar, setObsIniciar]   = useState("");
  const [iniciando, setIniciando]     = useState(false);

  // Dialog: aprobar
  const [pasoAprobar, setPasoAprobar] = useState<PasoRef | null>(null);
  const [obsAprobar, setObsAprobar]   = useState("");
  const [aprobando, setAprobando]     = useState(false);

  // Dialog: devolver
  const [pasoDevolver, setPasoDevolver] = useState<PasoRef | null>(null);
  const [obsDevolver, setObsDevolver]   = useState("");
  const [devolviendo, setDevolviendo]   = useState(false);

  // Dialog: asignar funcionario
  const [pasoAsignar, setPasoAsignar]           = useState<PasoRef | null>(null);
  const [funcionarios, setFuncionarios]         = useState<UsuarioResumen[]>([]);
  const [cargandoF, setCargandoF]               = useState(false);
  const [funcionarioSeleccionado, setFuncionarioSeleccionado] = useState<number | "">("");
  const [asignando, setAsignando]               = useState(false);

  // ── Carga inicial ────────────────────────────────────────────────────────────

  const cargarTramites = useCallback(async () => {
    setCargandoT(true);
    try {
      const res = await TramitesServicio.listar(filtroEstado ? { estado: filtroEstado } : undefined);
      setTramites(res.data);
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setCargandoT(false);
    }
  }, [filtroEstado]);

  useEffect(() => {
    cargarTramites();
  }, [cargarTramites]);

  // ── Detalle lazy ─────────────────────────────────────────────────────────────

  const refrescarDetalle = async (codTramite: number) => {
    const res = await TramitesServicio.detalle(codTramite);
    setDetalles((prev) => ({ ...prev, [codTramite]: res }));
  };

  const expandirTramite = async (codTramite: number, abierto: boolean) => {
    if (!abierto || detalles[codTramite]) return;
    setCargandoD((prev) => ({ ...prev, [codTramite]: true }));
    try {
      await refrescarDetalle(codTramite);
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setCargandoD((prev) => ({ ...prev, [codTramite]: false }));
    }
  };

  // ── Iniciar revisión ─────────────────────────────────────────────────────────

  const confirmarIniciar = async () => {
    if (!pasoIniciar) return;
    setIniciando(true);
    try {
      await PasosServicio.iniciarRevision(pasoIniciar.tramiteId, pasoIniciar.pasoId, obsIniciar || undefined);
      crearMensaje("success", "Revisión iniciada");
      await refrescarDetalle(pasoIniciar.tramiteId);
      setPasoIniciar(null);
      setObsIniciar("");
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setIniciando(false);
    }
  };

  // ── Aprobar ──────────────────────────────────────────────────────────────────

  const confirmarAprobar = async () => {
    if (!pasoAprobar) return;
    setAprobando(true);
    try {
      await PasosServicio.aprobar(pasoAprobar.tramiteId, pasoAprobar.pasoId, obsAprobar || undefined);
      crearMensaje("success", "Paso aprobado");
      await refrescarDetalle(pasoAprobar.tramiteId);
      await cargarTramites();
      setPasoAprobar(null);
      setObsAprobar("");
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setAprobando(false);
    }
  };

  // ── Devolver ─────────────────────────────────────────────────────────────────

  const confirmarDevolver = async () => {
    if (!pasoDevolver || !obsDevolver.trim()) return;
    setDevolviendo(true);
    try {
      await PasosServicio.devolver(pasoDevolver.tramiteId, pasoDevolver.pasoId, obsDevolver);
      crearMensaje("success", "Paso devuelto para subsanación");
      await refrescarDetalle(pasoDevolver.tramiteId);
      setPasoDevolver(null);
      setObsDevolver("");
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setDevolviendo(false);
    }
  };

  // ── Asignar funcionario ──────────────────────────────────────────────────────

  const abrirAsignar = async (ref: PasoRef) => {
    setPasoAsignar(ref);
    setFuncionarioSeleccionado("");
    if (funcionarios.length === 0) {
      setCargandoF(true);
      try {
        const res = await UsuariosServicio.listar();
        setFuncionarios(res.filter((u) => u.nombre_rol === "funcionario"));
      } catch (e) {
        crearMensaje("error", (e as Error).message);
      } finally {
        setCargandoF(false);
      }
    }
  };

  const confirmarAsignar = async () => {
    if (!pasoAsignar || !funcionarioSeleccionado) return;
    setAsignando(true);
    try {
      await PasosServicio.asignarFuncionario(pasoAsignar.tramiteId, pasoAsignar.pasoId, Number(funcionarioSeleccionado));
      crearMensaje("success", "Funcionario asignado al paso");
      await refrescarDetalle(pasoAsignar.tramiteId);
      setPasoAsignar(null);
      setFuncionarioSeleccionado("");
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setAsignando(false);
    }
  };

  // ── Descargar documento ──────────────────────────────────────────────────────

  const descargarDocumento = async (tramiteId: number, pasoId: number, doc: NonNullable<PasoDetalle["documentos"]>[number]) => {
    setDescargando((prev) => ({ ...prev, [doc.codDocumentoPaso]: true }));
    try {
      await DocumentosServicio.descargar(tramiteId, pasoId, doc.codDocumentoPaso, doc.nombreDocumento);
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setDescargando((prev) => ({ ...prev, [doc.codDocumentoPaso]: false }));
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

          const puedeIniciar = puedeActuar && paso.habilitado &&
            (paso.estado === "PENDIENTE" || paso.estado === "REENVIADO");
          const puedeRevisar = puedeActuar && paso.estado === "EN_REVISION";
          const puedeAsignarPaso = puedeAsignar && paso.estado !== "APROBADO";

          return (
            <Box
              key={paso.codTramitePaso}
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
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
                <Typography variant="body2" fontWeight={500} sx={{ flex: 1, minWidth: 160 }}>
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

                {paso.habilitado && (
                  <Chip
                    label="Habilitado"
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 600, fontSize: "0.65rem", flexShrink: 0 }}
                  />
                )}

                {paso.numeroDevoluciones ? (
                  <Chip
                    label={`${paso.numeroDevoluciones} devolución(es)`}
                    size="small"
                    variant="outlined"
                    color="warning"
                    sx={{ fontWeight: 600, fontSize: "0.65rem", flexShrink: 0 }}
                  />
                ) : null}
              </Box>

              {/* Acciones */}
              {(puedeIniciar || puedeRevisar || puedeAsignarPaso) && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {puedeIniciar && (
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      onClick={() => setPasoIniciar({ tramiteId: codTramite, pasoId: paso.codTramitePaso, nombre: paso.paso.nombre })}
                      sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.25 }}
                    >
                      <PlayCircleOutlineIcon sx={{ fontSize: "0.9rem", mr: 0.5 }} />
                      Iniciar revisión
                    </Button>
                  )}

                  {puedeRevisar && (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => setPasoAprobar({ tramiteId: codTramite, pasoId: paso.codTramitePaso, nombre: paso.paso.nombre })}
                        sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.25 }}
                      >
                        <CheckCircleOutlineIcon sx={{ fontSize: "0.9rem", mr: 0.5 }} />
                        Aprobar
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="error"
                        onClick={() => setPasoDevolver({ tramiteId: codTramite, pasoId: paso.codTramitePaso, nombre: paso.paso.nombre })}
                        sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.25 }}
                      >
                        <AssignmentReturnIcon sx={{ fontSize: "0.9rem", mr: 0.5 }} />
                        Devolver
                      </Button>
                    </>
                  )}

                  {puedeAsignarPaso && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="secondary"
                      onClick={() => abrirAsignar({ tramiteId: codTramite, pasoId: paso.codTramitePaso, nombre: paso.paso.nombre })}
                      sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.25 }}
                    >
                      <PersonAddAltIcon sx={{ fontSize: "0.9rem", mr: 0.5 }} />
                      Asignar funcionario
                    </Button>
                  )}
                </Box>
              )}

              {/* Documentos cargados en el paso */}
              {!!paso.documentos?.length && (
                <List dense disablePadding sx={{ pl: 4 }}>
                  {paso.documentos.map((doc) => (
                    <ListItem
                      key={doc.codDocumentoPaso}
                      disableGutters
                      disablePadding
                      sx={{ py: 0 }}
                      secondaryAction={
                        <Tooltip title="Descargar">
                          <span>
                            <IconButton
                              size="small"
                              edge="end"
                              disabled={!!descargando[doc.codDocumentoPaso]}
                              onClick={() => descargarDocumento(codTramite, paso.codTramitePaso, doc)}
                            >
                              <DownloadIcon sx={{ fontSize: "1rem" }} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      }
                    >
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <DescriptionIcon sx={{ fontSize: "1rem" }} color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primaryTypographyProps={{ variant: "caption" }}
                        primary={doc.nombreDocumento}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          );
        })}
      </Stack>
    );
  };

  // ── Render principal ──────────────────────────────────────────────────────────

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", py: 3 }}>

      {/* Encabezado */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            Gestión de trámites
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {rol === "visitante"
              ? "Consulta el estado de los trámites de tu entidad."
              : "Revisa, aprueba o devuelve los pasos a tu cargo."}
          </Typography>
        </Box>

        <CampoTexto
          select
          label="Estado"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value as EstadoTramite | "")}
          sx={{ width: 200 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {Object.entries(ESTADO_TRAMITE).map(([valor, cfg]) => (
            <MenuItem key={valor} value={valor}>{cfg.label}</MenuItem>
          ))}
        </CampoTexto>
      </Box>

      <FormSeccion
        subtitulo={cargandoT ? "Cargando…" : `${tramites.length} trámite(s) encontrado(s)`}
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
            <Typography variant="body2">No hay trámites para mostrar.</Typography>
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

                  {/* Tipo + creador/entidad */}
                  <Box sx={{ flex: 1, minWidth: 180 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {tr.tipoTramite}
                    </Typography>
                    {(tr.usuarioCreador || tr.entidadAsignada) && (
                      <Typography variant="caption" color="text.secondary">
                        {tr.usuarioCreador?.nombreUsuario}
                        {tr.usuarioCreador && tr.entidadAsignada ? " · " : ""}
                        {tr.entidadAsignada?.nombreEntidad}
                      </Typography>
                    )}
                  </Box>

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

      {/* ── Dialog: Iniciar revisión ── */}
      <Dialog
        open={!!pasoIniciar}
        onClose={() => !iniciando && setPasoIniciar(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography fontWeight={800}>Iniciar revisión</Typography>
          <Typography variant="body2" color="text.secondary">
            {pasoIniciar?.nombre}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <CampoTexto
            label="Observación (opcional)"
            multiline
            rows={3}
            value={obsIniciar}
            onChange={(e) => setObsIniciar(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setPasoIniciar(null)} disabled={iniciando}>
            Cancelar
          </Button>
          <BotonPrincipal
            type="button"
            fullWidth={false}
            cargando={iniciando}
            onClick={confirmarIniciar}
            sx={{ px: 3 }}
          >
            Iniciar
          </BotonPrincipal>
        </DialogActions>
      </Dialog>

      {/* ── Dialog: Aprobar ── */}
      <Dialog
        open={!!pasoAprobar}
        onClose={() => !aprobando && setPasoAprobar(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography fontWeight={800}>Aprobar paso</Typography>
          <Typography variant="body2" color="text.secondary">
            {pasoAprobar?.nombre}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <CampoTexto
            label="Observación (opcional)"
            multiline
            rows={3}
            value={obsAprobar}
            onChange={(e) => setObsAprobar(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setPasoAprobar(null)} disabled={aprobando}>
            Cancelar
          </Button>
          <BotonPrincipal
            type="button"
            fullWidth={false}
            cargando={aprobando}
            onClick={confirmarAprobar}
            color="success"
            sx={{ px: 3 }}
          >
            Aprobar
          </BotonPrincipal>
        </DialogActions>
      </Dialog>

      {/* ── Dialog: Devolver ── */}
      <Dialog
        open={!!pasoDevolver}
        onClose={() => !devolviendo && setPasoDevolver(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography fontWeight={800}>Devolver paso</Typography>
          <Typography variant="body2" color="text.secondary">
            {pasoDevolver?.nombre}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <CampoTexto
            label="Indica al ciudadano qué debe corregir *"
            multiline
            rows={4}
            value={obsDevolver}
            onChange={(e) => setObsDevolver(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setPasoDevolver(null)} disabled={devolviendo}>
            Cancelar
          </Button>
          <BotonPrincipal
            type="button"
            fullWidth={false}
            cargando={devolviendo}
            onClick={confirmarDevolver}
            disabled={!obsDevolver.trim()}
            color="error"
            sx={{ px: 3 }}
          >
            Devolver
          </BotonPrincipal>
        </DialogActions>
      </Dialog>

      {/* ── Dialog: Asignar funcionario ── */}
      <Dialog
        open={!!pasoAsignar}
        onClose={() => !asignando && setPasoAsignar(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography fontWeight={800}>Asignar funcionario</Typography>
          <Typography variant="body2" color="text.secondary">
            {pasoAsignar?.nombre}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <CampoTexto
            select
            label="Funcionario"
            value={funcionarioSeleccionado}
            onChange={(e) => setFuncionarioSeleccionado(Number(e.target.value))}
            disabled={cargandoF || funcionarios.length === 0}
            helperText={!cargandoF && funcionarios.length === 0 ? "No hay funcionarios disponibles en tu entidad" : undefined}
            sx={{ mt: 1 }}
          >
            {funcionarios.map((f) => (
              <MenuItem key={f.cod_usuario} value={f.cod_usuario}>
                {f.nombre_usuario}{f.cargo ? ` — ${f.cargo}` : ""}
              </MenuItem>
            ))}
          </CampoTexto>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={() => setPasoAsignar(null)} disabled={asignando}>
            Cancelar
          </Button>
          <BotonPrincipal
            type="button"
            fullWidth={false}
            cargando={asignando}
            onClick={confirmarAsignar}
            disabled={!funcionarioSeleccionado}
            sx={{ px: 3 }}
          >
            Asignar
          </BotonPrincipal>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DashboardGestionTramites;
