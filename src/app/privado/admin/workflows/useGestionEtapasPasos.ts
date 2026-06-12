import { useEffect, useState } from "react";
import {
  WorkflowServicio,
  WorkflowCreado,
  EtapaCreada,
  PasoCreado,
  CanalPaso,
} from "../../../servicios/privados/WorkflowServicio";
import { DepartamentosServicio, Departamento } from "../../../servicios/privados/DepartamentosServicio";
import { EntidadesServicio, Entidad } from "../../../servicios/privados/EntidadesServicio";
import { UsuariosServicio, UsuarioResumen } from "../../../servicios/privados/UsuariosServicio";
import { ROLES_RESPONSABLES_ETAPA } from "../../../utilidades/dominios/roles";
import { crearMensaje } from "../../../utilidades/funciones/mensaje";

// ── Tipos de formulario locales ───────────────────────────────────────────────

export interface FormEtapa {
  nombre: string;
  codEntidadResponsable: string;
  codDepartamentoResponsable: string;
  codFuncionarioResponsable: string;
  descripcion: string;
}
export interface FormPaso {
  codigo: string; nombre: string; descripcion: string;
  canal: CanalPaso; slaDias: string;
  requiereDocumentos: boolean; permiteSubsanacion: boolean; visibleCiudadano: boolean;
}

export const E0: FormEtapa = {
  nombre: "",
  codEntidadResponsable: "",
  codDepartamentoResponsable: "",
  codFuncionarioResponsable: "",
  descripcion: "",
};
export const P0: FormPaso  = {
  codigo: "", nombre: "", descripcion: "", canal: "VIRTUAL", slaDias: "5",
  requiereDocumentos: false, permiteSubsanacion: true, visibleCiudadano: true,
};

// ── Mensajes de formularios sin guardar ──────────────────────────────────────
// Compartidos entre WorkflowCrear y WorkflowEditar (cada uno usa una acción
// distinta para el cierre de la frase: "continuar", "finalizar", "salir").

export const mensajeEtapaSinGuardar = (accion: string) =>
  `Tienes datos de una etapa sin guardar. Presiona "+ Agregar Etapa" para guardarla, o borra el formulario antes de ${accion}.`;

export const mensajePasoSinGuardar = (accion: string) =>
  `Tienes datos de un paso sin guardar. Presiona "+ Agregar Paso a esta Etapa" para guardarlo, o borra el formulario antes de ${accion}.`;

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
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [usuarios, setUsuarios] = useState<UsuarioResumen[]>([]);

  useEffect(() => {
    DepartamentosServicio.listar()
      .then((data) => setDepartamentos(data.filter((d) => d.estado)))
      .catch((e) => crearMensaje("error", (e as Error).message));

    EntidadesServicio.listar()
      .then((data) => setEntidades(data.filter((e) => e.estado)))
      .catch((e) => crearMensaje("error", (e as Error).message));

    UsuariosServicio.listar()
      .then((data) =>
        setUsuarios(
          data.filter((u) =>
            ROLES_RESPONSABLES_ETAPA.includes(u.nombre_rol as (typeof ROLES_RESPONSABLES_ETAPA)[number])
          )
        )
      )
      .catch((e) => crearMensaje("error", (e as Error).message));
  }, []);

  const nombreDepartamento = (codDepartamento: number) =>
    departamentos.find((d) => d.codDepartamento === codDepartamento)?.nombreDepartamento
    ?? `Dpto. #${codDepartamento}`;

  const departamentosPorEntidad = (codEntidad: number) =>
    departamentos.filter((d) => d.codEntidad === codEntidad);

  const funcionariosPorDepartamento = (codDepartamento: number) =>
    usuarios.filter((u) => u.cod_departamento === codDepartamento);

  const nombreFuncionario = (codUsuario: number) =>
    usuarios.find((u) => u.cod_usuario === codUsuario)?.nombre_usuario
    ?? `Usuario #${codUsuario}`;

  const handleAgregarEtapa = async () => {
    if (!formE.nombre.trim() || !formE.codEntidadResponsable || !formE.codDepartamentoResponsable) {
      crearMensaje("warning", "El nombre, la entidad y el departamento responsable son obligatorios");
      return;
    }
    if (!workflow) return;
    setCargando(true);
    try {
      const etapa = await WorkflowServicio.crearEtapa(workflow.codWorkflow, {
        nombre: formE.nombre.trim(),
        codEntidadResponsable: Number(formE.codEntidadResponsable),
        codDepartamentoResponsable: Number(formE.codDepartamentoResponsable),
        ...(formE.codFuncionarioResponsable
          ? { codFuncionarioResponsable: Number(formE.codFuncionarioResponsable) }
          : {}),
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

  // ── Detección de formularios con datos sin guardar ────────────────────────
  // "Continuar"/"Finalizar" no envían estos formularios al backend: solo los
  // botones "+ Agregar Etapa"/"+ Agregar Paso" lo hacen. Si el usuario escribió
  // algo y avanza sin presionarlos, esos datos se pierden silenciosamente.

  const hayEtapaSinGuardar = () =>
    formE.nombre.trim() !== "" ||
    formE.codEntidadResponsable !== "" ||
    formE.codDepartamentoResponsable !== "" ||
    formE.codFuncionarioResponsable !== "" ||
    formE.descripcion.trim() !== "";

  const hayPasoSinGuardar = () =>
    etapas.some((et) => {
      const f = formsP[et.codEtapa];
      return !!f && (f.codigo.trim() !== "" || f.nombre.trim() !== "" || f.descripcion.trim() !== "");
    });

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
    entidades,
    usuarios,
    nombreDepartamento,
    departamentosPorEntidad,
    funcionariosPorDepartamento,
    nombreFuncionario,
    handleAgregarEtapa,
    getP, setP,
    handleAgregarPaso,
    hayEtapaSinGuardar,
    hayPasoSinGuardar,
  };
}
