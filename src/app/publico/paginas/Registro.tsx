import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Grid,
  alpha,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { AccesoServicio } from "../../servicios/publicos/AccesoServicio";
import { crearMensaje } from "../../utilidades/funciones/mensaje";
import { tokenHelper } from "../../utilidades/auth/tokenHelper";

type TipoPersona = "NATURAL" | "JURIDICA";

interface TokenPayload {
  sub: number;
  name: string;
  nombre_rol: string;
  cod_entidad: number | null;
  cod_departamento: number | null;
  exp?: number;
}

const SEXOS = [
  { value: 1, label: "Masculino" },
  { value: 2, label: "Femenino" },
];

const campoBase = {
  nombreUsuario: "",
  telefonoUsuario: "",
  correoUsuario: "",
  claveAcceso: "",
  confirmarClave: "",
};

const campoNatural = {
  cedula: "",
  fechaNacimientoUsuario: "",
  sexoBiologico: "",
  ciudadNacimientoId: "",
  barrioResidenciaId: "",
  direccionResidencia: "",
};

const campoJuridica = {
  razonSocial: "",
  nit: "",
  representanteLegal: "",
  tipoEmpresa: "",
};

const Registro = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [tipoPersona, setTipoPersona] = useState<TipoPersona>("NATURAL");
  const [enProceso, setEnProceso] = useState(false);

  const [base, setBase] = useState(campoBase);
  const [natural, setNatural] = useState(campoNatural);
  const [juridica, setJuridica] = useState(campoJuridica);

  const handleBase = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBase({ ...base, [e.target.name]: e.target.value });
  };
  const handleNatural = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNatural({ ...natural, [e.target.name]: e.target.value });
  };
  const handleJuridica = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJuridica({ ...juridica, [e.target.name]: e.target.value });
  };

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();

    if (base.claveAcceso !== base.confirmarClave) {
      crearMensaje("warning", "Las contraseñas no coinciden");
      return;
    }

    if (!passwordRegex.test(base.claveAcceso)) {
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
        payload.cedula = natural.cedula;
        payload.fechaNacimientoUsuario = natural.fechaNacimientoUsuario;
        payload.sexoBiologico = Number(natural.sexoBiologico);
        payload.ciudadNacimientoId = Number(natural.ciudadNacimientoId);
        payload.barrioResidenciaId = Number(natural.barrioResidenciaId);
        payload.direccionResidencia = natural.direccionResidencia;
      } else {
        payload.razonSocial = juridica.razonSocial;
        payload.nit = juridica.nit;
        payload.representanteLegal = juridica.representanteLegal;
        payload.tipoEmpresa = juridica.tipoEmpresa;
      }

      const respuesta = await AccesoServicio.registrarUsuario(payload);
      const token = respuesta?.token;

      if (!token) throw new Error("TOKEN_NOT_FOUND");

      const datosToken = jwtDecode<TokenPayload>(token);
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
        background:
          theme.palette.mode === "light"
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`
            : theme.palette.background.default,
      }}
    >
      <Paper
        elevation={8}
        sx={{ width: "100%", maxWidth: 640, p: { xs: 4, md: 5 }, borderRadius: 4 }}
      >
        <Typography variant="h4" fontWeight={800} mb={0.5}>
          Crear cuenta
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Regístrate para acceder a la Ventanilla Única de Construcción
        </Typography>

        {/* Selector tipo persona */}
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
            <TextField
              label="Nombre completo"
              name="nombreUsuario"
              value={base.nombreUsuario}
              onChange={handleBase}
              required
              fullWidth
            />
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Teléfono"
                  name="telefonoUsuario"
                  value={base.telefonoUsuario}
                  onChange={handleBase}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Correo electrónico"
                  name="correoUsuario"
                  type="email"
                  value={base.correoUsuario}
                  onChange={handleBase}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={6}>
                <TextField
                  label="Contraseña"
                  name="claveAcceso"
                  type="password"
                  value={base.claveAcceso}
                  onChange={handleBase}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={6}>
                <TextField
                  label="Confirmar contraseña"
                  name="confirmarClave"
                  type="password"
                  value={base.confirmarClave}
                  onChange={handleBase}
                  required
                  fullWidth
                />
              </Grid>
            </Grid>

            {/* Campos Persona Natural */}
            {tipoPersona === "NATURAL" && (
              <>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField
                      label="Cédula"
                      name="cedula"
                      value={natural.cedula}
                      onChange={handleNatural}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Fecha de nacimiento"
                      name="fechaNacimientoUsuario"
                      type="date"
                      value={natural.fechaNacimientoUsuario}
                      onChange={handleNatural}
                      required
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid size={4}>
                    <TextField
                      label="Sexo biológico"
                      name="sexoBiologico"
                      select
                      value={natural.sexoBiologico}
                      onChange={handleNatural}
                      required
                      fullWidth
                    >
                      {SEXOS.map((s) => (
                        <MenuItem key={s.value} value={s.value}>
                          {s.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid size={4}>
                    <TextField
                      label="ID Ciudad de nacimiento"
                      name="ciudadNacimientoId"
                      type="number"
                      value={natural.ciudadNacimientoId}
                      onChange={handleNatural}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid size={4}>
                    <TextField
                      label="ID Barrio de residencia"
                      name="barrioResidenciaId"
                      type="number"
                      value={natural.barrioResidenciaId}
                      onChange={handleNatural}
                      required
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <TextField
                  label="Dirección de residencia"
                  name="direccionResidencia"
                  value={natural.direccionResidencia}
                  onChange={handleNatural}
                  required
                  fullWidth
                />
              </>
            )}

            {/* Campos Persona Jurídica */}
            {tipoPersona === "JURIDICA" && (
              <>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField
                      label="Razón social"
                      name="razonSocial"
                      value={juridica.razonSocial}
                      onChange={handleJuridica}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="NIT"
                      name="nit"
                      value={juridica.nit}
                      onChange={handleJuridica}
                      required
                      fullWidth
                    />
                  </Grid>
                </Grid>
                <Grid container spacing={2}>
                  <Grid size={6}>
                    <TextField
                      label="Representante legal"
                      name="representanteLegal"
                      value={juridica.representanteLegal}
                      onChange={handleJuridica}
                      required
                      fullWidth
                    />
                  </Grid>
                  <Grid size={6}>
                    <TextField
                      label="Tipo de empresa"
                      name="tipoEmpresa"
                      value={juridica.tipoEmpresa}
                      onChange={handleJuridica}
                      required
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={enProceso}
              sx={{
                py: 1.8,
                borderRadius: 3,
                fontWeight: 800,
                fontSize: "1rem",
                textTransform: "none",
              }}
            >
              {enProceso ? <CircularProgress size={24} color="inherit" /> : "Crear cuenta"}
            </Button>

            <Button
              variant="text"
              onClick={() => navigate("/login")}
              sx={{ textTransform: "none", fontSize: "0.9rem" }}
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default Registro;
