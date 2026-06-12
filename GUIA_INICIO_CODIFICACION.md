# Guía de inicio — Workflow / Trámites listos para pruebas

> Fecha de auditoría: 2026-06-10.
> Para el **historial de por qué** el código quedó así, ver [`HISTORIAL_CAMBIOS_WORKFLOW.md`](./HISTORIAL_CAMBIOS_WORKFLOW.md).
> Para el **script de pruebas E2E** (Postman/curl, por fases y por actor), ver [`GUIA_WORKFLOW_POSTMAN.md`](./GUIA_WORKFLOW_POSTMAN.md) — no se modificó, sigue vigente.

---

## 1. Resumen ejecutivo

El **ciclo de vida completo del trámite** está implementado de punta a punta y listo para lanzarse a pruebas:

```
admin crea Workflow (etapas + pasos)
   → ciudadano inicia trámite (elige workflow + entidad)
       → ciudadano sube documentos
           → funcionario/supervisor inicia revisión → aprueba / devuelve
               → ciudadano subsana (sube doc. + reenvía)
                   → vuelve a revisión → ... → trámite completado
   (en paralelo) supervisor/admin puede asignar funcionario a un paso
   (en paralelo) admin puede asignar entidad/departamento a un usuario
```

Esto cubre exactamente las Fases 0-8 de `GUIA_WORKFLOW_POSTMAN.md`. **No hace falta ningún desarrollo nuevo para correr ese script E2E.**

Quedan **2 gaps pendientes** que no bloquean el flujo principal pero conviene resolver antes/durante las pruebas. Están ordenados por esfuerzo (de menor a mayor):

| Prioridad | Tema | Esfuerzo | Bloquea el flujo principal |
|---|---|---|---|
| ~~P0~~ | ~~Enlaces muertos en el `Sidebar`~~ — ✅ resuelto (2026-06-12) | — | — |
| **P1** | Edición/eliminación de Workflow, Etapas y Pasos existentes | Medio (UI nueva) | No |
| **P2** | Eliminar documento de un trámite | Bajo-Medio (1 endpoint nuevo + botón) | No |

---

## 2. Qué está listo para pruebas (por rol)

| Rol | Pantalla | Estado |
|---|---|---|
| `admin` | Crear workflow (wizard 3 pasos) — [`WorkflowCrear.tsx`](./src/app/privado/admin/workflows/WorkflowCrear.tsx) | ✅ Completo (etapas con selector de departamento, pasos por etapa) |
| `admin` | Listar / eliminar workflow — [`WorkflowLista.tsx`](./src/app/privado/admin/workflows/WorkflowLista.tsx) | ✅ Completo |
| `admin` | Agregar más etapas/pasos a un workflow existente — [`WorkflowEditar.tsx`](./src/app/privado/admin/workflows/WorkflowEditar.tsx) | ✅ Completo (solo agregar, ver P1 para editar/eliminar) |
| `admin` | Listar usuarios, eliminar, asignar entidad/departamento — [`UsuariosLista.tsx`](./src/app/privado/admin/usuarios/UsuariosLista.tsx) + [`AsignarEntidadDialog.tsx`](./src/app/privado/admin/usuarios/AsignarEntidadDialog.tsx) | ✅ Completo |
| `admin` | Crear usuario — [`UsuariosCrear.tsx`](./src/app/privado/admin/usuarios/UsuariosCrear.tsx) | ✅ Completo |
| `admin` | Gestión de todos los trámites — `/dashboard/admin/tramites` ([`DashboardGestionTramites.tsx`](./src/app/privado/funcionario/DashboardGestionTramites.tsx)) | ✅ Completo |
| `ciudadano` | Iniciar trámite, ver mis trámites, subsanar/reenviar, subir documentos — [`DashboardCiudadano.tsx`](./src/app/privado/ciudadano/DashboardCiudadano.tsx) (todo en `/dashboard`) | ✅ Completo |
| `funcionario` / `supervisor` / `visitante` | Gestión de trámites de mi departamento — `/dashboard/tramites` ([`DashboardGestionTramites.tsx`](./src/app/privado/funcionario/DashboardGestionTramites.tsx)) | ✅ Completo (iniciar revisión, aprobar, devolver, asignar funcionario, descargar docs) |

**Conclusión: se puede ejecutar el script completo de `GUIA_WORKFLOW_POSTMAN.md` con los 5 roles sin tocar código.**

---

## 3. P0 — Enlaces muertos en el Sidebar (✅ resuelto, 2026-06-12)

`Sidebar.tsx` ya no tiene ítems que apunten a rutas inexistentes:

- `MENU_CIUDADANO` se redujo a un único ítem ("Inicio") — `DashboardCiudadano.tsx` ya cubre "Mis trámites" e "Iniciar trámite" en una sola pantalla, el submenú era redundante y solo generaba 404.
- `MENU_SUPERVISOR`/`MENU_FUNCIONARIO` se redujeron a "Inicio" + "Trámites" — se quitaron "Asignaciones" y "Agregar funcionario" (no tenían ruta ni pantalla construida).

Pantallas "Asignaciones" y "Agregar funcionario (supervisor)" siguen sin construirse — quedaron fuera de alcance, no bloquean las pruebas (ver [`HISTORIAL_CAMBIOS_WORKFLOW.md` §6](./HISTORIAL_CAMBIOS_WORKFLOW.md)).

---

## 4. P1 — Editar/eliminar Workflow, Etapas y Pasos existentes

`WorkflowServicio.ts` ya expone todos los métodos necesarios — **no requiere cambios de backend ni de servicio**, solo UI:

```ts
// src/app/servicios/privados/WorkflowServicio.ts (ya existen)
actualizar(id, body)              // PUT /privado/workflows/:id        → editar codigo/nombre/descripcion/activo
eliminar(id)                       // DELETE /privado/workflows/:id
actualizarEtapa(workflowId, etapaId, body)  // PUT /privado/workflows/:wId/etapas/:eId
eliminarEtapa(workflowId, etapaId)          // DELETE /privado/workflows/:wId/etapas/:eId
actualizarPaso(pasoId, body)                // PUT /privado/workflows/pasos/:pId
eliminarPaso(pasoId)                        // DELETE /privado/workflows/pasos/:pId
```

**Estado actual de la UI** ([`WorkflowEditar.tsx`](./src/app/privado/admin/workflows/WorkflowEditar.tsx) + [`EtapasSeccion.tsx`](./src/app/privado/admin/workflows/EtapasSeccion.tsx) + [`PasosPorEtapaSeccion.tsx`](./src/app/privado/admin/workflows/PasosPorEtapaSeccion.tsx)): solo permiten **agregar** etapas/pasos nuevos a un workflow existente. No hay botones de editar/eliminar sobre los chips de etapas/pasos ya creados, ni un formulario para editar los datos del workflow (`codigo`/`nombre`/`descripcion`/`activo`) en sí.

**No bloquea las pruebas** (los workflows nuevos se pueden crear correctamente desde cero), pero limita la corrección de datos si se comete un error al crear una etapa/paso (p. ej. `codigo` o `canal` mal escrito).

### Plan sugerido (cuando se priorice)

1. En `WorkflowEditar.tsx`, agregar una sección "Datos del workflow" con `CampoTexto` para `codigo`/`nombre`/`descripcion` + un `Switch` para `activo`, y un botón "Guardar cambios" → `WorkflowServicio.actualizar(id, {...})`.
2. En `EtapasSeccion.tsx`, cada chip de etapa agrega un ícono ✏️ (abre un diálogo para editar `nombre`/`codDepartamentoResponsable`/`descripcion` → `actualizarEtapa`) y 🗑️ (confirmación → `eliminarEtapa`, refrescar `etapas`/`pasosPorEtapa`).
3. En `PasosPorEtapaSeccion.tsx`, mismo patrón por paso (`actualizarPaso`/`eliminarPaso`).
4. Validar en backend (`workflows.service.ts`) si `eliminarEtapa`/`eliminarPaso` tienen restricciones (p. ej. no eliminar si ya hay `TramitePaso` asociados) — si las hay, mostrar el mensaje de error del backend tal cual vía `crearMensaje("error", (e as Error).message)` (patrón ya usado en todo el proyecto).

---

## 5. P2 — Eliminar documento de un trámite

Confirmado en backend ([`C:\VentanillaUnica\src\modulos\privado\tramites\documentos.controller.ts`](file:///C:/VentanillaUnica/src/modulos/privado/tramites/documentos.controller.ts)):

```
DELETE /privado/tramites/:tramiteId/pasos/:pasoId/documentos/:documentoId
@Roles('admin', 'supervisor', 'funcionario', 'ciudadano')   // visitante NO
@OwnershipValidation('documento')                            // ciudadano solo puede borrar SUS propios documentos
```

El frontend **no tiene** esta acción: falta `URLS.DOCS_ELIMINAR`, `DocumentosServicio.eliminar`, y los botones en ambos dashboards. `ApiServicio.delete<T>()` ya soporta respuestas `204` (devuelve `undefined`), así que la implementación es directa.

### Plan sugerido

1. **`urls.tsx`** ([linea 42](./src/app/utilidades/dominios/urls.tsx#L42), junto a `DOCS_DESCARGAR`):
   ```ts
   DOCS_ELIMINAR: (tId: number, pId: number, docId: number) =>
     `/privado/tramites/${tId}/pasos/${pId}/documentos/${docId}`,
   ```
2. **`DocumentosServicio.ts`**:
   ```ts
   eliminar: (tramiteId: number, pasoId: number, documentoId: number) =>
     ApiServicio.delete<void>(URLS.DOCS_ELIMINAR(tramiteId, pasoId, documentoId)),
   ```
3. **UI** — en `DashboardCiudadano.tsx` y `DashboardGestionTramites.tsx`, junto al botón de descarga de cada documento, agregar un ícono 🗑️ con diálogo de confirmación:
   - `ciudadano`: visible solo si el documento es propio (el backend ya lo valida vía `OwnershipGuard`, pero ocultar el botón evita un 403 innecesario en la UI — comparar `documento.codUsuario` o equivalente con `usuario.sub` del JWT).
   - `funcionario`/`supervisor`/`admin`: visible siempre.
   - `visitante`: no mostrar el botón.
   - Tras eliminar: refrescar `detalles[tramiteId]` (mismo patrón que `handleArchivoSeleccionado`).

---

## 6. Orden recomendado de trabajo

1. ~~**P0**~~ — ✅ resuelto, `Sidebar.tsx` ya no tiene enlaces muertos.
2. **Lanzar pruebas E2E** siguiendo `GUIA_WORKFLOW_POSTMAN.md` (Fases 0-8) — el flujo principal ya está completo, este es el momento de detectar regresiones reales.
3. **P2** (≈1-2 h): agregar eliminación de documentos — es autocontenido y de bajo riesgo.
4. **P1** (≈3-5 h): UI de edición/eliminación de workflow/etapas/pasos — más esfuerzo, no bloquea pruebas, se puede hacer en paralelo o después.

---

## 7. Datos de referencia para QA

### Departamentos / Entidades (BD de pruebas usada en la verificación de etapas)

| `codDepartamento` | Nombre | `codEntidad` | Entidad | Personal activo |
|---|---|---|---|---|
| 1 | Departamento Administrativo de Planeación | 1 | Alcaldía Mayor de Tunja | 1 funcionario (Brian Andrés Rojas Morales, `codRol: 3`) |
| 2 | Departamento de Veolia | 2 | Veolia | 0 |

### Actores del script Postman (`GUIA_WORKFLOW_POSTMAN.md`, Fase 0)

| Usuario | Rol | Entidad | Departamento |
|---|---|---|---|
| Juan García | `supervisor` (2) | Alcaldía Mayor de Tunja (1) | Planeación (3) |
| Laura Pérez | `funcionario` (3) | Alcaldía Mayor de Tunja (1) | Planeación (3) |
| Carlos Soto | `ciudadano` (4) | — | — |
| Ana Rojas | `visitante` (5) | Alcaldía Mayor de Tunja (1) | Planeación (3) |

> Estos dos sets de datos pertenecen a tandas de prueba distintas — no se contradicen, pero no asumir que `codDepartamento: 1` y `codDepartamento: 3` son lo mismo.

### Roles → `codRol`

| `codRol` | `nombre_rol` |
|---|---|
| 1 | `admin` |
| 2 | `supervisor` |
| 3 | `funcionario` |
| 4 | `ciudadano` |
| 5 | `visitante` |

---

## 8. Mapa de documentación

| Documento | Propósito |
|---|---|
| **`GUIA_INICIO_CODIFICACION.md`** (este archivo) | Punto de partida: qué está listo, qué falta, en qué orden atacarlo |
| [`HISTORIAL_CAMBIOS_WORKFLOW.md`](./HISTORIAL_CAMBIOS_WORKFLOW.md) | Por qué el código quedó así — bugs encontrados, causas raíz, decisiones de alcance |
| [`GUIA_WORKFLOW_POSTMAN.md`](./GUIA_WORKFLOW_POSTMAN.md) | Script E2E completo (Postman/curl) por fases y por actor — usar para QA |
