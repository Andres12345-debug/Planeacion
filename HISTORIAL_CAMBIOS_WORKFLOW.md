# Historial de cambios — Workflow / Trámites (Frontend)

> Consolida y reemplaza: `GUIA_CAMBIOS_WORKFLOW_FRONTEND.md`, `GUIA_VERIFICACION_ETAPAS_PASOS.md`, `GUIA_GESTION_TRAMITES_FUNCIONARIO.md`, `GUIA_ASIGNAR_ENTIDAD_USUARIO.md` (todas fechadas 2026-06-10, fusionadas el 2026-06-10).
> Para el estado actual y los próximos pasos, ver [`GUIA_INICIO_CODIFICACION.md`](./GUIA_INICIO_CODIFICACION.md). Para el script de pruebas E2E, ver [`GUIA_WORKFLOW_POSTMAN.md`](./GUIA_WORKFLOW_POSTMAN.md).

Este documento es un registro histórico de **por qué** el código quedó como está. No describe el estado pendiente — eso vive en la guía de inicio.

---

## 1. Catálogos para `ciudadano`/`visitante` (Workflows + Entidades)

**Problema:** sin forma de consultar qué tipos de trámite existen ni ante qué entidad radicarlos, `ciudadano` no podía iniciar un trámite.

**Cambios:**
- Backend: `GET /privado/workflows`, `GET /privado/workflows/:id`, `GET /privado/entidades/todos`, `GET /privado/entidades/:id` se habilitaron también para `ciudadano`/`visitante` (antes solo `admin`/`supervisor`/`funcionario`).
- Backend: `filtro-workflow.dto.ts` — `@IsBoolean()` rechazaba el query-param `activo=true/false` (string) porque `ValidationPipe` no tiene `enableImplicitConversion`. Se agregó `@Transform` para convertir `"true"/"false"` a boolean antes de validar. Esto arregló un `400 Bad Request` en `GET /privado/workflows?activo=true`.
- Frontend: nuevo `EntidadesServicio` (`src/app/servicios/privados/EntidadesServicio.ts`) con `listar()`/`detalle(id)`, y nuevas URLs `ENTIDADES_TODOS`/`ENTIDAD(id)` en `urls.tsx`.
- Frontend: `WorkflowCreado` ahora incluye `etapas?: EtapaResumen[]` y `pasos?: PasoResumen[]` para previsualizar los pasos del workflow antes de iniciar el trámite.

---

## 2. `DashboardCiudadano.tsx` — flujo completo "Iniciar trámite"

- `cargarEntidades()` se ejecuta junto con `cargarTramites()`/`cargarWorkflows()` al montar.
- El diálogo "Iniciar trámite" muestra un preview de los pasos visibles para el ciudadano (`visibleCiudadano !== false`, ordenados por `ordenVisual`, indicando cuáles requieren documento) y un selector de **Entidad** (`codEntidadAsignada`) precargado con `usuario.cod_entidad` si existe.
- `confirmarIniciar` envía `codEntidadAsignada: Number(entidadSeleccionada)` y bloquea el botón si no hay entidad seleccionada.

---

## 3. Ciclo subsanar → adjuntar → reenviar

- Nuevo diálogo "Reenviar paso" + `confirmarReenviar()`, que llama a `PasosServicio.reenviar(tramiteId, pasoId, observacion)` y refresca el detalle del trámite.
- El botón **Reenviar** aparece cuando `paso.estado === "EN_SUBSANACION"`.
- `handleArchivoSeleccionado` refresca `detalles[tramiteId]` tras subir un documento, para que la lista de documentos del paso se vea actualizada sin recargar la página.
- `PasoDetalle.documentos` (en `TramitesServicio.ts`) y el render de cada paso muestran la lista de documentos cargados (`DescriptionIcon` + nombre).

---

## 4. Corrección del estado `"HABILITADO"` muerto

La auditoría del backend confirmó que `paso.estado` **nunca** toma el valor `"HABILITADO"` (declarado en `EstadoPasoEnum` y en la tabla de transiciones, pero ningún servicio lo asigna). La señal real de "este paso está disponible para actuar ahora" es el campo booleano independiente `TramitePaso.habilitado`.

```ts
// Antes
const necesitaDocumento =
  paso.paso.requiereDocumentos &&
  paso.habilitado &&
  (paso.estado === "PENDIENTE" || paso.estado === "HABILITADO" || paso.estado === "EN_SUBSANACION");

// Ahora
const necesitaDocumento =
  paso.paso.requiereDocumentos &&
  paso.habilitado &&
  (paso.estado === "PENDIENTE" || paso.estado === "EN_SUBSANACION");
```

`ESTADO_PASO["HABILITADO"]`/`"CERRADO"` se mantienen en el `Record<EstadoPaso, …>` solo para que siga siendo exhaustivo frente al enum real del backend — no deben usarse como condición de negocio en componentes nuevos.

---

## 5. Etapas y pasos múltiples en `WorkflowCrear` / `WorkflowEditar`

### 5.1 Causa raíz #1 — selector de departamento

**Síntoma:** "La etapa siguiente a la 1 no me deja agregarle los pasos."

El campo "ID Departamento Responsable" en `WorkflowCrear.tsx` (Step "Etapas") era un `<input type="number">` libre. Si el admin escribía un `codDepartamentoResponsable` inexistente, `POST /workflows/:id/etapas` fallaba con **500 (violación de FK)** y la Etapa 2 nunca se creaba — dando la falsa impresión de que "la etapa 2 no admite pasos".

**Fix:** `WorkflowCrear.tsx` carga `DepartamentosServicio.listar()` (departamentos con `estado: true`) y reemplaza el input libre por un `<select>` (`CampoTexto select`). Ya no es posible enviar un `codDepartamentoResponsable` inexistente.

### 5.2 Causa raíz #2 — no había forma de reabrir un workflow ya finalizado

Tras el fix anterior, se detectaron **7 workflows distintos, cada uno con exactamente 1 etapa** (`orden = 1`). Causa: al presionar "Finalizar" en `WorkflowCrear`, el wizard navega a `/dashboard/admin/workflows` y se pierde todo el estado. `WorkflowLista.tsx` solo tenía "Nuevo Workflow" y "Eliminar" — no había forma de reabrir un workflow para agregarle más etapas/pasos.

**Fix:**
- Lógica compartida extraída a [`useGestionEtapasPasos.ts`](./src/app/privado/admin/workflows/useGestionEtapasPasos.ts) (`handleAgregarEtapa`, `handleAgregarPaso`, `getP`/`setP`, `nombreDepartamento`, `departamentos`) y UI a [`EtapasSeccion.tsx`](./src/app/privado/admin/workflows/EtapasSeccion.tsx) / [`PasosPorEtapaSeccion.tsx`](./src/app/privado/admin/workflows/PasosPorEtapaSeccion.tsx), reutilizados por `WorkflowCrear.tsx`.
- Nueva página [`WorkflowEditar.tsx`](./src/app/privado/admin/workflows/WorkflowEditar.tsx) en `/dashboard/admin/workflows/:id/editar`: carga `WorkflowServicio.detalle(id)`, inicializa el hook con las etapas/pasos existentes y permite agregar más etapas/pasos a un workflow ya finalizado.
- `WorkflowLista.tsx`: nuevo botón "Editar etapas y pasos" (✏️) por fila.
- `WorkflowServicio.ts`: `EtapaResumen.pasos` y `WorkflowCreado.pasos` ahora son `PasoCreado[]` (incluyen `canal`, `slaDias`, `codEtapa`, etc.).
- Nuevas interfaces `EntidadResponsable` (`codEntidad`, `nombreEntidad`, `tipoEntidad`) y `FuncionarioAsignable` (`codUsuario`, `nombreUsuario`, `correoUsuario`, `rol`); `EtapaCreada` incluye `entidadResponsable?` y `funcionariosDisponibles?`, devueltos por `crearEtapa`/`actualizarEtapa`. Al crear una etapa, el toast de éxito muestra la entidad responsable; si `funcionariosDisponibles` viene vacío, se muestra un toast de advertencia.

### 5.3 Datos de referencia (BD de pruebas)

| `codDepartamento` | Nombre | `codEntidad` | Entidad | Personal activo |
|---|---|---|---|---|
| 1 | Departamento Administrativo de Planeación | 1 | Alcaldía Mayor de Tunja | 1 funcionario (Brian Andrés Rojas Morales, `codRol: 3`) |
| 2 | Departamento de Veolia | 2 | Veolia | 0 |

Si se selecciona el departamento 2 al crear una etapa, es **esperado** ver el toast "El departamento seleccionado aún no tiene supervisores ni funcionarios activos asignados" — no es un error.

> Nota: la guía Postman usa un escenario distinto (Alcaldía Mayor de Tunja `codEntidad: 1`, Departamento de Planeación `codDepartamento: 3`, actores Juan/Laura/Carlos/Ana) — son datos de otra tanda de pruebas, no contradicen esta tabla.

---

## 6. Gestión de trámites — Funcionario / Supervisor / Admin / Visitante

Pantalla **"Gestión de trámites"** ([`DashboardGestionTramites.tsx`](./src/app/privado/funcionario/DashboardGestionTramites.tsx)), montada en dos rutas con el mismo componente:

| Ruta | Roles | Particularidad |
|------|-------|----------------|
| `/dashboard/tramites` | `funcionario`, `supervisor`, `visitante` | Lista filtrada por el backend a la entidad+departamento del usuario |
| `/dashboard/admin/tramites` | `admin` | Misma vista, el backend devuelve todos los trámites |

Reutiliza el patrón de `DashboardCiudadano.tsx`: `Accordion` por trámite, `expandirTramite()` perezoso vía `TramitesServicio.detalle(id)`, render de pasos con `Chip` de estado y acciones contextuales.

**Piezas agregadas para esto:**
- `urls.tsx`: `PASO_INICIAR`, `DOCS_DESCARGAR`, `USUARIOS_TODOS`.
- `PasosServicio.iniciarRevision(tramiteId, pasoId, observacion?)`.
- `DocumentosServicio.descargar(tramiteId, pasoId, docId, nombreSugerido)` — `fetch` manual con header `Authorization` (porque `ApiServicio.peticion` siempre llama a `.json()`), arma un `Blob` y dispara la descarga con un `<a>` temporal.
- `UsuariosServicio.listar()` → `GET /privado/usuarios/todos`.
- `TramitesServicio`: `TramiteResumen` extendido con `usuarioCreador?` y `entidadAsignada?`.

**Matriz de acciones por rol:**

| Acción | Botón visible para | Precondición del paso | Diálogo |
|---|---|---|---|
| Iniciar revisión | `funcionario`, `supervisor`, `admin` | `habilitado: true` y `estado` ∈ {`PENDIENTE`, `REENVIADO`} | Observación opcional |
| Aprobar | `funcionario`, `supervisor`, `admin` | `estado === "EN_REVISION"` | Observación opcional |
| Devolver | `funcionario`, `supervisor`, `admin` | `estado === "EN_REVISION"` | Observación obligatoria |
| Asignar funcionario | `supervisor`, `admin` | `estado !== "APROBADO"` | Selector de funcionario (`nombre_rol === "funcionario"`) |
| Descargar documento | todos (incluye `visitante`) | el paso tiene documentos | — |

`visitante` no ve **ningún** botón de acción (solo lectura + descarga).

---

## 7. Asignar entidad/departamento a un usuario (Admin)

Acción "Editar / Asignar entidad" en `/dashboard/admin/usuarios` ([`UsuariosLista.tsx`](./src/app/privado/admin/usuarios/UsuariosLista.tsx) + [`AsignarEntidadDialog.tsx`](./src/app/privado/admin/usuarios/AsignarEntidadDialog.tsx)), usando `PUT /privado/usuarios/asignar-entidad/:id`.

**Caso de uso:** un ciudadano se registra (rol `4`, sin entidad) y el admin lo convierte en `funcionario`/`supervisor`/`visitante` de una entidad/departamento concreto.

**Piezas agregadas:**
- `urls.tsx`: `USUARIO_ASIGNAR_ENTIDAD(id)`.
- `UsuariosServicio.asignarEntidad(id, datos)` con `AsignarEntidadPayload { codEntidad, codDepartamento, cargo, codRol: 2|3|5 }`.

**Reglas de negocio del backend (`usuarios.service.ts → asignarEntidad`):**

1. **404** si el usuario no existe.
2. **400** `"No se puede asignar entidad a un administrador"` — si `usuario.codRol === 1`. La UI **no muestra** la acción para usuarios con rol `admin`.
3. **409** `"El usuario ya tiene un vínculo activo con esta entidad"` — si ya está vinculado a esa misma `codEntidad` con `estado: true`.
4. **404** si la entidad o el departamento no existen.
5. **400** si el departamento no pertenece a la entidad seleccionada.
6. El rol **solo sube en privilegio** (`codRol` menor = más privilegio): un ciudadano (`4`) pasa a `3`; un supervisor (`2`) no baja a `3` aunque se envíe `codRol: 3`.
7. Tras la asignación, **el usuario afectado debe volver a iniciar sesión** para que su JWT incluya el nuevo `cod_entidad`/`cod_departamento` — el `crearMensaje` de éxito lo indica.

**No incluido (decisión consciente):**
- Editar `nombreUsuario`/`correoUsuario`/`telefonoUsuario`/contraseña (`PUT /privado/usuarios/update/:id`) — endpoint distinto, fuera de este alcance.
- Desvincular (`estado: false`) un `entidad_usuario` existente — no hay endpoint de "quitar vínculo" en el backend actual.

---

## 8. Pendientes heredados de la auditoría — no tocados a propósito

Estos ítems requieren decisión de producto/seguridad antes de tocar backend o frontend. Siguen vigentes:

| # | Item | Por qué sigue sin tocarse |
|---|------|--------------------------|
| 1 | `tramite.estado` de solo lectura para clientes / endpoints `anular`/`cancelar` | Cambia el contrato de `PUT /tramites/update/:id`; el frontend no lo usa hoy. Si se agrega "cancelar trámite", debe usar un endpoint explícito, no `estado` libre. |
| 2 | Unificar `verificarAccesoFuncionario` / `puedeVerTramite` / `puedeAccederTramite` | Puede cambiar respuestas 200↔403 para funcionario/supervisor. |
| 3 | Deprecar `/tramites/agregar`, `/update/:id`, `/delete/:id` | El frontend confirmado no los usa, sin impacto inmediato. |
| 4 | Futuro de `RECHAZADO`/`CERRADO`/`HABILITADO` en `EstadoPasoEnum` | El frontend ya trata estos valores como "puede o no aparecer" vía `ESTADO_PASO` con fallback (`?? { label: paso.estado, color: "default" }`) — forward-compatible. |
