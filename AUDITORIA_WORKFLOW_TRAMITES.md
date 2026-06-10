# Auditoría — Módulos `workflows` y `tramites`

> Fecha: 2026-06-10
> Alcance: `src/modulos/privado/workflows/**` y `src/modulos/privado/tramites/**` (incluye guardianes de seguridad usados por estos módulos: `OwnershipGuard`, `RolesGuard`).
> Objetivo: detectar **lógica difusa** (reglas inconsistentes o ambiguas entre distintos puntos del código) y **lógica duplicada** (la misma regla de negocio implementada más de una vez, con riesgo de divergencia), y proponer un plan de optimización.

Este documento es el resultado de la auditoría solicitada. No se modificó ningún comportamiento de negocio sin antes documentarlo aquí. Al final hay una sección **"Cambios aplicados"** (correcciones de bajo riesgo ya hechas) y otra **"Pendientes que requieren decisión"** (cambios de comportamiento/seguridad que conviene confirmar antes de tocar, porque pueden afectar al frontend o a datos ya creados).

---

## Índice

1. [Resumen ejecutivo](#resumen-ejecutivo)
2. [🔴 Crítico — El estado del trámite se puede pisar saltándose el workflow](#1-crítico--el-estado-del-trámite-se-puede-pisar-saltándose-el-workflow)
3. [🟠 Alto — Tres implementaciones distintas de "¿puede ver/usar este trámite?"](#2-alto--tres-implementaciones-distintas-de-puede-verusar-este-trámite)
4. [🟠 Alto — CRUD huérfano (`/agregar`, `/update`, `/delete`) paralelo al flujo real](#3-alto--crud-huérfano-agregar-update-delete-paralelo-al-flujo-real)
5. [🟡 Medio — Estados y enums muertos (`HABILITADO`, `RECHAZADO`, `CERRADO`, etc.)](#4-medio--estados-y-enums-muertos-habilitado-rechazado-cerrado-etc)
6. [🟡 Medio — `estadoInicial` sin validar contra el enum (cast forzado)](#5-medio--estadoinicial-sin-validar-contra-el-enum-cast-forzado)
7. [🟢 Bajo — Fallback silencioso `codDepartamentoResponsable ?? 0`](#6-bajo--fallback-silencioso-coddepartamentoresponsable--0)
8. [🟢 Bajo — Doble verificación redundante en `DocumentService`](#7-bajo--doble-verificación-redundante-en-documentservice)
9. [🟢 Bajo — Convenciones REST mixtas](#8-bajo--convenciones-rest-mixtas)
10. [✅ Cambios aplicados en esta auditoría](#-cambios-aplicados-en-esta-auditoría)
11. [⏳ Pendientes que requieren decisión](#-pendientes-que-requieren-decisión)
12. [Plan de optimización priorizado](#plan-de-optimización-priorizado)

---

## Resumen ejecutivo

| # | Hallazgo | Severidad | Tipo |
|---|----------|-----------|------|
| 1 | `PUT /tramites/update/:id` y `POST /tramites/agregar` permiten fijar `tramite.estado` a cualquier valor, sin pasar por el motor de workflow | 🔴 Crítico | Lógica difusa |
| 2 | `verificarAccesoFuncionario`, `puedeVerTramite` y `puedeAccederTramite` implementan tres reglas distintas (y no equivalentes) de "¿puede este funcionario/visitante ver o usar este trámite?" | 🟠 Alto | Lógica duplicada |
| 3 | `/tramites/agregar`, `/update/:id`, `/delete/:id` son un CRUD genérico que no crea pasos ni eventos, y coexiste con el flujo real `/tramites/iniciar/:workflowId` | 🟠 Alto | Lógica difusa / duplicada |
| 4 | `EstadoPasoEnum.HABILITADO` y `RECHAZADO` nunca se asignan; `CERRADO` se *consulta* en 4 sitios pero nunca se asigna; varios valores de `TipoEventoEnum`/`WorkflowAccionEnum` no se usan | 🟡 Medio | Código muerto / lógica difusa |
| 5 | `estadoInicial` de `WorkflowPaso` se valida solo como `string` y se castea a `EstadoPasoEnum` sin verificación | 🟡 Medio | Lógica difusa |
| 6 | `codDepartamentoResponsable: pasoDef.etapa?.codDepartamentoResponsable ?? 0` | 🟢 Bajo | Lógica difusa |
| 7 | `OwnershipGuard` y `DocumentService` verifican el mismo permiso dos veces | 🟢 Bajo | Lógica duplicada |
| 8 | Mezcla de convenciones REST (`/agregar` vs `/iniciar/:id`, etc.) | 🟢 Bajo | Estilo |

---

## 1. 🔴 Crítico — El estado del trámite se puede pisar saltándose el workflow

**Archivos:** `tramites.service.ts` (`registrar`, `actualizar`), `dto/crear-tramite.dto.ts`, `dto/actualizar-tramite.dto.ts`, `tramites.controller.ts` (`POST /agregar`, `PUT /update/:id`)

El flujo "real" (`POST /tramites/iniciar/:workflowId`) hace que `tramite.estado` solo cambie a `COMPLETADO` cuando **todos** los pasos quedan `APROBADO`/`CERRADO` (`WorkflowInstanceService.actualizarProgresoGlobal`). Es la única vía pensada para mover el estado del trámite.

Sin embargo:

```ts
// crear-tramite.dto.ts
@IsEnum(EstadoTramiteEnum)
@IsNotEmpty()
estado!: EstadoTramiteEnum;          // el cliente decide el estado inicial

// actualizar-tramite.dto.ts
@IsOptional()
@IsEnum(EstadoTramiteEnum)
estado?: EstadoTramiteEnum;          // el cliente puede cambiarlo libremente

// tramites.service.ts → actualizar()
if (datos.estado) tramite.estado = datos.estado;   // sin validar transición
```

`PUT /tramites/update/:id` está habilitado para `admin, supervisor, funcionario, ciudadano` (con `OwnershipValidation('tramite')`, que para `ciudadano` solo exige ser el creador). Esto significa que **un ciudadano dueño de su trámite puede hacer**:

```http
PUT /privado/tramites/update/5
{ "estado": "COMPLETADO" }
```

y el trámite quedará marcado `COMPLETADO` sin que ningún paso haya sido aprobado — sin generar `WorkflowEvento`, sin que `progreso` se actualice, y de forma indistinguible (para quien mira `/detalle`) de un cierre legítimo.

Lo mismo aplica a `POST /tramites/agregar`: el DTO obliga (`@IsNotEmpty()`) a enviar `estado`, es decir, el creador del trámite elige su propio estado inicial.

### Impacto
- Permite a cualquier rol con acceso de "dueño" falsificar el estado de un trámite gestionado por workflow.
- Rompe la garantía de que `tramite.estado` refleja el progreso real de `tramite.pasos`.
- No queda registro en `WorkflowEvento` de quién hizo el cambio ni por qué — rompe la trazabilidad que sí existe para el resto de transiciones.

### Recomendación
- `tramite.estado` debería ser de **solo lectura** para clientes en trámites con `codWorkflow` definido: eliminar `estado` de `CrearTramiteDto`/`ActualizarTramiteDto`, o ignorarlo cuando `tramite.codWorkflow` no es `null`.
- Si se necesita un cierre/anulación manual (p. ej. `ANULADO` por admin, `CANCELADO` por ciudadano), exponer **acciones explícitas** (`POST /tramites/:id/anular`, `POST /tramites/:id/cancelar`) que validen la transición permitida (`EN_PROCESO → ANULADO/CANCELADO`) y registren el evento correspondiente, en vez de un `PUT` genérico de campo libre.

> ⚠️ Esto cambia comportamiento expuesto al frontend — no se aplicó en esta auditoría. Ver [Pendientes que requieren decisión](#-pendientes-que-requieren-decisión).

---

## 2. 🟠 Alto — Tres implementaciones distintas de "¿puede ver/usar este trámite?"

Existen **tres** funciones que responden, con reglas distintas, a la misma pregunta de negocio ("¿este funcionario/visitante tiene acceso a este trámite?"):

| Función | Archivo | Usada por | Regla para `funcionario`/`supervisor` | Regla para `visitante` |
|---|---|---|---|---|
| `verificarAccesoFuncionario` | `tramites.service.ts:53` | `consultarUno`, `actualizar`, `eliminar` | entidad **Y** consulta SQL: el departamento tiene ≥1 paso responsable en el trámite | *(no aplica, visitante no pasa por aquí)* |
| `puedeVerTramite` | `workflow-permission.service.ts:36` | `consultarDetalle` (`GET /:id/detalle`, `/timeline`) | entidad **Y** (si `pasos` está cargado) el departamento tiene ≥1 paso responsable; **si `pasos` está vacío/no cargado → `true` sin más chequeo** | solo entidad, sin chequeo de departamento |
| `puedeAccederTramite` | `documentos-access.service.ts:14` | `OwnershipGuard` para `/pasos/:id/documentos*`, y de nuevo dentro de `DocumentService` | **solo entidad**, sin chequeo de departamento alguno | solo entidad |

### Por qué es un problema

1. **Inconsistencia de acceso para el mismo trámite/usuario.** Un funcionario de **Hacienda** (entidad X) frente a un trámite de la entidad X cuyos pasos pertenecen todos a **Planeación**:
   - `GET /tramites/:id` → 403 ("Tu departamento no es responsable de ningún paso...") vía `verificarAccesoFuncionario`.
   - `GET /tramites/:id/detalle` → también 403 vía `puedeVerTramite` (pasos cargados, ninguno con su departamento).
   - `GET /tramites/:id/pasos/:pasoId/documentos` → **200 OK** vía `puedeAccederTramite`, porque esa función ni siquiera mira el departamento.

   Es decir, ese funcionario no puede ver el trámite ni su detalle, pero **sí puede listar y subir documentos** a un paso de un departamento que no es el suyo. Desde la perspectiva del frontend esto es difícil de explicar ("¿por qué 403 en detalle pero 200 en documentos del mismo trámite?").

2. **El `else` de `puedeVerTramite` no distingue "pasos no cargados" de "pasos cargados pero vacíos".** El comentario dice "si los pasos no están cargados, confiar en que `consultar()` ya filtró", pero la condición real es `tramite.pasos && tramite.pasos.length > 0`. Para un trámite sin pasos (ver hallazgo #3, los creados por `/agregar`), `tramite.pasos === []` (cargado, vacío) cae en el mismo `return true` que el caso "no cargado" — cualquier funcionario/supervisor de la entidad puede ver el detalle de esos trámites huérfanos sin chequeo de departamento.

3. **Triplica el mantenimiento.** Si mañana cambia la regla de "acceso por departamento" (p. ej. se permite a un departamento "coordinador" ver todo), hay que tocar tres archivos y es fácil olvidar uno (de hecho ya divergieron).

### Recomendación
Centralizar en **un único servicio** (p. ej. `TramiteAccessService`) con dos métodos:
- `puedeVerTramite(tramite, usuario): boolean` — para lectura (detalle, timeline, listado individual).
- `puedeAccederDocumentosTramite(tramite, usuario): boolean` — para documentos, decidiendo explícitamente si debe heredar la regla de "ver trámite" o si documentos son intencionalmente "entidad-wide" (puede ser una decisión de negocio válida, p. ej. para personal de ventanilla única que escanea documentos de cualquier dependencia — pero entonces debe **documentarse como excepción intencional**, no como una implementación que "se quedó corta").

`verificarAccesoFuncionario` (SQL) y la rama `funcionario`/`supervisor` de `puedeVerTramite` (in-memory) deberían colapsar en una sola, idealmente la in-memory (ya que `consultarDetalle` siempre carga `pasos`).

> ⚠️ Unificar estas reglas puede **abrir o cerrar** accesos que hoy existen (p. ej. quitarle a un funcionario de otro departamento la posibilidad de subir documentos). No se aplicó en esta auditoría — ver [Pendientes](#-pendientes-que-requieren-decisión).

---

## 3. 🟠 Alto — CRUD huérfano (`/agregar`, `/update`, `/delete`) paralelo al flujo real

**Archivos:** `tramites.controller.ts` (`POST /agregar`, `PUT /update/:id`, `DELETE /delete/:id`), `tramites.service.ts` (`registrar`, `actualizar`, `eliminar`), `dto/crear-tramite.dto.ts`, `dto/actualizar-tramite.dto.ts`

`TramitesService.registrar()` crea un `Tramite` "pelado":

```ts
const nuevoTramite = this.tramiteRepository.create({
  codUsuarioCreador: usuarioId,
  codEntidadAsignada: datos.codEntidadAsignada,
  tipoTramite: datos.tipoTramite,
  estado: datos.estado,
});
```

— sin `codWorkflow`, sin `TramitePaso`s, sin `WorkflowEvento` de creación. Comparado con el flujo real `iniciarTramite()` (`workflow-instance.service.ts:55`), que sí crea la instancia completa de pasos y el evento `CREACION_TRAMITE`.

Un trámite creado así:
- No aparece nunca como "habilitado" para ningún paso (no tiene pasos).
- En `/detalle` mostrará `pasos: []` y `workflow: null`.
- Cae en el "agujero" del hallazgo #2.3 (cualquier funcionario de la entidad puede verlo en `/detalle` sin chequeo de departamento).
- No puede avanzar nunca (no hay pasos que aprobar) → queda eternamente `EN_PROCESO` salvo que alguien use el hallazgo #1 para forzar su `estado`.

Adicionalmente, **`CrearTramiteDto.codDepartamentoAsignado` es obligatorio (`@IsNotEmpty()`) pero no existe como columna en la entidad `Tramite`** (`src/modelos/tramite/tramite.ts`) — TypeORM lo descarta silenciosamente en el `create()`. Un frontend que implemente este endpoint pensando que ese campo enruta el trámite a un departamento estaría enviando un dato que **no tiene ningún efecto**.

### Recomendación
- Si `/agregar`, `/update/:id`, `/delete/:id` son remanentes de una versión anterior (pre-workflow) y el flujo soportado es exclusivamente `/iniciar/:workflowId` + acciones de paso, lo más limpio es **eliminarlos** (o restringirlos a `admin` como herramienta de soporte/datos, dejándolo explícito en la guía).
- Si se mantienen para casos especiales, como mínimo:
  - quitar `codDepartamentoAsignado` de ambos DTOs (campo fantasma), y
  - en `actualizar()`, **no permitir tocar `estado` libremente** (ver hallazgo #1).

> ⚠️ Eliminar/restringir endpoints existentes puede romper integraciones ya hechas por el frontend. No se aplicó — ver [Pendientes](#-pendientes-que-requieren-decisión).

---

## 4. 🟡 Medio — Estados y enums muertos (`HABILITADO`, `RECHAZADO`, `CERRADO`, etc.)

**Archivo:** `src/modelos/enums/estado-paso.enum.ts`, `workflow-transition.service.ts`, `workflow-instance.service.ts`, `document.service.ts`

```ts
export enum EstadoPasoEnum {
  PENDIENTE = 'PENDIENTE',
  HABILITADO = 'HABILITADO',     // (a)
  EN_REVISION = 'EN_REVISION',
  APROBADO = 'APROBADO',
  DEVUELTO = 'DEVUELTO',
  EN_SUBSANACION = 'EN_SUBSANACION',
  REENVIADO = 'REENVIADO',
  RECHAZADO = 'RECHAZADO',       // (b)
  CERRADO = 'CERRADO',           // (c)
}
```

- **(a) `HABILITADO`**: aparece en la tabla de transiciones de `validarTransicion()` (`PENDIENTE → HABILITADO → EN_REVISION`), pero **ningún servicio asigna `paso.estado = EstadoPasoEnum.HABILITADO`**. La señal real de "paso disponible para actuar" es el campo booleano independiente `TramitePaso.habilitado` (gestionado por `habilitarPasosDisponibles()`). Resultado: existen **dos conceptos de "habilitado"** con el mismo nombre — un valor de enum que nunca ocurre, y un booleano que sí se usa. Cualquiera que lea `validarTransicion` o la guía Postman puede asumir, razonablemente, que un paso "habilitado" tiene `estado === 'HABILITADO'`, lo cual nunca es cierto.

- **(b) `RECHAZADO`**: la tabla de transiciones permite `EN_REVISION → RECHAZADO`, pero no existe ningún endpoint/acción "rechazar" — solo `aprobar` y `devolver` desde `EN_REVISION`. `TipoEventoEnum.RECHAZO` (pensado para acompañar esta transición) tampoco se usa nunca.

- **(c) `CERRADO`**: la tabla permite `APROBADO → CERRADO`, y **se consulta** en 4 lugares como si pudiera ocurrir:
  - `document.service.ts:76`
  - `workflow-instance.service.ts:158, 171, 247`

  …pero ningún servicio asigna `paso.estado = EstadoPasoEnum.CERRADO`. Esas comparaciones `=== CERRADO` son código muerto hoy (siempre `false`), y sugieren una funcionalidad de "cierre de paso" que quedó a medio implementar.

- Otros valores de enum nunca usados:
  - `WorkflowAccionEnum.VER_TRAMITE`, `VER_PASO`, `SUBSANAR`, `REENVIAR`, `ASIGNAR_FUNCIONARIO` (solo `INICIAR_REVISION`, `APROBAR`, `DEVOLVER` se pasan a `validateAccion`; las acciones de subsanar/reenviar/asignar tienen su propia lógica ad-hoc en `WorkflowPermissionService` que no referencia el enum).
  - `TipoEventoEnum.OBSERVACION`, `RECHAZO`.

### Además — esto afecta a `GUIA_WORKFLOW_POSTMAN.md`
La guía actual usa `"estado": "HABILITADO"` como si fuera un valor real de `paso.estado` en varios ejemplos de respuesta (ver sección "Cambios aplicados" más abajo, donde se corrige).

### Recomendación
- Documentar explícitamente (comentario en el enum) que `HABILITADO` es legado/no usado, o eliminarlo si no rompe datos existentes en BD (revisar si hay filas con `estado = 'HABILITADO'`).
- Si se quiere soportar "rechazo" y "cierre de paso" como features reales, son funcionalidades a implementar (nuevo endpoint `rechazar`, lógica de cierre); si no están en el roadmap, quitarlos de la tabla de transiciones para que `validarTransicion` no sugiera caminos que no existen.
- Quitar los miembros de enum no usados de `WorkflowAccionEnum`/`TipoEventoEnum`, o usarlos donde corresponda (p. ej. `OBSERVACION` podría usarse para comentarios que no cambian de estado).

> No se eliminó nada de los enums en esta auditoría porque podría romper filas existentes en BD o consumidores que ya esperan esos valores — ver [Pendientes](#-pendientes-que-requieren-decisión).

---

## 5. 🟡 Medio — `estadoInicial` sin validar contra el enum (cast forzado)

**Archivos:** `dto/crear-workflow-paso.dto.ts`, `dto/actualizar-workflow-paso.dto.ts`, `workflow-instance.service.ts:120`

```ts
// DTOs (antes del fix)
@IsOptional()
@IsString()
estadoInicial?: string;

// workflow-instance.service.ts → crearInstanciaPasos()
estado: pasoDef.estadoInicial as EstadoPasoEnum,   // cast sin verificación
```

Si un `admin` crea/edita un `WorkflowPaso` con `estadoInicial: "Pendiente"` (mayúscula distinta) o cualquier valor que no sea exactamente uno de los strings de `EstadoPasoEnum`, **cada trámite que se inicie con ese workflow** tendrá un `paso.estado` fuera del enum. Entonces:

```ts
// validarTransicion()
return transiciones[estadoActual]?.includes(estadoNuevo) ?? false;
```

`transiciones["Pendiente"]` es `undefined` → `?.includes(...)` es `undefined` → `?? false` → **siempre `false`**. El paso queda permanentemente bloqueado (`iniciarRevisionPaso` siempre lanza "Transición inválida desde este estado"), sin ningún error en el momento de crear el workflow ni el trámite — el fallo solo se manifiesta cuando un funcionario intenta actuar sobre ese paso, y el mensaje de error no da ninguna pista de la causa real.

### Corrección aplicada
✅ Se cambió `@IsString()` por `@IsEnum(EstadoPasoEnum)` en ambos DTOs (`CrearWorkflowPasoDto`, `ActualizarWorkflowPasoDto`). Ahora `class-validator` rechaza con 400 cualquier `estadoInicial` que no sea un valor válido de `EstadoPasoEnum`, en el momento de crear/editar el paso — antes de que pueda afectar a ningún trámite. El valor por defecto de la columna (`'PENDIENTE'`, ver `workflow-paso.ts:46`) sigue siendo válido.

---

## 6. 🟢 Bajo — Fallback silencioso `codDepartamentoResponsable ?? 0`

**Archivo:** `workflow-instance.service.ts:118-119` (`crearInstanciaPasos`)

```ts
codDepartamentoResponsable: pasoDef.etapa?.codDepartamentoResponsable ?? 0,
```

`pasoDef` se carga con `relations: ['etapa']` (línea 106), por lo que `pasoDef.etapa` debería existir siempre para un `WorkflowPaso` bien formado (`codEtapa` es FK obligatoria a nivel de diseño). Si por alguna razón la relación no se resolviera (etapa eliminada/huérfana), el `?? 0` asigna silenciosamente el departamento `0` — un valor que **ningún usuario real tendrá nunca** en `obtenerDepartamento()`, por lo que ese paso queda permanentemente inaccesible para `validateAccion` (todas las acciones de funcionario/supervisor exigen `departamento === paso.codDepartamentoResponsable`), sin ningún log o error que indique por qué.

### Corrección aplicada
✅ Se reemplazó el fallback `?? 0` por una validación explícita: si `pasoDef.etapa` no está presente, se lanza `BadRequestException` indicando qué paso del workflow está mal configurado (etapa faltante), en el momento de **iniciar el trámite** — un error visible y accionable, en vez de un bloqueo silencioso descubierto meses después.

---

## 7. 🟢 Bajo — Doble verificación redundante en `DocumentService`

**Archivos:** `documentos.controller.ts` (`@OwnershipValidation('tramite')`), `ownership.guard.ts:189`, `document.service.ts:57, 171`

Para `subirDocumento` y `obtenerDocumentosPaso`/`listarDocumentos`, el `OwnershipGuard` ya ejecuta `documentosAccessService.puedeAccederTramite(tramite, usuario)` antes de entrar al controller (gracias a `@OwnershipValidation('tramite')`). Dentro de `DocumentService`, se vuelve a llamar **exactamente al mismo método** con los mismos argumentos.

No es incorrecto (es "fail-safe"), pero:
- Es trabajo duplicado en cada request (una query/relations adicional para volver a cargar `tramitePaso.tramite` y re-evaluar la misma regla).
- Si en el futuro alguien actualiza la regla en un solo sitio (p. ej. agrega el chequeo de departamento solo en el guard), el otro sitio queda desincronizado sin que ningún test lo detecte, porque ambos "pasan" hoy con la misma lógica.

### Recomendación
Una vez resuelto el hallazgo #2 (servicio único de acceso), dejar la verificación **solo en el guard** (`OwnershipGuard`) y quitar la llamada duplicada dentro de `DocumentService`, o viceversa — pero no ambas. No se tocó en esta auditoría por ser de bajo impacto y para no mezclarlo con el cambio más grande del hallazgo #2.

---

## 8. 🟢 Bajo — Convenciones REST mixtas

**Archivos:** `tramites.controller.ts`, `entidades.controller.ts`

Conviven dos estilos dentro del mismo controller:
- Estilo "verbo en español" (legado): `POST /agregar`, `PUT /update/:id`, `DELETE /delete/:id`.
- Estilo orientado a recursos (el del flujo de workflow): `POST /iniciar/:workflowId`, `GET /:id/detalle`, `POST /:id/pasos/:pasoId/aprobar`.

No es un bug, pero genera fricción para el equipo de frontend al decidir qué endpoint usar para una acción nueva. Si se decide deprecar el CRUD legado (hallazgo #3), este punto se resuelve solo. Si se mantiene, valdría la pena documentar en la guía cuál es el estilo "vigente" para nuevos endpoints.

---

## ✅ Cambios aplicados en esta auditoría

Estos cambios son de bajo riesgo: no alteran reglas de acceso ni el contrato de las respuestas para datos válidos, solo **adelantan errores de configuración** que antes fallaban en silencio, y **corrigen ejemplos incorrectos** en la documentación.

1. **`CrearWorkflowPasoDto.estadoInicial` / `ActualizarWorkflowPasoDto.estadoInicial`**: `@IsString()` → `@IsEnum(EstadoPasoEnum)`. Un `estadoInicial` inválido ahora es rechazado con 400 al crear/editar el paso, en vez de bloquear silenciosamente todos los trámites futuros de ese workflow (hallazgo #5).

2. **`WorkflowInstanceService.crearInstanciaPasos()`**: si `pasoDef.etapa` no está cargada/asignada, se lanza `BadRequestException` con el código del paso afectado, en vez de asignar `codDepartamentoResponsable = 0` silenciosamente (hallazgo #6).

3. **`GUIA_WORKFLOW_POSTMAN.md`**: se corrigieron los ejemplos que mostraban `"estado": "HABILITADO"` o `"estadoAnterior": "HABILITADO"` como si fueran valores reales de `paso.estado` (hallazgo #4-a):
   - Fase 5.3 (transición `iniciar`): aclarado que la precondición es `habilitado: true` con `estado: PENDIENTE`, y la transición real de `estado` es `PENDIENTE → EN_REVISION`.
   - Fase 7 (`asignarFuncionario`): la respuesta ya no muestra `"estado": "HABILITADO"` (ese método nunca toca `estado`); ahora muestra el `estado` real sin cambios y se aclara que solo cambia `codFuncionarioAsignado`.
   - Sección 8.2 (detalle de trámite): el paso "VERIF-PLANOS-001" ya no muestra `"estado": "HABILITADO"`; ahora `"estado": "PENDIENTE", "habilitado": true`.
   - Sección 8.3 (timeline): el evento `INICIO_REVISION` ya no muestra `"estadoAnterior": "HABILITADO"`; ahora `"estadoAnterior": "PENDIENTE"`.
   - "Máquina de estados → Estado de cada paso": el diagrama separaba `HABILITADO` como un estado intermedio real; se reescribió para mostrar `habilitado: true/false` como atributo independiente de `estado`, y se marcó `RECHAZADO`/`CERRADO` como transiciones declaradas pero no implementadas todavía.

---

## ⏳ Pendientes que requieren decisión

Estos cambios **sí alteran comportamiento** (acceso, endpoints disponibles, o el contrato de algún campo) y por eso no se aplicaron automáticamente. Quedan documentados aquí como backlog priorizado:

| # | Qué | Por qué se pausó | Esfuerzo |
|---|-----|-------------------|----------|
| 1 | Hacer `tramite.estado` de solo-lectura para clientes cuando `codWorkflow != null`, y/o agregar endpoints explícitos `anular`/`cancelar` | Quita una capacidad que `PUT /tramites/update/:id` expone hoy; el frontend podría depender de enviar `estado` en ese body | Medio |
| 2 | Unificar `verificarAccesoFuncionario` / `puedeVerTramite` / `puedeAccederTramite` en un servicio único | Puede cambiar qué requests devuelven 200 vs 403 (p. ej. acceso a documentos entre departamentos) | Medio-Alto |
| 3 | Deprecar o restringir `/tramites/agregar`, `/update/:id`, `/delete/:id`, y limpiar `codDepartamentoAsignado` de los DTOs | Son endpoints públicos ya documentados/expuestos; eliminarlos podría romper integraciones existentes | Bajo (DTO) / Medio (endpoints) |
| 4 | Decidir el futuro de `RECHAZADO`/`CERRADO`/`HABILITADO` en `EstadoPasoEnum` (implementar las features o limpiar enum + tabla de transiciones) | Depende de si "rechazar paso" / "cerrar paso" están en el roadmap de producto | Medio |

---

## Plan de optimización priorizado

1. **Corto plazo (hecho en esta auditoría):** validaciones que adelantan errores de configuración + documentación corregida (hallazgos #5, #6, parte de #4).
2. **Siguiente iteración recomendada:** resolver el hallazgo #1 (estado del trámite no debe ser editable libremente) — es el de mayor riesgo porque afecta la integridad de los datos de cualquier trámite ya creado.
3. **Después:** unificar las reglas de acceso (#2) y decidir el destino del CRUD huérfano (#3) — ambos tocan el mismo área (`tramites.service.ts` + `documentos-access.service.ts`) y conviene abordarlos juntos.
4. **Cuando haya bandwidth:** limpieza de enums no usados (#4) y eliminación de la doble verificación en documentos (#7), una vez resuelto #2.
