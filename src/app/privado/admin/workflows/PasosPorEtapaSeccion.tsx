import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { CanalPaso, EtapaCreada, PasoCreado } from "../../../servicios/privados/WorkflowServicio";
import { CampoTexto } from "../../../compartido/ui/CampoTexto";
import { CampoSwitch } from "../../../compartido/ui/CampoSwitch";
import { FormPaso } from "./useGestionEtapasPasos";

interface Props {
  etapas: EtapaCreada[];
  pasosPorEtapa: Record<number, PasoCreado[]>;
  getP: (codEtapa: number) => FormPaso;
  setP: (codEtapa: number, parcial: Partial<FormPaso>) => void;
  nombreDepartamento: (codDepartamento: number) => string;
  onAgregarPaso: (etapa: EtapaCreada) => void;
  cargando: boolean;
}

export const PasosPorEtapaSeccion: React.FC<Props> = ({
  etapas, pasosPorEtapa, getP, setP, nombreDepartamento, onAgregarPaso, cargando,
}) => (
  <Stack spacing={3}>
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
              <Typography variant="caption" color="text.secondary" display="block">
                {nombreDepartamento(etapa.codDepartamentoResponsable)} · {pasosEtapa.length} paso(s)
              </Typography>
              {etapa.entidadResponsable && (
                <Typography variant="caption" color="text.secondary" display="block">
                  {etapa.entidadResponsable.nombreEntidad}
                  {etapa.funcionariosDisponibles &&
                    ` · ${etapa.funcionariosDisponibles.length} funcionario(s) disponible(s)`}
                </Typography>
              )}
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
                  onClick={() => onAgregarPaso(etapa)}
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
  </Stack>
);
