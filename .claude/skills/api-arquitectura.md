# Skill: Arquitectura frontend — VentanillaUnica

Usa este skill cuando el usuario pida crear o modificar servicios, endpoints, llamadas a la API, componentes de formulario, o cualquier pieza de UI del proyecto.

---

## Sistema de diseño — componentes reutilizables de UI

Todos los formularios y secciones de formulario DEBEN usar estos componentes. **Nunca usar `TextField`, `Paper`, `Switch` o `Button` crudos de MUI dentro de un formulario.**

### Componentes disponibles en `src/app/compartido/ui/`

| Componente | Archivo | Cuándo usarlo |
|---|---|---|
| `FormCard` | `FormCard.tsx` | Card principal de una página de formulario (login, registro, recuperar contraseña). Muestra título `h4` + subtítulo. Tiene `maxWidth` y `elevation={8}`. |
| `FormSeccion` | `FormSeccion.tsx` | Sección interna de un formulario complejo (wizard, multi-paso, acordeón). Título `h6`, `elevation={2}`. Sin `maxWidth`. |
| `CampoTexto` | `CampoTexto.tsx` | Todos los inputs: texto, email, number, date, password (con ojo), select, multiline. Es un `TextField` con estilo consistente. |
| `CampoSwitch` | `CampoSwitch.tsx` | Todos los toggles booleanos (activo, requiereDocumentos, visible, etc.). |
| `BotonPrincipal` | `BotonPrincipal.tsx` | Botón primario de acción. Maneja estado `cargando` (muestra spinner). Por defecto `type="submit"` y `fullWidth`. |
| `CardSistema` | `CardSistema.tsx` | Cards de contenido (listados, resultados). No es un contenedor de formulario. |

### Reglas de uso

```
FormCard       → página de formulario standalone (1 form por página, centrado)
FormSeccion    → sección dentro de un form complejo o multi-paso
CampoTexto     → cualquier input (text, number, date, email, password, select, multiline)
CampoSwitch    → cualquier toggle boolean
BotonPrincipal → acción principal (submit, crear, continuar)
Button MUI     → acciones secundarias de navegación únicamente (Atrás, Volver, enlaces)
```

### Patrones de uso

**FormCard — formulario de página completa:**
```tsx
<FormCard titulo="Ingresar" subtitulo="Bienvenido de nuevo" maxWidth={520}>
  <Box component="form" onSubmit={handleSubmit}>
    <Stack spacing={2.5}>
      <CampoTexto label="Correo" name="username" type="email" value={...} onChange={...} icono={<UserIcon />} />
      <CampoTexto label="Contraseña" name="claveAcceso" type="password" value={...} onChange={...} />
      <BotonPrincipal cargando={enProceso}>Entrar</BotonPrincipal>
    </Stack>
  </Box>
</FormCard>
```

**FormSeccion — sección dentro de un wizard o form complejo:**
```tsx
<FormSeccion titulo="Datos generales" subtitulo="Información principal">
  <Stack spacing={2.5}>
    <CampoTexto label="Nombre *" value={...} onChange={...} />
    <CampoTexto label="Descripción" multiline rows={3} value={...} onChange={...} />
    <CampoSwitch label="Activo" checked={...} onChange={(v) => ...} />
    <Box display="flex" justifyContent="flex-end">
      <BotonPrincipal type="button" fullWidth={false} onClick={handleAccion} sx={{ px: 4 }}>
        Guardar
      </BotonPrincipal>
    </Box>
  </Stack>
</FormSeccion>
```

**CampoTexto como select:**
```tsx
<CampoTexto label="Canal *" select value={canal} onChange={(e) => setCanal(e.target.value)}>
  <MenuItem value="VIRTUAL">Virtual</MenuItem>
  <MenuItem value="PRESENCIAL">Presencial</MenuItem>
  <MenuItem value="MIXTO">Mixto</MenuItem>
</CampoTexto>
```

**CampoTexto — limitaciones de caracteres (MUI v7):**
```tsx
// ✅ Correcto en MUI v7
<CampoTexto label="Código" slotProps={{ htmlInput: { maxLength: 100, min: 1 } }} />

// ❌ Deprecado — no usar
<CampoTexto label="Código" inputProps={{ maxLength: 100 }} />
```

**CampoSwitch con size small (dentro de acordeones o secciones densas):**
```tsx
<CampoSwitch label="Requiere documentos" size="small" checked={...} onChange={(v) => ...} />
```

**BotonPrincipal para acciones que no son submit:**
```tsx
// type="button" evita submit del form; fullWidth={false} para botón de ancho natural
<BotonPrincipal type="button" fullWidth={false} cargando={cargando} onClick={handleCrear} sx={{ px: 4 }}>
  Crear Workflow
</BotonPrincipal>
```

### Checklist al crear un formulario nuevo

1. ¿Usa `FormCard` (si es página standalone) o `FormSeccion` (si es sección interna)?
2. ¿Todos los inputs usan `CampoTexto`? (incluyendo selects y multiline)
3. ¿Todos los toggles usan `CampoSwitch`?
4. ¿El botón principal usa `BotonPrincipal`?
5. ¿Se usa `slotProps={{ htmlInput: { ... } }}` en lugar del deprecado `inputProps`?
6. ¿Los `Button` de MUI solo se usan para acciones secundarias de navegación?

---

## Guards de seguridad — rutas protegidas

### Dos guards en `src/app/seguridad/`

| Guard | Archivo | Qué protege |
|---|---|---|
| `<Vigilante>` | `Vigilate.tsx` | Token existe + no expirado. Sin token → `/login`. Aplica a **todo** `/dashboard/*`. |
| `<GuardiaRol>` | `GuardiaRol.tsx` | `nombre_rol` del JWT está en `rolesPermitidos`. Rol no permitido → `/dashboard`. Solo dentro de `<Vigilante>`. |

### Patrón en `RuteoPrincipal.tsx`

```tsx
// Ruta accesible por cualquier usuario autenticado
<Route element={<Vigilante><DashboardLayout /></Vigilante>}>
  <Route path="/dashboard" element={<Dashboard />} />

  {/* Rutas solo para admin */}
  <Route element={<GuardiaRol rolesPermitidos={["admin"]} />}>
    <Route path="/dashboard/admin/workflows" element={<WorkflowLista />} />
    <Route path="/dashboard/admin/workflows/crear" element={<WorkflowCrear />} />
  </Route>

  {/* Rutas para admin + supervisor */}
  <Route element={<GuardiaRol rolesPermitidos={["admin", "supervisor"]} />}>
    <Route path="/dashboard/asignaciones" element={<Asignaciones />} />
  </Route>

  <Route path="/dashboard/*" element={<Error />} />
</Route>
```

### Regla clave

> **Toda ruta nueva bajo `/dashboard/admin/`** debe ir dentro de `<GuardiaRol rolesPermitidos={["admin"]} />`.
> El Sidebar ya oculta los ítems en la UI — `GuardiaRol` cierra el acceso por URL directa.
> El backend sigue siendo la fuente real de seguridad (guards `@Roles`).

---

## Capas de la arquitectura

```
src/app/
├── utilidades/dominios/urls.tsx          ← Todas las constantes de URL
├── servicios/
│   ├── publicos/AccesoServicio.ts        ← Endpoints SIN token (auth pública)
│   └── privados/                         ← Endpoints CON token (crear aquí)
│       ├── WorkflowServicio.ts           ✅ EXISTE — CRUD workflows, etapas, pasos
│       ├── TramitesServicio.ts           ✅ EXISTE — listar, detalle, iniciar, timeline
│       ├── PasosServicio.ts              ✅ EXISTE — subsanar, reenviar, aprobar, devolver, asignar
│       └── DocumentosServicio.ts         ✅ EXISTE — subir (FormData), listar
├── privado/
│   ├── TableroPrincipal.tsx              ← Dispatcher por rol (lazy DashboardCiudadano)
│   ├── Profile.tsx                       ← Perfil genérico (admin/supervisor/funcionario)
│   └── ciudadano/
│       └── DashboardCiudadano.tsx        ✅ EXISTE — dashboard completo del ciudadano
└── seguridad/
    ├── Vigilate.tsx                      ← Guard token (todo /dashboard/*)
    └── GuardiaRol.tsx                    ✅ EXISTE — Guard por rol (ver sección Guards)
```

**Regla clave:** público → `AccesoServicio`, privado → un servicio en `privados/` que llama a `ApiServicio`.

---

## Patrón: agregar una URL nueva

En `utilidades/dominios/urls.tsx`:

```ts
export const URLS = {
  URL_BASE: "http://localhost:3550",

  // públicos
  INICIAR_SESION: "/publico/auth/login",
  REGISTRO: "/publico/registros/user",
  RECUPERAR_PASSWORD: "/publico/registros/recuperar-password",
  NUEVA_PASSWORD: "/publico/registros/nueva-password",
  CAMBIAR_PASSWORD: "/publico/registros/cambiar-password",

  // privados — usuarios
  AGREGAR_USUARIO: "/privado/usuarios/agregar",
  ASIGNAR_ENTIDAD: (id: number) => `/privado/usuarios/asignar-entidad/${id}`,

  // privados — workflows
  WORKFLOWS: "/privado/workflows",
  WORKFLOW: (id: number) => `/privado/workflows/${id}`,
  ETAPAS: (wId: number) => `/privado/workflows/${wId}/etapas`,
  PASOS: (wId: number, eId: number) => `/privado/workflows/${wId}/etapas/${eId}/pasos`,

  // privados — trámites
  INICIAR_TRAMITE: (workflowId: number) => `/privado/tramites/iniciar/${workflowId}`,
  TRAMITES: "/privado/tramites/todos",
  TRAMITE_DETALLE: (id: number) => `/privado/tramites/${id}/detalle`,
  TRAMITE_TIMELINE: (id: number) => `/privado/tramites/${id}/timeline`,

  // privados — pasos de trámite
  PASO_INICIAR: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/iniciar`,
  PASO_APROBAR: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/aprobar`,
  PASO_DEVOLVER: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/devolver`,
  PASO_SUBSANAR: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/subsanar`,
  PASO_REENVIAR: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/reenviar`,
  PASO_ASIGNAR: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/asignar`,

  // privados — documentos
  DOCS_SUBIR: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/documentos/subir`,
  DOCS_LISTAR: (tId: number, pId: number) => `/privado/tramites/${tId}/pasos/${pId}/documentos`,
  DOC_DESCARGAR: (tId: number, pId: number, dId: number) =>
    `/privado/tramites/${tId}/pasos/${pId}/documentos/${dId}/descargar`,
  DOC_ELIMINAR: (tId: number, pId: number, dId: number) =>
    `/privado/tramites/${tId}/pasos/${pId}/documentos/${dId}`,
};
```

> Las URL con parámetros dinámicos van como funciones `(id: number) => string`, nunca como strings con template literal en el servicio.

---

## Patrón: servicio privado

```ts
// src/app/servicios/privados/TramitesServicio.ts
import { ApiServicio } from "../reutilizables/ApiServicio";
import { URLS } from "../../utilidades/dominios/urls";

// ── Tipos de respuesta ────────────────────────────────────────────────────────

export interface TramiteResumen {
  codTramite: number;
  codigoExpediente: string;
  tipoTramite: string;
  estado: EstadoTramite;
  progreso: number;
  fechaCreacion: string;
}

export interface PaginadoTramites {
  data: TramiteResumen[];
  total: number;
  page: number;
  limit: number;
}

export type EstadoTramite = "EN_PROCESO" | "COMPLETADO" | "ANULADO" | "CANCELADO";
export type EstadoPaso =
  | "PENDIENTE" | "HABILITADO" | "EN_REVISION"
  | "APROBADO" | "DEVUELTO" | "EN_SUBSANACION"
  | "REENVIADO" | "CERRADO";

// ── Métodos ───────────────────────────────────────────────────────────────────

export const TramitesServicio = {
  listar: (filtros?: { estado?: EstadoTramite; codEntidadAsignada?: number }) => {
    const params = filtros
      ? "?" + new URLSearchParams(filtros as Record<string, string>).toString()
      : "";
    return ApiServicio.get<PaginadoTramites>(URLS.TRAMITES + params);
  },

  detalle: (id: number) =>
    ApiServicio.get<TramiteDetalle>(URLS.TRAMITE_DETALLE(id)),

  iniciar: (workflowId: number, body: { codEntidadAsignada: number; observacionInicial?: string }) =>
    ApiServicio.post<TramiteIniciado>(URLS.INICIAR_TRAMITE(workflowId), body),

  timeline: (id: number) =>
    ApiServicio.get<EventoTimeline[]>(URLS.TRAMITE_TIMELINE(id)),
};
```

---

## Patrón: acciones sobre pasos

```ts
// src/app/servicios/privados/PasosServicio.ts
import { ApiServicio } from "../reutilizables/ApiServicio";
import { URLS } from "../../utilidades/dominios/urls";

export const PasosServicio = {
  iniciarRevision: (tId: number, pId: number, observacion: string) =>
    ApiServicio.post(URLS.PASO_INICIAR(tId, pId), { observacion }),

  aprobar: (tId: number, pId: number, observacion: string) =>
    ApiServicio.post(URLS.PASO_APROBAR(tId, pId), { observacion }),

  devolver: (tId: number, pId: number, observacion: string) =>
    ApiServicio.post(URLS.PASO_DEVOLVER(tId, pId), { observacion }),

  subsanar: (tId: number, pId: number, observacion: string) =>
    ApiServicio.post(URLS.PASO_SUBSANAR(tId, pId), { observacion }),

  reenviar: (tId: number, pId: number, observacion: string) =>
    ApiServicio.post(URLS.PASO_REENVIAR(tId, pId), { observacion }),

  asignarFuncionario: (tId: number, pId: number, codFuncionarioAsignado: number) =>
    ApiServicio.post(URLS.PASO_ASIGNAR(tId, pId), { codFuncionarioAsignado }),
};
```

---

## Patrón: subida de archivos (FormData)

`ApiServicio.post` acepta `FormData` automáticamente (omite `Content-Type` para que el browser lo ponga con el boundary correcto):

```ts
// En el componente o en DocumentosServicio
const subirDocumento = async (tId: number, pId: number, archivo: File, descripcion: string) => {
  const form = new FormData();
  form.append("file", archivo);
  form.append("descripcion", descripcion);
  return ApiServicio.post(URLS.DOCS_SUBIR(tId, pId), form);
};
```

---

## Patrón: endpoint público nuevo

Solo agregar si el endpoint NO requiere token (prefijo `/publico/`):

```ts
// En AccesoServicio.ts
cambiarPassword: (body: { claveActual: string; nuevaClave: string }) =>
  peticionPublica<{ mensaje: string }>("PATCH", URLS.CAMBIAR_PASSWORD, body),
```

> Aunque `PATCH /publico/registros/cambiar-password` requiere JWT en el header, sigue siendo un endpoint `/publico/`. Usa `AccesoServicio` con el header inyectado manualmente, o mejor — muévelo a un servicio privado usando `ApiServicio.patch`.

---

## JWT payload — campos disponibles en toda ruta privada

```ts
// src/app/modelos/JwtPayload.ts  (crear si no existe)
export interface JwtPayload {
  jti: string;
  sub: number;           // cod_usuario
  name: string;
  nombre_rol: "admin" | "supervisor" | "funcionario" | "ciudadano" | "visitante";
  cod_entidad: number | null;
  cod_departamento: number | null;
  iat: number;
  exp: number;
}
```

Leer el payload: `jwtDecode<JwtPayload>(tokenHelper.get()!)`.

---

## Dashboard ciudadano — DashboardCiudadano.tsx

Archivo: `src/app/privado/ciudadano/DashboardCiudadano.tsx`

Muestra dos secciones en paralelo al cargar:

| Sección | Endpoint | Descripción |
|---|---|---|
| Mis trámites activos | `GET /privado/tramites/todos` | Lista con estado, progreso, codigoExpediente |
| Detalle de pasos (lazy) | `GET /privado/tramites/{id}/detalle` | Se carga al expandir el Accordion del trámite |
| Iniciar trámite | `GET /privado/workflows?activo=true` | ⚠️ Requiere fix en backend (ver abajo) |

### Acciones disponibles desde el dashboard

| Estado del paso | Acción visible | Llamada |
|---|---|---|
| `DEVUELTO` | Botón "Subsanar" → Dialog con CampoTexto | `POST .../pasos/{id}/subsanar` |
| `PENDIENTE` + `habilitado` + `requiereDocumentos` | Botón "Subir doc." → file picker | `POST .../pasos/{id}/documentos/subir` (FormData) |

### ⚠️ GAP de backend pendiente

`GET /privado/workflows` tiene `@Roles('admin', 'supervisor', 'funcionario')`. Para que el ciudadano pueda ver la sección "Iniciar trámite", agregar `'ciudadano'` al decorator en `workflows.controller.ts:37`.

### Dispatcher por rol en TableroPrincipal

```ts
// TableroPrincipal.tsx — despacha por nombre_rol del JWT
if (rol === "ciudadano") → <DashboardCiudadano />
else                     → <ProfileSection />     // admin/supervisor/funcionario/visitante
```

---

## Reglas de acceso por rol (resumen para guards / UI condicional)

| Acción | Roles permitidos |
|---|---|
| Crear workflow/etapa/paso | `admin` |
| Asignar funcionario a paso | `admin`, `supervisor` (mismo dpto.) |
| Iniciar revisión / Aprobar / Devolver | `admin`, `supervisor`, `funcionario` (mismo dpto.) |
| Subir / eliminar documento | `admin`, `supervisor`, `funcionario`, `ciudadano` (propio) |
| Subsanar / Reenviar | `ciudadano` (solo creador) |
| Ver trámites | todos (filtrado por rol en backend) |
| Visitante | solo lectura (`GET`) |

> El backend aplica todos los guards. En el frontend usa el rol del JWT solo para mostrar/ocultar UI — nunca para controlar acceso real.

---

## Manejo de errores

`ApiServicio` lanza `Error` con el `message` del backend. En el componente:

```ts
try {
  await TramitesServicio.iniciar(workflowId, body);
  crearMensaje("success", "Trámite iniciado");
} catch (e) {
  crearMensaje("error", (e as Error).message);
}
```

Siempre usar `crearMensaje()` de `utilidades/funciones/mensaje.tsx`, nunca `toast` directamente.

---

## Errores HTTP conocidos

| Código | Significado en este sistema |
|---|---|
| 400 | DTO inválido — mostrar `e.message` |
| 401 | Token expirado → `tokenHelper.remove()` + redirect `/login` |
| 403 | Sin permiso — mostrar mensaje, no redirigir |
| 404 | Recurso no existe — mostrar mensaje |
| 406 | Duplicado en registro (correo/cédula/NIT) |
| 409 | Conflicto de unicidad en operación admin |
| 429 | Rate limit login — pedir esperar 15 min |

---

## Checklist al crear un servicio nuevo

1. ¿Las URLs están en `urls.tsx`? (con funciones para params dinámicos)
2. ¿Los tipos de respuesta están definidos junto al servicio?
3. ¿El servicio usa `ApiServicio` (privado) o `AccesoServicio` (público)?
4. ¿El componente usa `crearMensaje()` para feedback?
5. ¿Se manejan los casos 401 (redirect) y otros (mensaje)?
