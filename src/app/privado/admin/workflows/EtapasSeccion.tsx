import React from "react";
import { Box, Button, Chip, MenuItem, Stack, Tooltip, Typography } from "@mui/material";

import { EtapaCreada } from "../../../servicios/privados/WorkflowServicio";
import { Departamento } from "../../../servicios/privados/DepartamentosServicio";
import { Entidad } from "../../../servicios/privados/EntidadesServicio";
import { UsuarioResumen } from "../../../servicios/privados/UsuariosServicio";
import { FormSeccion } from "../../../compartido/ui/FormSeccion";
import { CampoTexto } from "../../../compartido/ui/CampoTexto";
import { FormEtapa } from "./useGestionEtapasPasos";

interface Props {
  etapas: EtapaCreada[];
  formE: FormEtapa;
  setFormE: (formE: FormEtapa) => void;
  entidades: Entidad[];
  nombreDepartamento: (codDepartamento: number) => string;
  departamentosPorEntidad: (codEntidad: number) => Departamento[];
  funcionariosPorDepartamento: (codDepartamento: number) => UsuarioResumen[];
  nombreFuncionario: (codUsuario: number) => string;
  onAgregar: () => void;
  cargando: boolean;
}

export const EtapasSeccion: React.FC<Props> = ({
  etapas, formE, setFormE, entidades, nombreDepartamento,
  departamentosPorEntidad, funcionariosPorDepartamento, nombreFuncionario,
  onAgregar, cargando,
}) => {
  const codEntidad = formE.codEntidadResponsable ? Number(formE.codEntidadResponsable) : null;
  const codDepartamento = formE.codDepartamentoResponsable ? Number(formE.codDepartamentoResponsable) : null;

  const departamentosDisponibles = codEntidad !== null ? departamentosPorEntidad(codEntidad) : [];
  const funcionariosDisponibles = codDepartamento !== null ? funcionariosPorDepartamento(codDepartamento) : [];

  return (
    <Stack spacing={3}>
      {etapas.length > 0 && (
        <FormSeccion>
          <Typography variant="subtitle2" color="text.secondary" mb={1}>
            Etapas agregadas ({etapas.length})
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {etapas.map((et) => {
              const partes = [
                nombreDepartamento(et.codDepartamentoResponsable),
                et.entidadResponsable?.nombreEntidad,
                et.codFuncionarioResponsable ? nombreFuncionario(et.codFuncionarioResponsable) : undefined,
              ].filter(Boolean);
              return (
                <Tooltip key={et.codEtapa} title={partes.join(" · ")} arrow>
                  <Chip label={`${et.orden}. ${et.nombre}`} color="primary" variant="outlined" size="small" />
                </Tooltip>
              );
            })}
          </Box>
        </FormSeccion>
      )}

      <FormSeccion titulo="Agregar Etapa">
        <Stack spacing={2.5}>
          <CampoTexto
            label="Nombre de la etapa *"
            value={formE.nombre}
            onChange={(e) => setFormE({ ...formE, nombre: e.target.value })}
            placeholder="Concepto de verificación de licencias"
          />

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
            <CampoTexto
              label="Entidad Responsable *"
              select
              value={formE.codEntidadResponsable}
              onChange={(e) =>
                setFormE({
                  ...formE,
                  codEntidadResponsable: e.target.value,
                  codDepartamentoResponsable: "",
                  codFuncionarioResponsable: "",
                })
              }
              helperText="Entidad a cargo de esta etapa"
            >
              <MenuItem value="" disabled>Selecciona una entidad</MenuItem>
              {entidades.map((ent) => (
                <MenuItem key={ent.codEntidad} value={String(ent.codEntidad)}>
                  {ent.nombreEntidad}
                </MenuItem>
              ))}
            </CampoTexto>

            <CampoTexto
              label="Departamento Responsable *"
              select
              value={formE.codDepartamentoResponsable}
              onChange={(e) =>
                setFormE({
                  ...formE,
                  codDepartamentoResponsable: e.target.value,
                  codFuncionarioResponsable: "",
                })
              }
              disabled={codEntidad === null}
              helperText="Departamento que atenderá los pasos de esta etapa"
            >
              <MenuItem value="" disabled>Selecciona un departamento</MenuItem>
              {departamentosDisponibles.map((d) => (
                <MenuItem key={d.codDepartamento} value={String(d.codDepartamento)}>
                  {d.nombreDepartamento}
                </MenuItem>
              ))}
            </CampoTexto>

            <CampoTexto
              label="Funcionario Responsable"
              select
              value={formE.codFuncionarioResponsable}
              onChange={(e) => setFormE({ ...formE, codFuncionarioResponsable: e.target.value })}
              disabled={codDepartamento === null}
              helperText="Opcional: encargado de los pasos de esta etapa"
            >
              <MenuItem value="">Sin asignar</MenuItem>
              {funcionariosDisponibles.map((u) => (
                <MenuItem key={u.cod_usuario} value={String(u.cod_usuario)}>
                  {u.nombre_usuario}
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
};
