import React, { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  Alert,
  Divider,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

import {
  WorkflowServicio,
  WorkflowCreado,
  EtapaCreada,
  PasoCreado,
  CanalPaso,
} from "../../../servicios/privados/WorkflowServicio";
import { crearMensaje } from "../../../utilidades/funciones/mensaje";
import { FormSeccion } from "../../../compartido/ui/FormSeccion";
import { CampoTexto } from "../../../compartido/ui/CampoTexto";
import { CampoSwitch } from "../../../compartido/ui/CampoSwitch";
import { BotonPrincipal } from "../../../compartido/ui/BotonPrincipal";

// ── Tipos de formulario locales ───────────────────────────────────────────────

interface FormWorkflow { codigo: string; nombre: string; descripcion: string; activo: boolean }
interface FormEtapa   { nombre: string; codDepartamentoResponsable: string; descripcion: string }
interface FormPaso {
  codigo: string; nombre: string; descripcion: string;
  canal: CanalPaso; slaDias: string;
  requiereDocumentos: boolean; permiteSubsanacion: boolean; visibleCiudadano: boolean;
}

const W0: FormWorkflow = { codigo: "", nombre: "", descripcion: "", activo: true };
const E0: FormEtapa    = { nombre: "", codDepartamentoResponsable: "", descripcion: "" };
const P0: FormPaso     = {
  codigo: "", nombre: "", descripcion: "", canal: "VIRTUAL", slaDias: "5",
  requiereDocumentos: false, permiteSubsanacion: true, visibleCiudadano: true,
};

const PASOS_STEPPER = ["Datos del Workflow", "Etapas", "Pasos por etapa"];

// ── Componente ────────────────────────────────────────────────────────────────

const WorkflowCrear: React.FC = () => {
  const navigate = useNavigate();
  const [pasoActivo, setPasoActivo] = useState(0);
  const [cargando, setCargando]     = useState(false);

  const [formW, setFormW]   = useState<FormWorkflow>(W0);
  const [workflow, setWF]   = useState<WorkflowCreado | null>(null);
  const [formE, setFormE]   = useState<FormEtapa>(E0);
  const [etapas, setEtapas] = useState<EtapaCreada[]>([]);
  const [formsP, setFormsP] = useState<Record<number, FormPaso>>({});
  const [pasosPorEtapa, setPasosPorEtapa] = useState<Record<number, PasoCreado[]>>({});

  // ── Handlers Step 1 ──────────────────────────────────────────────────────────

  const handleCrearWorkflow = async () => {
    if (!formW.codigo.trim() || !formW.nombre.trim()) {
      crearMensaje("warning", "El código y el nombre son obligatorios");
      return;
    }
    setCargando(true);
    try {
      const resultado = await WorkflowServicio.crear({
        codigo: formW.codigo.trim(),
        nombre: formW.nombre.trim(),
        ...(formW.descripcion.trim() ? { descripcion: formW.descripcion.trim() } : {}),
        activo: formW.activo,
      });
      setWF(resultado);
      setPasoActivo(1);
      crearMensaje("success", `Workflow "${resultado.nombre}" creado`);
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setCargando(false);
    }
  };

  // ── Handlers Step 2 ──────────────────────────────────────────────────────────

  const handleAgregarEtapa = async () => {
    if (!formE.nombre.trim() || !formE.codDepartamentoResponsable) {
      crearMensaje("warning", "El nombre y el ID de departamento son obligatorios");
      return;
    }
    if (!workflow) return;
    setCargando(true);
    try {
      const etapa = await WorkflowServicio.crearEtapa(workflow.codWorkflow, {
        nombre: formE.nombre.trim(),
        codDepartamentoResponsable: Number(formE.codDepartamentoResponsable),
        ...(formE.descripcion.trim() ? { descripcion: formE.descripcion.trim() } : {}),
        orden: etapas.length + 1,
      });
      setEtapas((prev) => [...prev, etapa]);
      setFormE(E0);
      crearMensaje("success", `Etapa "${etapa.nombre}" agregada`);
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setCargando(false);
    }
  };

  // ── Handlers Step 3 ──────────────────────────────────────────────────────────

  const getP = (id: number): FormPaso => formsP[id] ?? P0;
  const setP = (id: number, parcial: Partial<FormPaso>) =>
    setFormsP((prev) => ({ ...prev, [id]: { ...(prev[id] ?? P0), ...parcial } }));

  const handleAgregarPaso = async (etapa: EtapaCreada) => {
    if (!workflow) return;
    const form = getP(etapa.codEtapa);
    if (!form.codigo.trim() || !form.nombre.trim()) {
      crearMensaje("warning", "El código y el nombre del paso son obligatorios");
      return;
    }
    setCargando(true);
    try {
      const existentes = pasosPorEtapa[etapa.codEtapa] ?? [];
      const paso = await WorkflowServicio.crearPaso(workflow.codWorkflow, etapa.codEtapa, {
        codigo: form.codigo.trim(),
        nombre: form.nombre.trim(),
        ...(form.descripcion.trim() ? { descripcion: form.descripcion.trim() } : {}),
        canal: form.canal,
        slaDias: Number(form.slaDias) || 5,
        ordenVisual: existentes.length + 1,
        requiereDocumentos: form.requiereDocumentos,
        permiteSubsanacion: form.permiteSubsanacion,
        visibleCiudadano: form.visibleCiudadano,
        activo: true,
      });
      setPasosPorEtapa((prev) => ({
        ...prev,
        [etapa.codEtapa]: [...(prev[etapa.codEtapa] ?? []), paso],
      }));
      setP(etapa.codEtapa, P0);
      crearMensaje("success", `Paso "${paso.nombre}" agregado`);
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setCargando(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", py: 3 }}>
      <Typography variant="h5" fontWeight={800} mb={0.5}>Crear Workflow</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Configura el workflow en tres pasos: datos generales, etapas y pasos de cada etapa.
      </Typography>

      <Stepper activeStep={pasoActivo} sx={{ mb: 4 }}>
        {PASOS_STEPPER.map((label, i) => (
          <Step key={label} completed={pasoActivo > i}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* ── STEP 0: DATOS DEL WORKFLOW ─────────────────────────────────────── */}
      {pasoActivo === 0 && (
        <FormSeccion titulo="Datos generales" subtitulo="Información principal del workflow">
          <Stack spacing={2.5}>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "200px 1fr" }, gap: 2 }}>
              <CampoTexto
                label="Código *"
                value={formW.codigo}
                onChange={(e) => setFormW({ ...formW, codigo: e.target.value })}
                placeholder="RUTA-CONST-001"
                helperText="Identificador único"
                slotProps={{ htmlInput: { maxLength: 100 } }}
              />
              <CampoTexto
                label="Nombre *"
                value={formW.nombre}
                onChange={(e) => setFormW({ ...formW, nombre: e.target.value })}
                placeholder="Ruta de Construcción"
                slotProps={{ htmlInput: { maxLength: 150 } }}
              />
            </Box>

            <CampoTexto
              label="Descripción"
              multiline
              rows={3}
              value={formW.descripcion}
              onChange={(e) => setFormW({ ...formW, descripcion: e.target.value })}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
            />

            <CampoSwitch
              label="Workflow activo al crearse"
              checked={formW.activo}
              onChange={(v) => setFormW({ ...formW, activo: v })}
            />

            <Box display="flex" justifyContent="flex-end">
              <BotonPrincipal
                type="button"
                fullWidth={false}
                cargando={cargando}
                onClick={handleCrearWorkflow}
                sx={{ px: 4 }}
              >
                Crear Workflow
              </BotonPrincipal>
            </Box>
          </Stack>
        </FormSeccion>
      )}

      {/* ── STEP 1: ETAPAS ────────────────────────────────────────────────── */}
      {pasoActivo === 1 && workflow && (
        <Stack spacing={3}>
          <Alert icon={<CheckCircleIcon />} severity="success" sx={{ borderRadius: 2 }}>
            Workflow <strong>{workflow.nombre}</strong> (#{workflow.codWorkflow}) creado.
            Ahora agrega las etapas.
          </Alert>

          {etapas.length > 0 && (
            <FormSeccion>
              <Typography variant="subtitle2" color="text.secondary" mb={1}>
                Etapas agregadas ({etapas.length})
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {etapas.map((et) => (
                  <Chip key={et.codEtapa} label={`${et.orden}. ${et.nombre}`} color="primary" variant="outlined" size="small" />
                ))}
              </Box>
            </FormSeccion>
          )}

          <FormSeccion titulo="Agregar Etapa">
            <Stack spacing={2.5}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 220px" }, gap: 2 }}>
                <CampoTexto
                  label="Nombre de la etapa *"
                  value={formE.nombre}
                  onChange={(e) => setFormE({ ...formE, nombre: e.target.value })}
                  placeholder="Concepto de verificación de licencias"
                />
                <CampoTexto
                  label="ID Departamento Responsable *"
                  type="number"
                  value={formE.codDepartamentoResponsable}
                  onChange={(e) => setFormE({ ...formE, codDepartamentoResponsable: e.target.value })}
                  helperText="ID del departamento en el sistema"
                  slotProps={{ htmlInput: { min: 1 } }}
                />
              </Box>

              <CampoTexto
                label="Descripción"
                multiline
                rows={2}
                value={formE.descripcion}
                onChange={(e) => setFormE({ ...formE, descripcion: e.target.value })}
              />

              <Box>
                <Button variant="outlined" onClick={handleAgregarEtapa} disabled={cargando}>
                  + Agregar Etapa
                </Button>
              </Box>
            </Stack>
          </FormSeccion>

          <Box display="flex" justifyContent="space-between">
            <Button onClick={() => setPasoActivo(0)} disabled={cargando}>Atrás</Button>
            <BotonPrincipal
              type="button"
              fullWidth={false}
              disabled={etapas.length === 0 || cargando}
              onClick={() => setPasoActivo(2)}
              sx={{ px: 4 }}
            >
              Continuar — Agregar Pasos
            </BotonPrincipal>
          </Box>
        </Stack>
      )}

      {/* ── STEP 2: PASOS POR ETAPA ───────────────────────────────────────── */}
      {pasoActivo === 2 && workflow && (
        <Stack spacing={3}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Agrega los pasos a cada etapa. Cuando termines, presiona <strong>Finalizar</strong>.
          </Alert>

          {etapas.map((etapa) => {
            const pasosEtapa = pasosPorEtapa[etapa.codEtapa] ?? [];
            const formP = getP(etapa.codEtapa);

            return (
              <Accordion
                key={etapa.codEtapa}
                defaultExpanded
                elevation={2}
                sx={{ borderRadius: "12px !important", "&:before": { display: "none" } }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box>
                    <Typography fontWeight={700}>
                      Etapa {etapa.orden}: {etapa.nombre}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dpto. #{etapa.codDepartamentoResponsable} · {pasosEtapa.length} paso(s)
                    </Typography>
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ pt: 0 }}>
                  {pasosEtapa.length > 0 && (
                    <Box mb={2} display="flex" flexWrap="wrap" gap={1}>
                      {pasosEtapa.map((p) => (
                        <Chip
                          key={p.codPaso}
                          label={`${p.ordenVisual}. ${p.nombre} · ${p.canal}`}
                          size="small"
                          variant="outlined"
                          color="secondary"
                        />
                      ))}
                    </Box>
                  )}

                  <Divider sx={{ mb: 2.5 }} />
                  <Typography variant="subtitle2" fontWeight={700} mb={2}>Nuevo paso</Typography>

                  <Stack spacing={2.5}>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "180px 1fr" }, gap: 2 }}>
                      <CampoTexto
                        label="Código *"
                        size="small"
                        value={formP.codigo}
                        onChange={(e) => setP(etapa.codEtapa, { codigo: e.target.value })}
                        placeholder="PDT-PDFT-002"
                      />
                      <CampoTexto
                        label="Nombre *"
                        size="small"
                        value={formP.nombre}
                        onChange={(e) => setP(etapa.codEtapa, { nombre: e.target.value })}
                        placeholder="Diligenciamiento del formato PDT-PDFT-002"
                      />
                    </Box>

                    <CampoTexto
                      label="Descripción"
                      size="small"
                      multiline
                      rows={2}
                      value={formP.descripcion}
                      onChange={(e) => setP(etapa.codEtapa, { descripcion: e.target.value })}
                    />

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "180px 130px 1fr" }, gap: 2 }}>
                      <CampoTexto
                        label="Canal *"
                        size="small"
                        select
                        value={formP.canal}
                        onChange={(e) => setP(etapa.codEtapa, { canal: e.target.value as CanalPaso })}
                      >
                        <MenuItem value="VIRTUAL">Virtual</MenuItem>
                        <MenuItem value="PRESENCIAL">Presencial</MenuItem>
                        <MenuItem value="MIXTO">Mixto</MenuItem>
                      </CampoTexto>

                      <CampoTexto
                        label="SLA (días) *"
                        size="small"
                        type="number"
                        value={formP.slaDias}
                        onChange={(e) => setP(etapa.codEtapa, { slaDias: e.target.value })}
                        slotProps={{ htmlInput: { min: 1 } }}
                      />

                      <Box display="flex" flexDirection="column" gap={0.25}>
                        <CampoSwitch
                          label="Requiere documentos"
                          size="small"
                          checked={formP.requiereDocumentos}
                          onChange={(v) => setP(etapa.codEtapa, { requiereDocumentos: v })}
                        />
                        <CampoSwitch
                          label="Permite subsanación"
                          size="small"
                          checked={formP.permiteSubsanacion}
                          onChange={(v) => setP(etapa.codEtapa, { permiteSubsanacion: v })}
                        />
                        <CampoSwitch
                          label="Visible al ciudadano"
                          size="small"
                          checked={formP.visibleCiudadano}
                          onChange={(v) => setP(etapa.codEtapa, { visibleCiudadano: v })}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleAgregarPaso(etapa)}
                        disabled={cargando}
                      >
                        + Agregar Paso a esta Etapa
                      </Button>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}

          <Box display="flex" justifyContent="space-between" pt={1}>
            <Button onClick={() => setPasoActivo(1)} disabled={cargando}>Atrás</Button>
            <BotonPrincipal
              type="button"
              fullWidth={false}
              color="success"
              cargando={cargando}
              onClick={() => {
                crearMensaje("success", "Workflow configurado exitosamente");
                navigate("/dashboard/admin/workflows");
              }}
              sx={{ px: 4 }}
            >
              Finalizar
            </BotonPrincipal>
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default WorkflowCrear;
