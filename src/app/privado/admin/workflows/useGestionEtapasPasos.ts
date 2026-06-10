import { useEffect, useState } from "react";
import {
  WorkflowServicio,
  WorkflowCreado,
  EtapaCreada,
  PasoCreado,
  CanalPaso,
} from "../../../servicios/privados/WorkflowServicio";
import { DepartamentosServicio, Departamento } from "../../../servicios/privados/DepartamentosServicio";
import { crearMensaje } from "../../../utilidades/funciones/mensaje";

// ── Tipos de formulario locales ───────────────────────────────────────────────

export interface FormEtapa { nombre: string; codDepartamentoResponsable: string; descripcion: string }
export interface FormPaso {
  codigo: string; nombre: string; descripcion: string;
  canal: CanalPaso; slaDias: string;
  requiereDocumentos: boolean; permiteSubsanacion: boolean; visibleCiudadano: boolean;
}

export const E0: FormEtapa = { nombre: "", codDepartamentoResponsable: "", descripcion: "" };
export const P0: FormPaso  = {
  codigo: "", nombre: "", descripcion: "", canal: "VIRTUAL", slaDias: "5",
  requiereDocumentos: false, permiteSubsanacion: true, visibleCiudadano: true,
};

// ── Hook ──────────────────────────────────────────────────────────────────────
// Estado y handlers compartidos para gestionar etapas y sus pasos de un workflow,
// usado tanto en el asistente "Crear Workflow" como en "Editar Workflow".

export function useGestionEtapasPasos(workflow: WorkflowCreado | null) {
  const [cargando, setCargando] = useState(false);
  const [formE, setFormE] = useState<FormEtapa>(E0);
  const [etapas, setEtapas] = useState<EtapaCreada[]>([]);
  const [formsP, setFormsP] = useState<Record<number, FormPaso>>({});
  const [pasosPorEtapa, setPasosPorEtapa] = useState<Record<number, PasoCreado[]>>({});
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);

  useEffect(() => {
    DepartamentosServicio.listar()
      .then((data) => setDepartamentos(data.filter((d) => d.estado)))
      .catch((e) => crearMensaje("error", (e as Error).message));
  }, []);

  const nombreDepartamento = (codDepartamento: number) =>
    departamentos.find((d) => d.codDepartamento === codDepartamento)?.nombreDepartamento
    ?? `Dpto. #${codDepartamento}`;

  const handleAgregarEtapa = async () => {
    if (!formE.nombre.trim() || !formE.codDepartamentoResponsable) {
      crearMensaje("warning", "El nombre y el departamento responsable son obligatorios");
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
      const entidad = etapa.entidadResponsable?.nombreEntidad;
      crearMensaje("success", `Etapa "${etapa.nombre}" agregada${entidad ? ` · ${entidad}` : ""}`);
      if (etapa.funcionariosDisponibles && etapa.funcionariosDisponibles.length === 0) {
        crearMensaje("warning", "El departamento seleccionado aún no tiene supervisores ni funcionarios activos asignados");
      }
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setCargando(false);
    }
  };

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

  return {
    cargando,
    formE, setFormE,
    etapas, setEtapas,
    pasosPorEtapa, setPasosPorEtapa,
    departamentos,
    nombreDepartamento,
    handleAgregarEtapa,
    getP, setP,
    handleAgregarPaso,
  };
}
