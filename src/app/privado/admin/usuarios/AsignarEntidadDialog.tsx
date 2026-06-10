import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Stack,
  MenuItem,
  Button,
} from "@mui/material";

import {
  UsuariosServicio,
  UsuarioResumen,
} from "../../../servicios/privados/UsuariosServicio";
import { EntidadesServicio, Entidad } from "../../../servicios/privados/EntidadesServicio";
import { DepartamentosServicio, Departamento } from "../../../servicios/privados/DepartamentosServicio";
import { crearMensaje } from "../../../utilidades/funciones/mensaje";
import { CampoTexto } from "../../../compartido/ui/CampoTexto";
import { BotonPrincipal } from "../../../compartido/ui/BotonPrincipal";

// ── Constantes ────────────────────────────────────────────────────────────────

const ROLES_ASIGNABLES = [
  { value: 2, label: "Supervisor" },
  { value: 3, label: "Funcionario" },
  { value: 5, label: "Visitante" },
];

interface AsignarEntidadDialogProps {
  open: boolean;
  usuario: UsuarioResumen | null;
  onClose: () => void;
  onAsignado: (codUsuario: number, datos: { nombre_entidad: string; cargo: string; nombre_rol: string }) => void;
}

const FORM_INICIAL = {
  codEntidad: "",
  codDepartamento: "",
  cargo: "",
  codRol: "3",
};

// ── Componente ────────────────────────────────────────────────────────────────

const AsignarEntidadDialog: React.FC<AsignarEntidadDialogProps> = ({
  open,
  usuario,
  onClose,
  onAsignado,
}) => {
  const [form, setForm] = useState(FORM_INICIAL);
  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [cargandoListas, setCargandoListas] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // ── Carga perezosa de entidades/departamentos al abrir ──────────────────────

  useEffect(() => {
    if (!open) return;
    setForm(FORM_INICIAL);
    setCargandoListas(true);
    Promise.all([EntidadesServicio.listar(), DepartamentosServicio.listar()])
      .then(([entidadesRes, departamentosRes]) => {
        setEntidades(entidadesRes);
        setDepartamentos(departamentosRes);
      })
      .catch((e) => crearMensaje("error", (e as Error).message))
      .finally(() => setCargandoListas(false));
  }, [open]);

  const departamentosEntidad = useMemo(
    () => departamentos.filter((d) => d.codEntidad === Number(form.codEntidad)),
    [departamentos, form.codEntidad]
  );

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "codEntidad" ? { codDepartamento: "" } : {}),
    }));
  };

  // ── Confirmar ─────────────────────────────────────────────────────────────────

  const confirmar = async () => {
    if (!usuario) return;
    if (!form.codEntidad || !form.codDepartamento || !form.cargo.trim()) {
      crearMensaje("warning", "Completa entidad, departamento y cargo");
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await UsuariosServicio.asignarEntidad(usuario.cod_usuario, {
        codEntidad: Number(form.codEntidad),
        codDepartamento: Number(form.codDepartamento),
        cargo: form.cargo.trim(),
        codRol: Number(form.codRol) as 2 | 3 | 5,
      });

      crearMensaje(
        "success",
        `${respuesta.mensaje}. El usuario debe volver a iniciar sesión para que los cambios apliquen.`
      );

      onAsignado(usuario.cod_usuario, {
        nombre_entidad: respuesta.usuario.vinculoCreado?.entidad ?? "",
        cargo: respuesta.usuario.vinculoCreado?.cargo ?? form.cargo.trim(),
        nombre_rol: respuesta.usuario.rolActual,
      });
      onClose();
    } catch (e) {
      crearMensaje("error", (e as Error).message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !enviando && onClose()}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography fontWeight={800}>Asignar entidad</Typography>
        <Typography variant="body2" color="text.secondary">
          {usuario?.nombre_usuario}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          <CampoTexto
            label="Entidad"
            name="codEntidad"
            select
            value={form.codEntidad}
            onChange={onChange}
            disabled={cargandoListas}
            required
          >
            {entidades.map((ent) => (
              <MenuItem key={ent.codEntidad} value={ent.codEntidad}>
                {ent.nombreEntidad}
              </MenuItem>
            ))}
          </CampoTexto>

          <CampoTexto
            label="Departamento"
            name="codDepartamento"
            select
            value={form.codDepartamento}
            onChange={onChange}
            disabled={cargandoListas || !form.codEntidad}
            helperText={!form.codEntidad ? "Selecciona primero una entidad" : undefined}
            required
          >
            {departamentosEntidad.map((dep) => (
              <MenuItem key={dep.codDepartamento} value={dep.codDepartamento}>
                {dep.nombreDepartamento}
              </MenuItem>
            ))}
          </CampoTexto>

          <CampoTexto
            label="Cargo"
            name="cargo"
            value={form.cargo}
            onChange={onChange}
            placeholder="Funcionario de Ventanilla"
            required
          />

          <CampoTexto
            label="Rol"
            name="codRol"
            select
            value={form.codRol}
            onChange={onChange}
            required
          >
            {ROLES_ASIGNABLES.map((r) => (
              <MenuItem key={r.value} value={r.value}>
                {r.label}
              </MenuItem>
            ))}
          </CampoTexto>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={enviando}>
          Cancelar
        </Button>
        <BotonPrincipal
          type="button"
          fullWidth={false}
          cargando={enviando}
          onClick={confirmar}
          sx={{ px: 3 }}
        >
          Asignar
        </BotonPrincipal>
      </DialogActions>
    </Dialog>
  );
};

export default AsignarEntidadDialog;
