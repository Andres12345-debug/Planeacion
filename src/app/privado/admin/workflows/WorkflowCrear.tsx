import React, { useState } from "react";
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Alert,
  Stack,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate } from "react-router-dom";

import { WorkflowServicio, WorkflowCreado } from "../../../servicios/privados/WorkflowServicio";
import { crearMensaje } from "../../../utilidades/funciones/mensaje";
import { FormSeccion } from "../../../compartido/ui/FormSeccion";
import { CampoTexto } from "../../../compartido/ui/CampoTexto";
import { CampoSwitch } from "../../../compartido/ui/CampoSwitch";
import { BotonPrincipal } from "../../../compartido/ui/BotonPrincipal";
import { useGestionEtapasPasos } from "./useGestionEtapasPasos";
import { EtapasSeccion } from "./EtapasSeccion";
import { PasosPorEtapaSeccion } from "./PasosPorEtapaSeccion";

// ── Tipos de formulario locales ───────────────────────────────────────────────

interface FormWorkflow { codigo: string; nombre: string; descripcion: string; activo: boolean }

const W0: FormWorkflow = { codigo: "", nombre: "", descripcion: "", activo: true };

const PASOS_STEPPER = ["Datos del Workflow", "Etapas", "Pasos por etapa"];

// ── Componente ────────────────────────────────────────────────────────────────

const WorkflowCrear: React.FC = () => {
  const navigate = useNavigate();
  const [pasoActivo, setPasoActivo] = useState(0);
  const [cargandoWF, setCargandoWF] = useState(false);

  const [formW, setFormW] = useState<FormWorkflow>(W0);
  const [workflow, setWF]   = useState<WorkflowCreado | null>(null);

  const {
    cargando, formE, setFormE, etapas, pasosPorEtapa, departamentos,
    nombreDepartamento, handleAgregarEtapa, getP, setP, handleAgregarPaso,
  } = useGestionEtapasPasos(workflow);

  // ── Handlers Step 1 ──────────────────────────────────────────────────────────

  const handleCrearWorkflow = async () => {
    if (!formW.codigo.trim() || !formW.nombre.trim()) {
      crearMensaje("warning", "El código y el nombre son obligatorios");
      return;
    }
    setCargandoWF(true);
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
      setCargandoWF(false);
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
                cargando={cargandoWF}
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

          <EtapasSeccion
            etapas={etapas}
            formE={formE}
            setFormE={setFormE}
            departamentos={departamentos}
            nombreDepartamento={nombreDepartamento}
            onAgregar={handleAgregarEtapa}
            cargando={cargando}
          />

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

          <PasosPorEtapaSeccion
            etapas={etapas}
            pasosPorEtapa={pasosPorEtapa}
            getP={getP}
            setP={setP}
            nombreDepartamento={nombreDepartamento}
            onAgregarPaso={handleAgregarPaso}
            cargando={cargando}
          />

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
