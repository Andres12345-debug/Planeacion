# Guía de implementación — Gestión de trámites (Funcionario / Supervisor / Admin / Visitante)

> Fecha: 2026-06-10
> Origen: [`GUIA_WORKFLOW_POSTMAN.md`](./GUIA_WORKFLOW_POSTMAN.md) — Fase 5 (revisar/aprobar/devolver), Fase 7 (asignar funcionario), Fase 8 (consultas), tabla de acciones y reglas de acceso.
> Continúa: [`GUIA_CAMBIOS_WORKFLOW_FRONTEND.md`](./GUIA_CAMBIOS_WORKFLOW_FRONTEND.md) (flujo del ciudadano, ya implementado).

Objetivo: cerrar el ciclo del workflow para los roles internos. El ciudadano ya puede iniciar trámites, subir documentos y subsanar (ver guía anterior). Falta la otra mitad: que **funcionario/supervisor** revisen, aprueben o devuelvan los pasos, que **supervisor/admin** asignen un funcionario responsable a un paso, y que **visitante** pueda hacer seguimiento de solo lectura.

---

## 1. Resumen de la pantalla a construir

Una sola pantalla **"Gestión de trámites"**, montada en dos rutas (mismo componente):

| Ruta | Roles | Particularidad |
|------|-------|----------------|
| `/dashboard/tramites` | `funcionario`, `supervisor`, `visitante` | Lista filtrada por el backend a la entidad+departamento del usuario (`GET /tramites/todos`) |
| `/dashboard/admin/tramites` | `admin` | Misma vista, el backend devuelve **todos** los trámites del sistema |

El backend ya hace todo el filtrado por rol/entidad/departamento (ver "Reglas de acceso por rol" en `GUIA_WORKFLOW_POSTMAN.md`), así que el frontend no necesita lógica adicional de visibilidad — solo **gating de botones de acción** según rol + estado del paso.

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Gestión de trámites                    [Filtro: Estado ▾]    │
├─────────────────────────────────────────────────────────────┤
│ ▸ TRM-1748995300000 — Ruta de Construcción      [EN_PROCESO] │
│   Carlos Soto · Alcaldía Mayor de Tunja · 33%                │
│   ▾ (expandido)                                               │
│     1. Diligenciamiento PDT-PDFT-002   [APROBADO]            │
│        📄 PDT-PDFT-002.pdf  [Descargar]                       │
│     2. Verificación técnica de planos  [PENDIENTE] hab.✅     │
│        [Iniciar revisión]  [Asignar funcionario] (sup/admin) │
│     3. Concepto de norma urbanística   [PENDIENTE] hab.❌     │
├─────────────────────────────────────────────────────────────┤
│ ▸ TRM-1748995412345 — Ruta de Construcción      [EN_PROCESO] │
└─────────────────────────────────────────────────────────────┘
```

Reutiliza el patrón de `DashboardCiudadano.tsx`: `Accordion` por trámite, `expandirTramite()` perezoso vía `TramitesServicio.detalle(id)`, render de pasos con `Chip` de estado y acciones contextuales.

---

## 2. Endpoints — qué falta en el frontend

Todo lo que sigue ya existe en el backend (`GUIA_WORKFLOW_POSTMAN.md` Fase 5/7/8). Lo que falta es exponerlo desde `urls.tsx` / servicios:

| Endpoint | Servicio actual | Falta |
|---|---|---|
| `POST /tramites/:id/pasos/:pasoId/iniciar` | — | ❌ `URLS.PASO_INICIAR` + `PasosServicio.iniciarRevision` |
| `POST /tramites/:id/pasos/:pasoId/aprobar` | `PasosServicio.aprobar` ✅ | ya existe |
| `POST /tramites/:id/pasos/:pasoId/devolver` | `PasosServicio.devolver` ✅ | ya existe |
| `POST /tramites/:id/pasos/:pasoId/asignar` | `PasosServicio.asignarFuncionario` ✅ | ya existe |
| `GET /tramites/:id/pasos/:pasoId/documentos/:docId/descargar` | — | ❌ `URLS.DOCS_DESCARGAR` + `DocumentosServicio.descargar` (blob, requiere `Authorization` header → no se puede usar `<a href>` directo) |
| `GET /usuarios/todos` | — | ❌ `UsuariosServicio.listar` — necesario para que supervisor/admin elijan `codFuncionarioAsignado` en el diálogo "Asignar funcionario" |
| `GET /tramites/todos` | `TramitesServicio.listar` ✅ | la respuesta trae `usuarioCreador` y `entidadAsignada` (Fase 8.1) — agregar al tipo `TramiteResumen` para mostrarlos en la lista |

---

## 3. Matriz de acciones por rol (resumen de la guía Postman)

| Acción | Botón visible para | Precondición del paso | Diálogo |
|---|---|---|---|
| Iniciar revisión | `funcionario`, `supervisor`, `admin` | `habilitado: true` y `estado` ∈ {`PENDIENTE`, `REENVIADO`} | Observación opcional |
| Aprobar | `funcionario`, `supervisor`, `admin` | `estado === "EN_REVISION"` | Observación opcional |
| Devolver | `funcionario`, `supervisor`, `admin` | `estado === "EN_REVISION"` | Observación **obligatoria** (mín. 3 caracteres — es lo que ve el ciudadano para subsanar) |
| Asignar funcionario | `supervisor`, `admin` | `estado !== "APROBADO"` (no tiene sentido reasignar un paso ya cerrado) | Selector de funcionario (de `GET /usuarios/todos`, filtrando `nombre_rol === "funcionario"`) |
| Descargar documento | todos (incluye `visitante`) | el paso tiene documentos | — (descarga directa) |
| Ver detalle / timeline | todos | — | — |

> El backend valida igual "Nivel 1" (¿ve el trámite?) y "Nivel 2" (¿puede actuar sobre el paso, mismo departamento?) — si el frontend muestra un botón que el backend rechaza con 403, el `crearMensaje("error", ...)` mostrará el mensaje real (`"Tu departamento (X) no es responsable de este paso..."`). No hace falta replicar la validación de departamento en el frontend porque el JWT no expone qué pasos son de qué departamento hasta que se carga el detalle — pero si aparece, es informativo, no un bug.

`visitante` no ve **ningún** botón de acción (solo lectura + descarga), igual que en la tabla de acciones de la guía.

---

## 4. Estados de cada paso → color/label (reutilizar `ESTADO_PASO` de `DashboardCiudadano.tsx`)

Mismo `Record<EstadoPaso, {label, color}>` ya corregido en la guía anterior. Recordar:
- `habilitado` es un booleano independiente — **no** una variante de `estado`.
- `RECHAZADO`/`CERRADO` no deberían aparecer en datos reales (ver auditoría), pero el `Record` los cubre por si el enum cambia.

---

## 5. Plan de implementación

1. **`urls.tsx`**: agregar `PASO_INICIAR(tId, pId)`, `DOCS_DESCARGAR(tId, pId, docId)`, `USUARIOS_TODOS`.
2. **`PasosServicio.ts`**: agregar `iniciarRevision(tramiteId, pasoId, observacion?)`.
3. **`DocumentosServicio.ts`**: agregar `descargar(tramiteId, pasoId, docId, nombreSugerido)` — hace `fetch` manual con el header `Authorization` (porque `ApiServicio.peticion` siempre llama a `.json()`), arma un `Blob`, crea un `<a>` temporal con `URL.createObjectURL` y dispara la descarga.
4. **`UsuariosServicio.ts`** (nuevo): `listar()` → `GET /privado/usuarios/todos`, tipo `UsuarioResumen { cod_usuario, nombre_usuario, nombre_rol, nombre_entidad, cargo }`.
5. **`TramitesServicio.ts`**: extender `TramiteResumen` con `usuarioCreador?: { nombreUsuario: string }` y `entidadAsignada?: { nombreEntidad: string }`.
6. **`src/app/privado/funcionario/DashboardGestionTramites.tsx`** (nuevo componente):
   - Lee el rol del JWT (`funcionario` | `supervisor` | `admin` | `visitante`) para gatear botones.
   - Carga `TramitesServicio.listar({ estado? })` con un `<Select>` de filtro por estado.
   - Acordeón expandible → `TramitesServicio.detalle(id)` perezoso (igual que `DashboardCiudadano`).
   - Por cada paso: `Chip` de estado, lista de documentos con botón "Descargar", y botones de acción según la matriz de la sección 3, cada uno abre un `Dialog` con `CampoTexto` para la observación (excepto descargar).
   - Diálogo "Asignar funcionario": `cargarFuncionarios()` con `UsuariosServicio.listar()` (lazy, al abrir el diálogo), `<CampoTexto select>` para elegir `codFuncionarioAsignado`.
   - Tras cada acción: refrescar `TramitesServicio.detalle(id)` para reflejar el nuevo `estado`/`habilitado` (mismo patrón que `confirmarReenviar` en `DashboardCiudadano`).
7. **`RuteoPrincipal.tsx`**:
   - `<Route element={<GuardiaRol rolesPermitidos={["funcionario","supervisor","visitante"]} />}><Route path="/dashboard/tramites" element={<DashboardGestionTramites />} /></Route>`
   - `<Route element={<GuardiaRol rolesPermitidos={["admin"]} />}>` ya existe para `/dashboard/admin/workflows*` — agregar `<Route path="/dashboard/admin/tramites" element={<DashboardGestionTramites />} />` dentro del mismo bloque.
8. Verificar `npx tsc --noEmit`.

---

## 6. Plan de pruebas manuales (QA)

Usar los 5 usuarios de ejemplo de `GUIA_WORKFLOW_POSTMAN.md` (Juan = supervisor, Laura = funcionaria, Carlos = ciudadano, Ana = visitante, admin).

1. **Funcionario (Laura)** → `/dashboard/tramites`:
   - Ve el trámite de Carlos (mismo departamento Planeación).
   - Paso 1 `APROBADO` → sin botones, documento descargable.
   - Paso 2 `PENDIENTE` + `habilitado: true` → botón "Iniciar revisión" → pasa a `EN_REVISION`.
   - Tras iniciar → aparecen "Aprobar"/"Devolver". Probar "Devolver" con observación → paso pasa a `DEVUELTO`, el ciudadano lo ve en su dashboard con botón "Subsanar".
   - Probar "Aprobar" en otro paso → `APROBADO`, `habilitado: false`, progreso del trámite sube.
2. **Supervisor (Juan)** → mismo flujo + botón "Asignar funcionario" en un paso `PENDIENTE` → seleccionar Laura → confirmar → `codFuncionarioAsignado` queda fijo; si otro funcionario del mismo departamento intenta actuar, debe recibir 403 ("Este paso está asignado a otro funcionario").
3. **Admin** → `/dashboard/admin/tramites`: ve trámites de todas las entidades/departamentos, mismas acciones que supervisor.
4. **Visitante (Ana)** → `/dashboard/tramites`: ve los trámites de su entidad, **sin ningún botón de acción**, puede descargar documentos.
5. Verificar que un funcionario de otro departamento (si existe en los datos de prueba) **no ve** el trámite en su lista (filtrado por backend).

---

## 7. No incluido en este alcance

- CRUD de "Asignaciones" (`/dashboard/asignaciones`) y "Usuarios" (`/dashboard/admin/usuarios`, `/dashboard/supervisor/usuarios/crear`) — están en el menú del Sidebar pero apuntan a rutas no implementadas (caen en la página de error 404 actual `/dashboard/*`). Es un gap preexistente, fuera del alcance "workflow/trámites" de esta guía.
- Acción "Rechazar paso" / "Cerrar paso" — no implementadas en backend (ver `AUDITORIA_WORKFLOW_TRAMITES.md` hallazgo #4), no se agregan botones para ellas.
- `/dashboard/tramites/nuevo` (iniciar trámite) para `ciudadano` vía Sidebar — ya cubierto dentro de `DashboardCiudadano.tsx` (diálogo "Iniciar trámite"), no requiere ruta nueva en este alcance.
