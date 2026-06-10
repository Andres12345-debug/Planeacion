import React, { useEffect, useState } from "react";
import { Alert, Box, Button, Chip, Skeleton, Stack, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import {
  WorkflowServicio,
  WorkflowCreado,
  EtapaCreada,
  PasoCreado,
} from "../../../servicios/privados/WorkflowServicio";
import { crearMensaje } from "../../../utilidades/funciones/mensaje";
import { FormSeccion } from "../../../compartido/ui/FormSeccion";
import { useGestionEtapasPasos } from "./useGestionEtapasPasos";
import { EtapasSeccion } from "./EtapasSeccion";
import { PasosPorEtapaSeccion } from "./PasosPorEtapaSeccion";

const WorkflowEditar: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [workflow, setWorkflow] = useState<WorkflowCreado | null>(null);
  const [cargandoWF, setCargandoWF] = useState(true);

  const {
    cargando, formE, setFormE, etapas, setEtapas, pasosPorEtapa, setPasosPorEtapa,
    departamentos, nombreDepartamento, handleAgregarEtapa, getP, setP, handleAgregarPaso,
  } = useGestionEtapasPasos(workflow);

  useEffect(() => {
    if (!id) return;
    WorkflowServicio.detalle(Number(id))
      .then((data) => {
        setWorkflow(data);

        const etapasOrdenadas = (data.etapas ?? []).slice().sort((a, b) => a.orden - b.orden);

        const etapasIniciales: EtapaCreada[] = etapasOrdenadas.map((et) => ({
          codEtapa: et.codEtapa,
          codWorkflow: data.codWorkflow,
          nombre: et.nombre,
          codDepartamentoResponsable: et.codDepartamentoResponsable,
          descripcion: et.descripcion,
          orden: et.orden,
        }));
        setEtapas(etapasIniciales);

        const pasosIniciales: Record<number, PasoCreado[]> = {};
        etapasOrdenadas.forEach((et) => {
          pasosIniciales[et.codEtapa] = (et.pasos ?? []).slice().sort((a, b) => a.ordenVisual - b.ordenVisual);
        });
        setPasosPorEtapa(pasosIniciales);
      })
      .catch((e) => crearMensaje("error", (e as Error).message))
      .finally(() => setCargandoWF(false));
  }, [id, setEtapas, setPasosPorEtapa]);

  if (cargandoWF) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", py: 3 }}>
        <Skeleton variant="text" width={320} height={40} />
        <Skeleton variant="rounded" height={120} sx={{ mt: 2 }} />
        <Skeleton variant="rounded" height={220} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (!workflow) {
    return (
      <Box sx={{ maxWidth: 900, mx: "auto", py: 3 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          No se encontró el workflow solicitado.
        </Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate("/dashboard/admin/workflows")}>
          Volver a la lista
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", py: 3 }}>
      <Typography variant="h5" fontWeight={800} mb={0.5}>
        Editar Workflow — {workflow.nombre}
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Código <strong>{workflow.codigo}</strong>{" "}
        <Chip
          label={workflow.activo ? "Activo" : "Inactivo"}
          size="small"
          color={workflow.activo ? "success" : "default"}
          variant="outlined"
          sx={{ ml: 1, fontWeight: 600, fontSize: "0.7rem" }}
        />
      </Typography>

      <Stack spacing={4}>
        <FormSeccion titulo="Etapas" subtitulo="Agrega más etapas a este workflow">
          <EtapasSeccion
            etapas={etapas}
            formE={formE}
            setFormE={setFormE}
            departamentos={departamentos}
            nombreDepartamento={nombreDepartamento}
            onAgregar={handleAgregarEtapa}
            cargando={cargando}
          />
        </FormSeccion>

        <FormSeccion titulo="Pasos por etapa" subtitulo="Agrega los pasos correspondientes a cada etapa">
          {etapas.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              Agrega al menos una etapa para poder configurar sus pasos.
            </Alert>
          ) : (
            <PasosPorEtapaSeccion
              etapas={etapas}
              pasosPorEtapa={pasosPorEtapa}
              getP={getP}
              setP={setP}
              nombreDepartamento={nombreDepartamento}
              onAgregarPaso={handleAgregarPaso}
              cargando={cargando}
            />
          )}
        </FormSeccion>

        <Box>
          <Button onClick={() => navigate("/dashboard/admin/workflows")}>
            Volver a la lista
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default WorkflowEditar;
