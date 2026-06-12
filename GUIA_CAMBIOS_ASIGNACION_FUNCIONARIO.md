# Guía de cambios — Control de trámites por funcionario asignado

> Fecha: 2026-06-11
> Relacionado con: [`AUDITORIA_WORKFLOW_TRAMITES.md`](./AUDITORIA_WORKFLOW_TRAMITES.md) (hallazgo #2 — "Tres implementaciones distintas de '¿puede ver/usar este trámite?'") y [`GUIA_WORKFLOW_POSTMAN.md`](./GUIA_WORKFLOW_POSTMAN.md) (sección "Reglas de acceso por rol" / "Tabla de acciones").
> Objetivo: documentar el estado actual y dejar un plan concreto, por fases, para que **un trámite solo sea visible/operable por un funcionario después de que un supervisor/admin lo asigne** desde `/dashboard/admin/tramites` (botón "Asignar funcionario").

---

## 1. Problema reportado

> "cualquier funcionario de la entidad sin antes ser asignado le aparece el trámite. La idea es que en `/dashboard/admin/tramites`, al darle el botón de asignar funcionario, el funcionario asignado pueda tener control sobre el trámite."

Hoy, **cualquier `funcionario` cuyo departamento coincida con `codDepartamentoResponsable` de algún paso del trámite**:
- Lo ve en su listado `/dashboard/tramites` (`GET /tramites/todos`).
- Puede ver su detalle/timeline.
- Puede iniciar revisión / aprobar / devolver cualquier paso de su departamento que esté `habilitado`, **incluso si nadie lo ha asignado todavía**.

La asignación (`POST /tramites/:id/pasos/:pasoId/asignar`) hoy solo sirve para **bloquear a los demás funcionarios** una vez que alguien ya fue asignado — no para **otorgar** acceso. Es decir, el control es "abierto por defecto, cerrado tras asignar a otro", y se pide invertirlo a "cerrado por defecto, abierto solo para el asignado".

---

## 2. Cómo funciona hoy (con referencias exactas)

### 2.1 Visibilidad en el listado — `GET /privado/tramites/todos`

Archivo: `C:\VentanillaUnica\src\modulos\privado\tramites\tramites.service.ts` → `consultar()` (líneas 105-122)

```ts
} else if (esFuncionarioOSupervisor(rol)) {
  // Funcionario/supervisor: solo trámites de su entidad donde su departamento
  // tiene al menos un paso responsable
  ...
  qb.andWhere('t.codEntidadAsignada = :entidad', { entidad });
  qb.andWhere(
    `EXISTS (
      SELECT 1 FROM tramite_paso tp
      WHERE tp.cod_tramite = t.cod_tramite
        AND tp.cod_departamento_responsable = :departamento
    )`,
    { departamento },
  );
```

`funcionario` y `supervisor` reciben **exactamente la misma regla**: "mi entidad + mi departamento tiene al menos un paso en este trámite". No mira `cod_funcionario_asignado` en absoluto.

### 2.2 Acceso a detalle/timeline — `GET /:id/detalle`, `GET /:id/timeline`

Archivo: `C:\VentanillaUnica\src\modulos\privado\tramites\workflow-permission.service.ts` → `puedeVerTramite()` (líneas 36-71)

```ts
if (esFuncionarioOSupervisor(rol)) {
  if (entidad !== tramite.codEntidadAsignada) return false;
  if (!departamento) return false;

  if (tramite.pasos && tramite.pasos.length > 0) {
    return tramite.pasos.some(
      (p) => p.codDepartamentoResponsable === departamento,
    );
  }
  return true;
}
```

Misma idea: basta con que **algún** paso pertenezca a mi departamento, sin mirar quién está asignado.

### 2.3 Permiso para actuar sobre un paso — `iniciar` / `aprobar` / `devolver`

Archivo: `workflow-permission.service.ts` → `validateAccion()` (líneas 159-191)

```ts
if (esFuncionarioOSupervisor(rol)) {
  if (departamento !== paso.codDepartamentoResponsable) { ...403... }
  if (!paso.habilitado) { ...403... }
  if (
    paso.codFuncionarioAsignado &&
    paso.codFuncionarioAsignado !== usuarioId &&
    esFuncionario(rol)
  ) {
    this.throwForbidden('Este paso está asignado a otro funcionario');
  }
}
```

Puntos clave:
- Si `codFuncionarioAsignado` es `null` (nadie asignado todavía), **cualquier `funcionario` del departamento puede actuar** — la condición `paso.codFuncionarioAsignado && ...` es `false`.
- Si `codFuncionarioAsignado` está seteado y soy `funcionario` pero no soy yo → 403.
- `supervisor`/`admin` **nunca** se ven afectados por `codFuncionarioAsignado` (la condición exige `esFuncionario(rol)`).

### 2.4 Asignación de funcionario — `POST /:id/pasos/:pasoId/asignar`

Archivo: `workflow-transition.service.ts` → `asignarFuncionario()` (líneas 307-342)

- Permiso: `puedeAsignarFuncionario()` en `workflow-permission.service.ts` (líneas 127-139) → `admin` siempre, `supervisor` solo si su departamento == `paso.codDepartamentoResponsable`.
- Efecto: `paso.codFuncionarioAsignado = nuevoCod`, evento `CAMBIO_RESPONSABLE`, notificación. **No cambia `estado` ni `habilitado`** (correcto, documentado en la guía Postman fase 7).
- Es **por paso**, no por trámite. Un trámite puede tener varios pasos del mismo departamento asignados a distintos funcionarios, o algunos asignados y otros no.

### 2.5 Frontend — `/dashboard/admin/tramites` y `/dashboard/tramites`

Ambas rutas renderizan el mismo componente `DashboardGestionTramites.tsx` (`src/app/privado/funcionario/DashboardGestionTramites.tsx`):

- `/dashboard/admin/tramites` → solo `admin` ([RuteoPrincipal.tsx:66](src/ruteo/RuteoPrincipal.tsx#L66)).
- `/dashboard/tramites` → `funcionario`, `supervisor`, `visitante` ([RuteoPrincipal.tsx:71](src/ruteo/RuteoPrincipal.tsx#L71)).

Dentro del componente:
- `puedeAsignar = rol === "supervisor" || rol === "admin"` ([línea 86](src/app/privado/funcionario/DashboardGestionTramites.tsx#L86)) controla si se muestra el botón **"Asignar funcionario"** por paso.
- `confirmarAsignar()` ([líneas 230-244](src/app/privado/funcionario/DashboardGestionTramites.tsx#L230-L244)) llama a `PasosServicio.asignarFuncionario(tramiteId, pasoId, codFuncionarioAsignado)`.
- El selector de funcionarios (`abrirAsignar`, [líneas 214-228](src/app/privado/funcionario/DashboardGestionTramites.tsx#L214-L228)) llama a `UsuariosServicio.listar()` y filtra **solo por `nombre_rol === "funcionario"`** — **no filtra por entidad ni departamento**. Ver hallazgo en sección 6.
- `PasoDetalle` (en `TramitesServicio.ts`, [líneas 28-49](src/app/servicios/privados/TramitesServicio.ts#L28-L49)) **no incluye `codFuncionarioAsignado`** en su tipado, aunque el backend ya lo devuelve (es columna directa de `TramitePaso`, sin `select` restrictivo). Es solo un faltante de tipos en el frontend.

---

## 3. Comportamiento objetivo

| Rol | Antes de asignación | Después de asignación (a mí) | Después de asignación (a otro) |
|---|---|---|---|
| `funcionario` | No ve el trámite en su listado, ni detalle, ni puede actuar | Ve el trámite, su detalle, y puede actuar sobre **ese paso** | No lo ve (igual que "antes") |
| `supervisor` | Sigue viendo todos los trámites de su entidad+departamento (debe poder encontrar trámites para asignar) | Sin cambios — puede actuar siempre en su departamento | Sin cambios |
| `admin` | Sin cambios — ve todo | — | — |
| `visitante` | Sin cambios — ve todo de su entidad, solo lectura | — | — |

Es decir: **el cambio real es solo para el rol `funcionario`**. `supervisor`/`admin` necesitan seguir viendo los trámites *sin asignar* de su departamento/entidad para poder asignarlos desde `/dashboard/admin/tramites` o `/dashboard/tramites`.

---

## 4. Decisiones de diseño (confirmadas — 2026-06-11)

1. **Granularidad de "ver el trámite" para `funcionario`:** un trámite puede tener varios pasos de tu departamento, asignados a distintas personas. El `funcionario` ve el trámite completo (con todos sus pasos) si **al menos uno** de los pasos de su departamento le está asignado a él (`codFuncionarioAsignado === miUsuarioId`). Verá los demás pasos en modo lectura (sin botones de acción), igual que ahora se muestran pasos de otras etapas.

2. **Trámites recién creados (sin ningún `codFuncionarioAsignado`):** con la regla de arriba, **ningún `funcionario` los verá** hasta que un `supervisor`/`admin` asigne a alguien. El `supervisor` los seguirá viendo (regla sin cambios) y podrá asignar. Esto es justo el flujo pedido; implica que los supervisores deben revisar su listado para asignar trámites nuevos. (Mejora futura, fuera de alcance: filtro "sin asignar" en el listado del supervisor).

3. ✅ **CONFIRMADO — Bloqueo completo (Fase 3 incluida):** un `funcionario` **solo** puede actuar (`iniciar`/`aprobar`/`devolver`) si `codFuncionarioAsignado === miUsuarioId`. No basta con que el paso esté sin asignar. `supervisor`/`admin` siguen sin esta restricción.

4. **`verificarAccesoFuncionario`** (rutas legacy `/agregar`, `/update/:id`, `/delete/:id`, `tramites.service.ts` líneas 53-85): se actualiza igual que 2.1 para `funcionario`, por consistencia (Fase 4 incluida en el plan).

5. **`documentos-access.service.ts` (`puedeAccederTramite`)**: queda **fuera de alcance** de este cambio — es el hallazgo #2 completo de la auditoría, se aborda por separado.

6. ✅ **CONFIRMADO — Fase 7 incluida:** el selector de "Asignar funcionario" se filtra por `cod_departamento` (y entidad) del paso, para evitar que un supervisor asigne a alguien de otro departamento que luego quedaría bloqueado sin explicación. Requiere exponer `cod_departamento` en `GET /privado/usuarios/todos`.

---

## 5. Plan de implementación por fases

### Fase 1 — Backend: visibilidad en el listado (`tramites.service.ts`)

Archivo: `C:\VentanillaUnica\src\modulos\privado\tramites\tramites.service.ts`, método `consultar()`.

Separar la rama `esFuncionarioOSupervisor(rol)` en dos:

- `supervisor` (y `admin`, que ya tiene su propia rama): mantener la condición actual (`EXISTS ... cod_departamento_responsable = :departamento`).
- `funcionario`: agregar `AND tp.cod_funcionario_asignado = :usuarioId` a la subconsulta `EXISTS`.

```ts
} else if (esSupervisor(rol)) {
  // (regla actual sin cambios)
  qb.andWhere('t.codEntidadAsignada = :entidad', { entidad });
  qb.andWhere(`EXISTS (... cod_departamento_responsable = :departamento)`, { departamento });
} else if (esFuncionario(rol)) {
  if (!usuarioId) throw new UnauthorizedException('Usuario inválido');
  qb.andWhere('t.codEntidadAsignada = :entidad', { entidad });
  qb.andWhere(
    `EXISTS (
      SELECT 1 FROM tramite_paso tp
      WHERE tp.cod_tramite = t.cod_tramite
        AND tp.cod_departamento_responsable = :departamento
        AND tp.cod_funcionario_asignado = :usuarioId
    )`,
    { departamento, usuarioId },
  );
}
```

`esFuncionario`/`esSupervisor` ya existen en `rol.helper.ts`.

### Fase 2 — Backend: detalle/timeline (`workflow-permission.service.ts`)

Método `puedeVerTramite()` (líneas 36-71). Separar `funcionario` de `supervisor`:

```ts
if (esSupervisor(rol)) {
  if (entidad !== tramite.codEntidadAsignada) return false;
  if (!departamento) return false;
  if (tramite.pasos?.length) {
    return tramite.pasos.some((p) => p.codDepartamentoResponsable === departamento);
  }
  return true;
}

if (esFuncionario(rol)) {
  if (entidad !== tramite.codEntidadAsignada) return false;
  if (!departamento || !usuarioId) return false;
  if (tramite.pasos?.length) {
    return tramite.pasos.some(
      (p) => p.codDepartamentoResponsable === departamento && p.codFuncionarioAsignado === usuarioId,
    );
  }
  return false; // sin pasos cargados, no se puede confirmar asignación → negar por defecto
}
```

> Nota: el `return true` final del caso "pasos no cargados" para `funcionario` se cambia a `return false` (denegar) porque ya no podemos confiar en que `consultar()` filtró correctamente sin verificar asignación — y `consultarDetalle()` siempre carga `pasos`, así que esta rama es defensiva.

### Fase 3 — Backend: permiso de acción sobre un paso (`validateAccion`)

Mismo archivo, método `validateAccion()` (líneas 159-191). Cambiar la verificación de asignación:

```ts
if (esSupervisor(rol)) {
  // sin cambios: supervisor actúa libremente en su departamento
} else if (esFuncionario(rol)) {
  if (paso.codFuncionarioAsignado !== usuarioId) {
    this.throwForbidden('Este paso no te ha sido asignado. Pide a tu supervisor que te asigne.');
  }
}
```

(Se mantienen las validaciones previas de departamento y `habilitado` para ambos roles.)

### Fase 4 — Backend: alinear `verificarAccesoFuncionario`

Archivo: `tramites.service.ts`, líneas 53-85. Si se decide en el punto 4 de la sección anterior, agregar el mismo filtro `cod_funcionario_asignado = $usuarioId` para `funcionario` (mantener regla actual para `supervisor`/`admin`).

### Fase 5 — Frontend: tipado

Archivo: `src/app/servicios/privados/TramitesServicio.ts`, interfaz `PasoDetalle` (líneas 28-49). Agregar:

```ts
export interface PasoDetalle {
  codTramitePaso: number;
  codPaso: number;
  estado: EstadoPaso;
  habilitado: boolean;
  codDepartamentoResponsable: number;
  codFuncionarioAsignado?: number;   // ← nuevo
  ...
}
```

### Fase 6 — Frontend: UI de `DashboardGestionTramites.tsx`

- Con las Fases 1-3 hechas, el listado de un `funcionario` automáticamente solo mostrará trámites donde tiene un paso asignado — no se necesita lógica adicional de filtrado en el frontend.
- Para evitar que un `funcionario` vea botones de acción ("Iniciar revisión", "Aprobar", "Devolver") en pasos de su trámite que **no** le fueron asignados a él (otro paso del mismo trámite, mismo departamento, asignado a un colega), ajustar las condiciones (líneas 278-281):

```ts
const esMiPaso = rol !== "funcionario" || paso.codFuncionarioAsignado === usuario?.sub;

const puedeIniciar = puedeActuar && esMiPaso && paso.habilitado &&
  (paso.estado === "PENDIENTE" || paso.estado === "REENVIADO");
const puedeRevisar = puedeActuar && esMiPaso && paso.estado === "EN_REVISION";
```

  Esto requiere exponer `usuario.sub` desde `useUsuarioJWT()` (hoy solo trae `name`/`nombre_rol`, [línea 75](src/app/privado/funcionario/DashboardGestionTramites.tsx#L75)) — agregar `sub: number` al tipo decodificado.

- Opcional: mostrar un `Chip` "Asignado a ti" / "Asignado a {nombre}" cuando `paso.codFuncionarioAsignado` esté presente, para que el supervisor/funcionario entienda por qué no ve botones de acción en ciertos pasos.

### Fase 7 — Filtrar el selector de "Asignar funcionario" por departamento/entidad

Hoy `abrirAsignar()` ([líneas 214-228](src/app/privado/funcionario/DashboardGestionTramites.tsx#L214-L228)) lista **todos** los usuarios con rol `funcionario` del sistema (`UsuariosServicio.listar()` → `GET /privado/usuarios/todos`), sin filtrar por entidad ni departamento. Esto es un riesgo funcional independiente del cambio pedido: un supervisor podría asignar a un funcionario de **otro departamento**, que luego nunca podrá actuar sobre el paso (falla la verificación de departamento en `validateAccion`, Fase 3 sin cambios) — quedaría "asignado" pero bloqueado, sin mensaje claro.

Para resolverlo de raíz:
- Backend: agregar `eu.cod_departamento` a las consultas de `usuarios.sql.ts` (`CONSULTAR`, `CONSULTAR_ENTIDAD`) y exponerlo en la respuesta de `/privado/usuarios/todos`.
- Frontend: en `UsuarioResumen` (`UsuariosServicio.ts`, líneas 6-15) agregar `cod_departamento?: number`, y en `abrirAsignar()` filtrar además por `f.cod_departamento === paso.codDepartamentoResponsable` (y por `cod_entidad` si aplica).

> Esto no es estrictamente necesario para que el cambio principal funcione (un supervisor *puede* hoy asignar a alguien de otro departamento y sería su error), pero sin él la nueva regla "control solo si está asignado" hará que esos errores de asignación se traduzcan en "el funcionario nunca ve el trámite ni puede actuar", lo cual es más confuso de depurar que el comportamiento actual. Se recomienda incluirlo en el mismo cambio.

---

## 6. Riesgos / efectos secundarios a tener en cuenta

- **Funcionarios "huérfanos":** cualquier paso ya asignado hoy a un `codFuncionarioAsignado` de otro departamento (si existiera, por la falta de validación de la Fase 7) quedará inaccesible para ese funcionario tras la Fase 3. Vale la pena correr una consulta de verificación antes de desplegar:
  ```sql
  SELECT tp.cod_tramite_paso, tp.cod_funcionario_asignado, tp.cod_departamento_responsable, eu.cod_departamento
  FROM tramite_paso tp
  JOIN entidad_usuarios eu ON eu.cod_usuario = tp.cod_funcionario_asignado AND eu.estado = true
  WHERE tp.cod_funcionario_asignado IS NOT NULL
    AND eu.cod_departamento <> tp.cod_departamento_responsable;
  ```
- **Trámites "huérfanos" sin ningún paso asignado:** tras la Fase 1, ningún `funcionario` los verá. Si en producción ya existen trámites en curso sin `codFuncionarioAsignado`, los supervisores deberán asignarlos manualmente para que los funcionarios retomen el trabajo. Recomendado: comunicar esto antes de desplegar, o correr un script de asignación inicial (p. ej., asignar al primer funcionario del departamento por defecto) si se quiere evitar una "pausa" operativa.
- **Mensajes de error:** el nuevo 403 de la Fase 3 ("Este paso no te ha sido asignado...") debe agregarse a la tabla de "Errores comunes" de `GUIA_WORKFLOW_POSTMAN.md` una vez implementado.
- **Endpoints legacy** (`/agregar`, `/update/:id`, `/delete/:id`): si no se toca `verificarAccesoFuncionario` (Fase 4 omitida), un `funcionario` sin asignación podría seguir usando `PUT /tramites/update/:id` para un trámite de su departamento. Es el mismo CRUD huérfano marcado como pendiente en la auditoría — no es nuevo, pero queda inconsistente con las Fases 1-3 si se omite.

---

## 7. Cómo probar (manual / Postman)

Reutilizar el escenario de `GUIA_WORKFLOW_POSTMAN.md` ("Ruta de Construcción", Laura Pérez = funcionaria de Planeación):

1. Crear un nuevo trámite (Fase 3 de la guía Postman) con Carlos (ciudadano).
2. **Antes de asignar:** login como Laura → `GET /tramites/todos` no debe incluir el trámite. `GET /tramites/:id/detalle` debe responder 403.
3. Login como Juan (supervisor) → `GET /tramites/todos` **sí** debe incluir el trámite (regla sin cambios).
4. Juan asigna a Laura: `POST /tramites/:id/pasos/:pasoId/asignar { "codFuncionarioAsignado": 6 }`.
5. Laura vuelve a consultar `GET /tramites/todos` → ahora **sí** aparece el trámite. `GET /tramites/:id/detalle` → 200.
6. Laura ejecuta `POST .../pasos/:pasoId/iniciar` sobre **su** paso asignado → 200.
7. Crear un segundo funcionario del mismo departamento (sin asignar) y verificar que **no** ve el trámite ni puede actuar sobre el paso de Laura (403 "Este paso no te ha sido asignado").
8. Repetir el paso 6 con un paso del mismo trámite que **no** tenga `codFuncionarioAsignado` asignado a Laura → debe dar 403 (Fase 3).

---

## 8. Resumen de archivos a modificar

| # | Archivo | Cambio |
|---|---------|--------|
| 1 | `C:\VentanillaUnica\src\modulos\privado\tramites\tramites.service.ts` | `consultar()`: separar regla `funcionario` (filtrar por `cod_funcionario_asignado`) de `supervisor` (sin cambios) |
| 2 | `C:\VentanillaUnica\src\modulos\privado\tramites\workflow-permission.service.ts` | `puedeVerTramite()`: separar `funcionario`/`supervisor`; `validateAccion()`: exigir `codFuncionarioAsignado === usuarioId` para `funcionario` |
| 3 | `C:\VentanillaUnica\src\modulos\privado\tramites\tramites.service.ts` | `verificarAccesoFuncionario()`: alinear con #1 para `funcionario` |
| 4 | `src\app\servicios\privados\TramitesServicio.ts` | `PasoDetalle`: agregar `codFuncionarioAsignado?: number` |
| 5 | `src\app\privado\funcionario\DashboardGestionTramites.tsx` | `useUsuarioJWT`: incluir `sub`; condicionar `puedeIniciar`/`puedeRevisar` a `codFuncionarioAsignado === usuario.sub` cuando `rol === "funcionario"`; opcional: chip "Asignado a..." |
| 6 | `C:\VentanillaUnica\src\modulos\privado\usuarios\sql\usuarios.sql.ts` + `usuarios.service.ts` | Exponer `cod_departamento` en `/usuarios/todos` |
| 7 | `src\app\servicios\privados\UsuariosServicio.ts` + `DashboardGestionTramites.tsx` (`abrirAsignar`) | Filtrar funcionarios candidatos por `cod_departamento`/`cod_entidad` del paso |

**Orden sugerido:** 1 → 2 → 3 → 4 → 5 → 6 → 7, corriendo la verificación de datos existentes (sección 6) antes de desplegar, y probando el flujo completo (sección 7) al final.
