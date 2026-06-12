import React, { useState } from "react";
import {
  Box,
  Stack,
  Button,
  MenuItem,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { AccesoServicio } from "../../servicios/publicos/AccesoServicio";
import { crearMensaje } from "../../utilidades/funciones/mensaje";
import { tokenHelper } from "../../utilidades/auth/tokenHelper";
import { decodeToken } from "../../utilidades/auth/usuarioToken";
import { FormCard } from "../../compartido/ui/FormCard";
import { CampoTexto } from "../../compartido/ui/CampoTexto";
import { BotonPrincipal } from "../../compartido/ui/BotonPrincipal";

type TipoPersona = "NATURAL" | "JURIDICA";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const SEXOS = [
  { value: 1, label: "Masculino" },
  { value: 2, label: "Femenino" },
];

const Registro = () => {
  const navigate = useNavigate();
  const [tipoPersona, setTipoPersona] = useState<TipoPersona>("NATURAL");
  const [enProceso, setEnProceso] = useState(false);

  const [base, setBase] = useState({
    nombreUsuario: "",
    telefonoUsuario: "",
    correoUsuario: "",
    claveAcceso: "",
    confirmarClave: "",
  });

  const [natural, setNatural] = useState({
    cedula: "",
    fechaNacimientoUsuario: "",
    sexoBiologico: "",
    ciudadNacimientoId: "",
    barrioResidenciaId: "",
    direccionResidencia: "",
  });

  const [juridica, setJuridica] = useState({
    razonSocial: "",
    nit: "",
    representanteLegal: "",
    tipoEmpresa: "",
  });

  const onChange =
    (setter: React.Dispatch<React.SetStateAction<any>>, estado: any) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setter({ ...estado, [e.target.name]: e.target.value });

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (base.claveAcceso !== base.confirmarClave) {
      crearMensaje("warning", "Las contraseñas no coinciden");
      return;
    }
    if (!PASSWORD_REGEX.test(base.claveAcceso)) {
      crearMensaje(
        "warning",
        "La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)"
      );
      return;
    }

    setEnProceso(true);
    try {
      const payload: Record<string, any> = {
        tipoPersona,
        nombreUsuario: base.nombreUsuario,
        telefonoUsuario: base.telefonoUsuario,
        correoUsuario: base.correoUsuario,
        claveAcceso: base.claveAcceso,
      };

      if (tipoPersona === "NATURAL") {
        Object.assign(payload, {
          cedula: natural.cedula,
          fechaNacimientoUsuario: natural.fechaNacimientoUsuario,
          sexoBiologico: Number(natural.sexoBiologico),
          ciudadNacimientoId: Number(natural.ciudadNacimientoId),
          barrioResidenciaId: Number(natural.barrioResidenciaId),
          direccionResidencia: natural.direccionResidencia,
        });
      } else {
        Object.assign(payload, juridica);
      }

      const respuesta = await AccesoServicio.registrarUsuario(payload);
      const token = respuesta?.token;
      if (!token) throw new Error("TOKEN_NOT_FOUND");
      const datosToken = decodeToken(token);
      if (!datosToken) throw new Error("TOKEN_INVALIDO");
      tokenHelper.set(token);
      crearMensaje("success", `¡Cuenta creada! Bienvenido, ${datosToken.name}`);
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      crearMensaje("error", error.message || "Error al registrar la cuenta");
    } finally {
      setEnProceso(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        py: 6,
        px: 2,
      }}
    >
      <FormCard
        titulo="Crear cuenta"
        subtitulo="Regístrate para acceder a la Ventanilla Única de Construcción"
        maxWidth={640}
      >
        <ToggleButtonGroup
          value={tipoPersona}
          exclusive
          onChange={(_, val) => val && setTipoPersona(val)}
          fullWidth
          sx={{ mb: 3 }}
        >
          <ToggleButton value="NATURAL" sx={{ fontWeight: 700 }}>
            Persona Natural
          </ToggleButton>
          <ToggleButton value="JURIDICA" sx={{ fontWeight: 700 }}>
            Persona Jurídica
          </ToggleButton>
        </ToggleButtonGroup>

        <Box component="form" onSubmit={enviar}>
          <Stack spacing={2.5}>
            {/* Campos comunes */}
            <CampoTexto
              label="Nombre completo"
              name="nombreUsuario"
              value={base.nombreUsuario}
              onChange={onChange(setBase, base)}
              required
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <CampoTexto
                  label="Teléfono"
                  name="telefonoUsuario"
                  value={base.telefonoUsuario}
                  onChange={onChange(setBase, base)}
                  required
                />
              </Grid>
              <Grid size={6}>
                <CampoTexto
                  label="Correo electrónico"
                  name="correoUsuario"
                  type="email"
                  value={base.correoUsuario}
                  onChange={onChange(setBase, base)}
                  required
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={6}>
                <CampoTexto
                  label="Contraseña"
                  name="claveAcceso"
                  type="password"
                  value={base.claveAcceso}
                  onChange={onChange(setBase, base)}
                  required
                />
              </Grid>
              <Grid size={6}>
                <CampoTexto
                  label="Confirmar contraseña"
                  name="confirmarClave"
                  type="password"
                  value={base.confirmarClave}
                  onChange={onChange(setBase, base)}
                  required
                />
              </Grid>
            </Grid>

            {/* Persona Natural */}
            {tipoPersona === "NATURAL" && (
              <>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <CampoTexto
                      label="Cédula"
                      name="cedula"
                      value={natural.cedula}
                      onChange={onChange(setNatural, natural)}
                      required
                    />
                  </Grid>
                  <Grid size={6}>
                    <CampoTexto
                      label="Fecha de nacimiento"
                      name="fechaNacimientoUsuario"
                      type="date"
                      value={natural.fechaNacimientoUsuario}
                      onChange={onChange(setNatural, natural)}
                      required
                      slotProps={{ inputLabel: { shrink: true } }}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid size={4}>
                    <CampoTexto
                      label="Sexo biológico"
                      name="sexoBiologico"
                      select
                      value={natural.sexoBiologico}
                      onChange={onChange(setNatural, natural)}
                      required
                    >
                      {SEXOS.map((s) => (
                        <MenuItem key={s.value} value={s.value}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </CampoTexto>
                  </Grid>
                  <Grid size={4}>
                    <CampoTexto
                      label="ID Ciudad nacimiento"
                      name="ciudadNacimientoId"
                      type="number"
                      value={natural.ciudadNacimientoId}
                      onChange={onChange(setNatural, natural)}
                      required
                    />
                  </Grid>
                  <Grid size={4}>
                    <CampoTexto
                      label="ID Barrio residencia"
                      name="barrioResidenciaId"
                      type="number"
                      value={natural.barrioResidenciaId}
                      onChange={onChange(setNatural, natural)}
                      required
                    />
                  </Grid>
                </Grid>
                <CampoTexto
                  label="Dirección de residencia"
                  name="direccionResidencia"
                  value={natural.direccionResidencia}
                  onChange={onChange(setNatural, natural)}
                  required
                />
              </>
            )}

            {/* Persona Jurídica */}
            {tipoPersona === "JURIDICA" && (
              <>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <CampoTexto
                      label="Razón social"
                      name="razonSocial"
                      value={juridica.razonSocial}
                      onChange={onChange(setJuridica, juridica)}
                      required
                    />
                  </Grid>
                  <Grid size={6}>
                    <CampoTexto
                      label="NIT"
                      name="nit"
                      value={juridica.nit}
                      onChange={onChange(setJuridica, juridica)}
                      required
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <CampoTexto
                      label="Representante legal"
                      name="representanteLegal"
                      value={juridica.representanteLegal}
                      onChange={onChange(setJuridica, juridica)}
                      required
                    />
                  </Grid>
                  <Grid size={6}>
                    <CampoTexto
                      label="Tipo de empresa"
                      name="tipoEmpresa"
                      value={juridica.tipoEmpresa}
                      onChange={onChange(setJuridica, juridica)}
                      required
                    />
                  </Grid>
                </Grid>
              </>
            )}

            <BotonPrincipal cargando={enProceso}>Crear cuenta</BotonPrincipal>

            <Button
              variant="text"
              onClick={() => navigate("/login")}
              sx={{ textTransform: "none", fontSize: "0.9rem" }}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Button>
          </Stack>
        </Box>
      </FormCard>
    </Box>
  );
};

export default Registro;
