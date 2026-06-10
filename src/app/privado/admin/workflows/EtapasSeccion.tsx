import React from "react";
import { Box, Button, Chip, MenuItem, Stack, Tooltip, Typography } from "@mui/material";

import { EtapaCreada } from "../../../servicios/privados/WorkflowServicio";
import { Departamento } from "../../../servicios/privados/DepartamentosServicio";
import { FormSeccion } from "../../../compartido/ui/FormSeccion";
import { CampoTexto } from "../../../compartido/ui/CampoTexto";
import { FormEtapa } from "./useGestionEtapasPasos";

interface Props {
  etapas: EtapaCreada[];
  formE: FormEtapa;
  setFormE: (formE: FormEtapa) => void;
  departamentos: Departamento[];
  nombreDepartamento: (codDepartamento: number) => string;
  onAgregar: () => void;
  cargando: boolean;
}

export const EtapasSeccion: React.FC<Props> = ({
  etapas, formE, setFormE, departamentos, nombreDepartamento, onAgregar, cargando,
}) => (
  <Stack spacing={3}>
    {etapas.length > 0 && (
      <FormSeccion>
        <Typography variant="subtitle2" color="text.secondary" mb={1}>
          Etapas agregadas ({etapas.length})
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {etapas.map((et) => (
            <Tooltip
              key={et.codEtapa}
              title={`${nombreDepartamento(et.codDepartamentoResponsable)}${et.entidadResponsable ? ` · ${et.entidadResponsable.nombreEntidad}` : ""}`}
              arrow
            >
              <Chip label={`${et.orden}. ${et.nombre}`} color="primary" variant="outlined" size="small" />
            </Tooltip>
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
            label="Departamento Responsable *"
            select
            value={formE.codDepartamentoResponsable}
            onChange={(e) => setFormE({ ...formE, codDepartamentoResponsable: e.target.value })}
            helperText="Departamento que atenderá los pasos de esta etapa"
          >
            <MenuItem value="" disabled>Selecciona un departamento</MenuItem>
            {departamentos.map((d) => (
              <MenuItem key={d.codDepartamento} value={String(d.codDepartamento)}>
                {d.nombreDepartamento}
              </MenuItem>
            ))}
          </CampoTexto>
        </Box>

        <CampoTexto
          label="Descripción"
          multiline
          rows={2}
          value={formE.descripcion}
          onChange={(e) => setFormE({ ...formE, descripcion: e.target.value })}
        />

        <Box>
          <Button variant="outlined" onClick={onAgregar} disabled={cargando}>
            + Agregar Etapa
          </Button>
        </Box>
      </Stack>
    </FormSeccion>
  </Stack>
);
