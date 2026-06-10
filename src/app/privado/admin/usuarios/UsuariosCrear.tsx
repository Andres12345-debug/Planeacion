import React, { useEffect, useMemo, useState } from "react";
import { Box, Stack, Typography, MenuItem, Grid } from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import { useNavigate } from "react-router-dom";

import { UsuariosServicio } from "../../../servicios/privados/UsuariosServicio";
import { EntidadesServicio, Entidad } from "../../../servicios/privados/EntidadesServicio";
import { DepartamentosServicio, Departamento } from "../../../servicios/privados/DepartamentosServicio";
import { crearMensaje } from "../../../utilidades/funciones/mensaje";
import { FormSeccion } from "../../../compartido/ui/FormSeccion";
import { CampoTexto } from "../../../compartido/ui/CampoTexto";
import { BotonPrincipal } from "../../../compartido/ui/BotonPrincipal";

// ── Constantes ────────────────────────────────────────────────────────────────

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const SEXOS = [
  { value: 1, label: "Masculino" },
  { value: 2, label: "Femenino" },
];

const ROLES = [
  { value: 1, label: "Administrador" },
  { value: 2, label: "Supervisor" },
  { value: 3, label: "Funcionario" },
  { value: 5, label: "Visitante" },
];

const FORM_INICIAL = {
  nombreUsuario: "",
  correoUsuario: "",
  telefonoUsuario: "",
  cedula: "",
  fechaNacimientoUsuario: "",
  sexoBiologico: "",
  claveAcceso: "",
  confirmarClave: "",
  codRol: "3",
  codEntidad: "",
  codDepartamento: "",
  cargo: "",
};

// ── Componente ────────────────────────────────────────────────────────────────

const UsuariosCrear: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(FORM_INICIAL);
  const [enProceso, setEnProceso] = useState(false);

  const [entidades, setEntidades] = useState<Entidad[]>([]);
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [cargandoListas, setCargandoListas] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [entidadesRes, departamentosRes] = await Promise.all([
          EntidadesServicio.listar(),
          DepartamentosServicio.listar(),
        ]);
        setEntidades(entidadesRes);
        setDepartamentos(departamentosRes);
      } catch (e) {
        crearMensaje("error", (e as Error).message);
      } finally {
        setCargandoListas(false);
      }
    };
    cargar();
  }, []);

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

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.claveAcceso !== form.confirmarClave) {
      crearMensaje("warning", "Las contraseñas no coinciden");
      return;
    }
    if (!PASSWORD_REGEX.test(form.claveAcceso)) {
      crearMensaje(
        "warning",
        "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)"
      );
      return;
    }
    if (!form.codEntidad) {
      crearMensaje("warning", "Selecciona la entidad del usuario");
      return;
    }

    setEnProceso(true);
    try {
      await UsuariosServicio.crear({
        codRol: Number(form.codRol),
        nombreUsuario: form.nombreUsuario,
        fechaNacimientoUsuario: form.fechaNacimientoUsuario,
        telefonoUsuario: form.telefonoUsuario,
        sexoBiologico: Number(form.sexoBiologico),
        cedula: form.cedula,
        correoUsuario: form.correoUsuario,
        claveAcceso: form.claveAcceso,
        codEntidad: Number(form.codEntidad),
        ...(form.codDepartamento ? { codDepartamento: Number(form.codDepartamento) } : {}),
        cargo: form.cargo,
      });
      crearMensaje("success", `Usuario "${form.nombreUsuario}" creado correctamente`);
      navigate("/dashboard/admin/usuarios");
    } catch (error: any) {
      crearMensaje("error", error.message || "Error al crear el usuario");
    } finally {
      setEnProceso(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", py: 3 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={3}>
        <PersonAddAlt1Icon color="primary" />
        <Box>
          <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
            Agregar usuario
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crea un usuario vinculado a una entidad para gestionar trámites
          </Typography>
        </Box>
      </Box>

      <Box component="form" onSubmit={enviar}>
        <Stack spacing={3}>
          <FormSeccion titulo="Datos personales" subtitulo="Información básica del usuario">
            <Stack spacing={2.5}>
              <CampoTexto
                label="Nombre completo"
                name="nombreUsuario"
                value={form.nombreUsuario}
                onChange={onChange}
                required
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CampoTexto
                    label="Correo electrónico"
                    name="correoUsuario"
                    type="email"
                    value={form.correoUsuario}
                    onChange={onChange}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CampoTexto
                    label="Teléfono"
                    name="telefonoUsuario"
                    value={form.telefonoUsuario}
                    onChange={onChange}
                    required
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CampoTexto
                    label="Cédula"
                    name="cedula"
                    value={form.cedula}
                    onChange={onChange}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CampoTexto
                    label="Fecha de nacimiento"
                    name="fechaNacimientoUsuario"
                    type="date"
                    value={form.fechaNacimientoUsuario}
                    onChange={onChange}
                    required
                    slotProps={{ inputLabel: { shrink: true } }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CampoTexto
                    label="Sexo biológico"
                    name="sexoBiologico"
                    select
                    value={form.sexoBiologico}
                    onChange={onChange}
                    required
                  >
                    {SEXOS.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </CampoTexto>
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CampoTexto
                    label="Contraseña"
                    name="claveAcceso"
                    type="password"
                    value={form.claveAcceso}
                    onChange={onChange}
                    required
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CampoTexto
                    label="Confirmar contraseña"
                    name="confirmarClave"
                    type="password"
                    value={form.confirmarClave}
                    onChange={onChange}
                    required
                  />
                </Grid>
              </Grid>
            </Stack>
          </FormSeccion>

          <FormSeccion titulo="Vinculación laboral" subtitulo="Rol, entidad y cargo del usuario">
            <Stack spacing={2.5}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CampoTexto
                    label="Rol"
                    name="codRol"
                    select
                    value={form.codRol}
                    onChange={onChange}
                    required
                  >
                    {ROLES.map((r) => (
                      <MenuItem key={r.value} value={r.value}>
                        {r.label}
                      </MenuItem>
                    ))}
                  </CampoTexto>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CampoTexto
                    label="Entidad"
                    name="codEntidad"
                    select
                    value={form.codEntidad}
                    onChange={onChange}
                    required
                    disabled={cargandoListas}
                  >
                    {entidades.map((ent) => (
                      <MenuItem key={ent.codEntidad} value={ent.codEntidad}>
                        {ent.nombreEntidad}
                      </MenuItem>
                    ))}
                  </CampoTexto>
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <CampoTexto
                    label="Departamento"
                    name="codDepartamento"
                    select
                    value={form.codDepartamento}
                    onChange={onChange}
                    disabled={cargandoListas || !form.codEntidad}
                    helperText={!form.codEntidad ? "Selecciona primero una entidad" : "Opcional"}
                  >
                    <MenuItem value="">Sin departamento</MenuItem>
                    {departamentosEntidad.map((dep) => (
                      <MenuItem key={dep.codDepartamento} value={dep.codDepartamento}>
                        {dep.nombreDepartamento}
                      </MenuItem>
                    ))}
                  </CampoTexto>
                </Grid>
              </Grid>

              <CampoTexto
                label="Cargo"
                name="cargo"
                value={form.cargo}
                onChange={onChange}
                placeholder="Funcionario de Ventanilla"
                required
              />
            </Stack>
          </FormSeccion>

          <BotonPrincipal cargando={enProceso}>Crear usuario</BotonPrincipal>
        </Stack>
      </Box>
    </Box>
  );
};

export default UsuariosCrear;
