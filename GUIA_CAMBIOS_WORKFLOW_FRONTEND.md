# Guía de cambios — Integración Workflow/Trámites (Frontend)

> Fecha: 2026-06-10
> Origen: [`AUDITORIA_WORKFLOW_TRAMITES.md`](./AUDITORIA_WORKFLOW_TRAMITES.md) (auditoría del backend `workflows`/`tramites`) + novedades de [`GUIA_WORKFLOW_POSTMAN.md`](./GUIA_WORKFLOW_POSTMAN.md) (2026-06-10).
> Objetivo: dejar el flujo "ciudadano sube su trámite siguiendo el workflow" funcionando end-to-end, y alinear el frontend con el comportamiento real (no documentado-pero-falso) del backend.

---

## 1. Resumen de lo que cambió y por qué

La auditoría del backend identificó que `paso.estado` **nunca** toma el valor `"HABILITADO"` (ese estado está declarado en `EstadoPasoEnum` y en la tabla de transiciones, pero ningún servicio lo asigna). La señal real de "este paso está disponible para actuar ahora" es el campo booleano independiente `TramitePaso.habilitado`. La guía Postman fue corregida para reflejar esto.

Además, se confirmó y cerró el bug que impedía cargar el catálogo de workflows para `ciudadano`/`visitante` (`400 Bad Request` en `GET /privado/workflows?activo=true`).

Ningún hallazgo de la sección **"Pendientes que requieren decisión"** de la auditoría (estado de trámite editable libremente, unificación de reglas de acceso, CRUD huérfano `/agregar` `/update` `/delete`) afecta al frontend actual: se verificó que `TramitesServicio` **no** usa esos endpoints ni envía `estado` al crear/actualizar un trámite. **No se debe agregar UI que dependa de ellos** mientras sigan en estado "pendiente de decisión" en el backend.

---

## 2. Cambios aplicados

### 2.1 Backend — `filtro-workflow.dto.ts` (fix del 400 en `/privado/workflows?activo=true`)

`@IsBoolean()` rechazaba el query-param `"true"`/`"false"` (string) porque `ValidationPipe` no tiene `enableImplicitConversion`. Se agregó `@Transform` para convertir el string a boolean antes de validar:

```ts
@IsOptional()
@Transform(({ value }: { value: unknown }) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
})
@IsBoolean()
activo?: boolean;
```

Archivo: `C:\VentanillaUnica\src\modulos\privado\workflows\dto\filtro-workflow.dto.ts`. Requiere reiniciar `npm run start:dev` si el watcher no recargó.

### 2.2 Frontend — Catálogos para `ciudadano` (Workflows + Entidades)

- Nuevo servicio `EntidadesServicio` (`src/app/servicios/privados/EntidadesServicio.ts`) — `listar()` / `detalle(id)` contra `GET /privado/entidades/todos` y `GET /privado/entidades/:id`.
- Nuevas URLs en `urls.tsx`: `ENTIDADES_TODOS`, `ENTIDAD(id)`.
- `WorkflowServicio` — `WorkflowCreado` ahora incluye `etapas?: EtapaResumen[]` y `pasos?: PasoResumen[]` para poder previsualizar los pasos del workflow antes de iniciar el trámite.

### 2.3 Frontend — `DashboardCiudadano.tsx`: flujo completo "Iniciar trámite"

- `cargarEntidades()` se ejecuta junto con `cargarTramites()`/`cargarWorkflows()` al montar.
- Diálogo "Iniciar trámite": muestra preview de los pasos visibles para el ciudadano (`visibleCiudadano !== false`, ordenados por `ordenVisual`, indicando cuáles requieren documento), y un selector de **Entidad** (`codEntidadAsignada`) precargado con `usuario.cod_entidad` si existe.
- `confirmarIniciar` envía `codEntidadAsignada: Number(entidadSeleccionada)` y bloquea el botón si no hay entidad seleccionada.

### 2.4 Frontend — Ciclo subsanar → adjuntar → reenviar (Fase 6 de la guía)

- Nuevo diálogo "Reenviar paso" + `confirmarReenviar()`, que llama a `PasosServicio.reenviar(tramiteId, pasoId, observacion)` y refresca el detalle del trámite.
- El botón **Reenviar** aparece cuando `paso.estado === "EN_SUBSANACION"`.
- `handleArchivoSeleccionado` ahora refresca `detalles[tramiteId]` tras subir un documento, para que la lista de documentos del paso se vea actualizada sin recargar la página.
- `PasoDetalle.documentos` (en `TramitesServicio.ts`) y el render de cada paso muestran la lista de documentos cargados (`DescriptionIcon` + nombre).

### 2.5 Frontend — Corrección del estado `"HABILITADO"` muerto (hallazgo #4-a de la auditoría)

En `renderPasos()`, la condición para mostrar el botón "Subir doc." comparaba `paso.estado === "HABILITADO"`, un valor que el backend **nunca** produce. Como `paso.habilitado` (booleano) ya se chequea por separado, esa rama era dead code que podía sugerir (incorrectamente) que existe un tercer estado real "HABILITADO".

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

`ESTADO_PASO["HABILITADO"]` se deja en el `Record` (y `EstadoPaso` sigue incluyendo `"HABILITADO"`/`"CERRADO"` como valores del enum del backend) solo para que el `Record<EstadoPaso, …>` siga siendo exhaustivo frente al enum real — pero no debe usarse como condición de negocio en ningún componente nuevo.

---

## 3. Verificación

- `npx tsc --noEmit -p tsconfig.json` → sin errores.
- Flujo manual recomendado para QA (rol `ciudadano`):
  1. Login → Dashboard carga "Mis trámites" + "Workflows disponibles" sin error 400.
  2. "Iniciar trámite" → seleccionar entidad → crear trámite → aparece en "Mis trámites" con los pasos de la Etapa 1 en `habilitado: true`.
  3. Subir documento en un paso que `requiereDocumentos` y está `habilitado` con `estado: PENDIENTE` → aparece en la lista de documentos del paso.
  4. (Requiere acción de un funcionario) Cuando un paso queda `DEVUELTO` → botón "Subsanar" → tras subsanar, `estado: EN_SUBSANACION` → subir documento corregido → botón "Reenviar" → `estado` vuelve a `EN_REVISION`.

---

## 4. No tocado (a propósito)

Items de la sección "Pendientes que requieren decisión" de la auditoría — **no implementados**, requieren decisión de producto/seguridad antes de tocar backend o frontend:

| # | Item | Por qué no se tocó aquí |
|---|------|--------------------------|
| 1 | `tramite.estado` de solo lectura para clientes / endpoints `anular`/`cancelar` | Cambia el contrato de `PUT /tramites/update/:id`; el frontend no lo usa hoy, pero si se agrega una función "cancelar trámite" debe usar el endpoint explícito que se decida, no `estado` libre |
| 2 | Unificar `verificarAccesoFuncionario` / `puedeVerTramite` / `puedeAccederTramite` | Puede cambiar respuestas 200↔403 para funcionario/supervisor; afecta a futuras pantallas de revisión |
| 3 | Deprecar `/tramites/agregar`, `/update/:id`, `/delete/:id` | El frontend ya no los usa (confirmado), así que no hay impacto inmediato |
| 4 | Futuro de `RECHAZADO`/`CERRADO`/`HABILITADO` en `EstadoPasoEnum` | El frontend ya trata estos valores como "puede o no aparecer" vía `ESTADO_PASO` con fallback (`?? { label: paso.estado, color: "default" }`), así que es forward-compatible si se implementan más adelante |
