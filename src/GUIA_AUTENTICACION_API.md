# Guía de Autenticación y Acceso — VentanillaUnica API

**Base URL:** `http://localhost:{PUERTO_SERVIDOR}`  
**Versión:** 1.0 | **Actualizado:** 2026-06-04

---

## Índice

1. [Convenciones generales](#1-convenciones-generales)
2. [Estructura del JWT](#2-estructura-del-jwt)
3. [Reglas de contraseña](#3-reglas-de-contraseña)
4. [Rate limiting](#4-rate-limiting)
5. [Roles del sistema](#5-roles-del-sistema)
6. [Registro de cuenta pública](#6-post-publicoregistrosuser)
7. [Inicio de sesión](#7-post-publicoauthlogin)
8. [Recuperar contraseña](#8-post-publicoregistrosrecuperar-password)
9. [Restablecer contraseña con token](#9-patch-publicoregistrosnueva-password)
10. [Cambiar contraseña (autenticado)](#10-patch-publicoregistroscambiar-password)
11. [Crear usuario desde admin](#11-post-privatousuariosimgr)
12. [Asignar entidad a usuario](#12-put-privatousuariosasignar-entidadid)
13. [Tabla de eventos de auditoría](#13-tabla-de-eventos-de-auditoría)
14. [Códigos de error comunes](#14-códigos-de-error-comunes)

---

## 1. Convenciones generales

### Autenticación

Todos los endpoints privados requieren el token en el header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Prefijos de ruta

| Prefijo | Descripción |
|---------|-------------|
| `/publico/` | Sin autenticación — acceso libre |
| `/privado/` | Requiere JWT válido |

### Formato de respuesta de error

```json
{
  "message": "Descripción del error",
  "statusCode": 400,
  "error": "Bad Request"
}
```

### `ValidationPipe` global

El servidor rechaza con **HTTP 400** cualquier campo no declarado en el DTO (`forbidNonWhitelisted: true`). No envíes campos extra.

---

## 2. Estructura del JWT

El token es un JWT firmado con HS256. Al decodificarlo (sin verificar firma) el payload contiene:

```json
{
  "jti": "a4f2c8d1-9b3e-4f1a-8c7d-2e5f0b6a1d3c",
  "sub": 12,
  "name": "Carlos Andrés Pérez",
  "nombre_rol": "ciudadano",
  "cod_entidad": null,
  "cod_departamento": null,
  "iat": 1748995200,
  "exp": 1748998800
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `jti` | `string` (UUID) | Identificador único del token — preparado para revocación futura |
| `sub` | `number` | ID del usuario (`cod_usuario`) |
| `name` | `string` | Nombre completo del usuario |
| `nombre_rol` | `string` | Rol activo: `admin`, `supervisor`, `funcionario`, `ciudadano`, `visitante` |
| `cod_entidad` | `number \| null` | Entidad activa del usuario. `null` si es ciudadano sin entidad asignada |
| `cod_departamento` | `number \| null` | Departamento del usuario. `null` si no aplica |
| `iat` | `number` | Timestamp de emisión (Unix seconds) |
| `exp` | `number` | Timestamp de expiración (Unix seconds) |

> **Nota:** El TTL del token se controla con la variable de entorno `JWT_TTL` (default `1h`). Configurable por entorno.

### Evolución del JWT tras asignación de entidad

Un ciudadano que es asignado a una entidad debe hacer **login nuevamente** para recibir el JWT actualizado:

```json
// ANTES de asignación
{
  "nombre_rol": "ciudadano",
  "cod_entidad": null,
  "cod_departamento": null
}

// DESPUÉS de asignación + nuevo login
{
  "nombre_rol": "funcionario",
  "cod_entidad": 5,
  "cod_departamento": 3
}
```

> **`cod_departamento` es crítico para el workflow.** El sistema solo muestra al funcionario los trámites donde su departamento tiene pasos responsables. Sin `cod_departamento`, el funcionario no podrá ver ni actuar en ningún trámite.

---

## 3. Reglas de contraseña

Aplica a todos los endpoints que reciben o modifican contraseñas:

| Regla | Detalle |
|-------|---------|
| Longitud mínima | 8 caracteres |
| Longitud máxima | 128 caracteres |
| Mayúscula | Al menos 1 (`A–Z`) |
| Minúscula | Al menos 1 (`a–z`) |
| Número | Al menos 1 (`0–9`) |
| Carácter especial | Al menos 1 de: `@ $ ! % * ? &` |

**Ejemplos válidos:**
- `MiClave@123`
- `Segura$2024!`
- `VentanillaUnica@1`

**Ejemplos inválidos:**
- `password123` — sin mayúscula ni especial
- `CLAVE@ABC` — sin número
- `Mi@1` — muy corta

> **Excepción:** El endpoint `POST /privado/usuarios/agregar` no aplica la validación de complejidad en el DTO. Se recomienda usar contraseñas complejas igualmente.

---

## 4. Rate limiting

El sistema limita los intentos de login fallidos **por username y por IP simultáneamente**.

| Parámetro | Valor |
|-----------|-------|
| Máximo de intentos | 5 por ventana de tiempo |
| Ventana de tiempo | 15 minutos |
| Limpieza automática | Cada 5 minutos |
| Respuesta al superar | HTTP 429 |

El contador se **resetea automáticamente** cuando el login es exitoso.

> **Importante:** El rate limiting es en memoria. Si el servidor se reinicia, los contadores se pierden. Para producción con múltiples instancias se recomienda migrar a Redis.

---

## 5. Roles del sistema

| Rol | `cod_rol` | `nombre_rol` | Descripción |
|-----|-----------|--------------|-------------|
| Administrador | 1 | `admin` | Acceso total al sistema |
| Supervisor | 2 | `supervisor` | Gestiona usuarios y trámites de su entidad y departamento |
| Funcionario | 3 | `funcionario` | Revisa documentos y pasos de su entidad y departamento |
| Ciudadano | 4 | `ciudadano` | Crea trámites y sube documentos |
| Visitante | 5 | `visitante` | Consultor externo — solo lectura de todos los trámites de su entidad |

> **Funcionario y supervisor:** solo ven y pueden actuar sobre los trámites donde su `cod_departamento` es responsable de al menos un paso. Un funcionario de Hacienda no ve los trámites de Planeación aunque trabajen en la misma entidad.

> **El `cod_rol` es la única fuente de verdad de acceso.** Todos los guards del sistema usan exclusivamente `nombre_rol` del JWT para decidir qué puede hacer el usuario.

### Elevación automática de rol al asignar entidad

Cuando un admin asigna una entidad a un usuario, el sistema eleva el `cod_rol` si el nuevo rol tiene mayor privilegio. **El rol nunca baja** (menor número = mayor privilegio):

```
ciudadano (4)   + codRol: 3 → funcionario (3)
ciudadano (4)   + codRol: 2 → supervisor (2)
ciudadano (4)   + codRol: 5 → visitante (5)
funcionario (3) + codRol: 2 → supervisor (2)
supervisor (2)  + codRol: 3 → supervisor (2) — sin cambio
```

---

## 6. `POST /publico/registros/user`

Registro de cuenta pública. No requiere autenticación. Genera JWT al completarse.

### Persona Natural

```http
POST /publico/registros/user
Content-Type: application/json

{
  "tipoPersona": "NATURAL",
  "nombreUsuario": "Carlos Andrés Pérez",
  "telefonoUsuario": "3001234567",
  "correoUsuario": "carlos.perez@gmail.com",
  "claveAcceso": "MiClave@123",
  "cedula": "1023456789",
  "fechaNacimientoUsuario": "1992-05-15",
  "sexoBiologico": 1,
  "ciudadNacimientoId": 1,
  "barrioResidenciaId": 3,
  "direccionResidencia": "Calle 45 # 12-30, Apto 201"
}
```

### Persona Jurídica

```http
POST /publico/registros/user
Content-Type: application/json

{
  "tipoPersona": "JURIDICA",
  "nombreUsuario": "Constructora ABC S.A.S.",
  "telefonoUsuario": "6012345678",
  "correoUsuario": "contacto@constructoraabc.com",
  "claveAcceso": "Empresa@456",
  "razonSocial": "Constructora ABC S.A.S.",
  "nit": "900123456-1",
  "representanteLegal": "María Lucía Torres",
  "tipoEmpresa": "Sociedad por Acciones Simplificada"
}
```

### Campos por tipo de persona

| Campo | Tipo | `NATURAL` | `JURIDICA` | Restricciones |
|-------|------|-----------|------------|---------------|
| `tipoPersona` | `string` | Requerido | Requerido | `"NATURAL"` o `"JURIDICA"` |
| `nombreUsuario` | `string` | Requerido | Requerido | 2–100 chars |
| `telefonoUsuario` | `string` | Requerido | Requerido | 7–15 chars |
| `correoUsuario` | `string` | Requerido | Requerido | Email válido, único |
| `claveAcceso` | `string` | Requerido | Requerido | Ver [Reglas de contraseña](#3-reglas-de-contraseña) |
| `cedula` | `string` | Requerido | — | 7–20 chars, única |
| `fechaNacimientoUsuario` | `string` | Requerido | — | Formato `YYYY-MM-DD` |
| `sexoBiologico` | `number` | Requerido | — | `1` = Masculino, `2` = Femenino |
| `ciudadNacimientoId` | `number` | Requerido | — | ID de ciudad en BD |
| `barrioResidenciaId` | `number` | Requerido | — | ID de barrio en BD |
| `direccionResidencia` | `string` | Requerido | — | 5–500 chars |
| `razonSocial` | `string` | — | Requerido | 3–250 chars |
| `nit` | `string` | — | Requerido | 9–20 chars, único |
| `representanteLegal` | `string` | — | Requerido | 3–250 chars |
| `tipoEmpresa` | `string` | — | Requerido | 3–100 chars |

### Respuesta exitosa — HTTP 201

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "mensaje": "Registro exitoso. Tu cuenta ha sido creada como ciudadano (NATURAL). Un administrador te asignará una entidad próximamente."
}
```

### Errores

| HTTP | Mensaje | Causa |
|------|---------|-------|
| 400 | `"tipoPersona must be one of the following values..."` | `tipoPersona` inválido |
| 400 | `"La contraseña debe contener..."` | Contraseña no cumple reglas |
| 400 | `"correoUsuario must be an email"` | Correo con formato inválido |
| 406 | `"El correo ya está registrado"` | Correo duplicado |
| 406 | `"La cédula ya está registrada"` | Cédula duplicada |
| 406 | `"El NIT ya está registrado"` | NIT duplicado |
| 406 | `"La ciudad de nacimiento no existe"` | `ciudadNacimientoId` inexistente |
| 406 | `"El barrio de residencia no existe"` | `barrioResidenciaId` inexistente |
| 500 | `"Error interno al procesar el registro"` | Error de servidor |

---

## 7. `POST /publico/auth/login`

Inicio de sesión. No requiere autenticación previa.

```http
POST /publico/auth/login
Content-Type: application/json

{
  "username": "carlos.perez@gmail.com",
  "claveAcceso": "MiClave@123"
}
```

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `username` | `string` | Correo electrónico registrado (debe ser email válido) |
| `claveAcceso` | `string` | Contraseña del usuario |

### Respuesta exitosa — HTTP 200

```json
{
  "mensaje": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Errores

| HTTP | Mensaje | Causa |
|------|---------|-------|
| 400 | `"username must be an email"` | `username` no es un email válido |
| 401 | `"Credenciales inválidas"` | Usuario no existe, cuenta inactiva o contraseña incorrecta |
| 429 | `"Demasiados intentos fallidos. Intente más tarde."` | Rate limit superado (5 intentos / 15 min) |

> **Seguridad:** El mensaje `"Credenciales inválidas"` es genérico intencionalmente — no se distingue entre usuario inexistente, inactivo o contraseña incorrecta (anti-enumeración).

---

## 8. `POST /publico/registros/recuperar-password`

Solicita un enlace de restablecimiento de contraseña. No requiere autenticación. Envía un correo con un token de un solo uso válido por **15 minutos**.

Si el usuario tiene solicitudes de restablecimiento previas pendientes, son **invalidadas automáticamente** al generar la nueva.

```http
POST /publico/registros/recuperar-password
Content-Type: application/json

{
  "correoUsuario": "carlos.perez@gmail.com"
}
```

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `correoUsuario` | `string` | Correo de la cuenta a recuperar |

### Respuesta exitosa — HTTP 200

```json
{
  "mensaje": "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña."
}
```

> **Nota:** La respuesta es idéntica si el correo existe o no. Esto evita que un atacante pueda enumerar qué correos están registrados en el sistema.

El enlace enviado al correo tiene el formato:
```
{FRONTEND_URL}/reset-password/{token_uuid}
```

### Errores

| HTTP | Mensaje | Causa |
|------|---------|-------|
| 400 | `"correoUsuario must be an email"` | Formato de correo inválido |

---

## 9. `PATCH /publico/registros/nueva-password`

Restablece la contraseña usando el token recibido por correo. El token es de **un solo uso** y expira en **15 minutos**.

```http
PATCH /publico/registros/nueva-password
Content-Type: application/json

{
  "token": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "nuevaClave": "NuevaClave@2024"
}
```

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `token` | `string` | UUID recibido en el correo de recuperación |
| `nuevaClave` | `string` | Nueva contraseña. Ver [Reglas de contraseña](#3-reglas-de-contraseña) |

### Respuesta exitosa — HTTP 200

```json
{
  "mensaje": "Contraseña actualizada correctamente"
}
```

### Errores

| HTTP | Mensaje | Causa |
|------|---------|-------|
| 400 | `"La contraseña debe contener..."` | Nueva clave no cumple las reglas |
| 400 | `"La nueva contraseña no puede ser igual a la actual"` | Se intentó reutilizar la contraseña actual |
| 401 | `"Token inválido o ya utilizado"` | Token no existe o ya fue usado |
| 401 | `"Token expirado"` | Han pasado más de 15 minutos desde la solicitud |

---

## 10. `PATCH /publico/registros/cambiar-password`

Cambia la contraseña del usuario autenticado. Requiere JWT válido y la contraseña actual para confirmar la identidad.

```http
PATCH /publico/registros/cambiar-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "claveActual": "MiClave@123",
  "nuevaClave": "NuevaClave@2024"
}
```

### Campos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `claveActual` | `string` | Contraseña vigente del usuario |
| `nuevaClave` | `string` | Nueva contraseña. Ver [Reglas de contraseña](#3-reglas-de-contraseña) |

### Respuesta exitosa — HTTP 200

```json
{
  "mensaje": "Contraseña cambiada correctamente"
}
```

### Errores

| HTTP | Mensaje | Causa |
|------|---------|-------|
| 400 | `"La contraseña debe contener..."` | Nueva clave no cumple las reglas |
| 400 | `"Contraseña actual incorrecta"` | `claveActual` no coincide |
| 400 | `"La nueva contraseña no puede ser igual a la actual"` | Se intentó reutilizar la misma contraseña |
| 401 | `"Token no enviado"` | Falta el header `Authorization` |
| 401 | `"Token inválido"` | JWT malformado, expirado o firma incorrecta |
| 404 | `"Usuario no encontrado"` | El usuario del JWT no existe en BD |

> **Seguridad:** Un cambio de contraseña exitoso queda registrado en la tabla `access_logs` con el evento `PASSWORD_CHANGE`. Los tokens JWT activos emitidos **antes** del cambio siguen siendo válidos hasta su expiración natural.

---

## 11. `POST /privado/usuarios/agregar`

Crea un usuario (funcionario, supervisor o visitante) directamente desde el panel administrativo. Requiere JWT de admin o supervisor.

### Crear funcionario (admin o supervisor)

```http
POST /privado/usuarios/agregar
Authorization: Bearer {token_admin_o_supervisor}
Content-Type: application/json

{
  "codRol": 3,
  "nombreUsuario": "Laura Milena García",
  "fechaNacimientoUsuario": "1988-11-22",
  "telefonoUsuario": "3117654321",
  "sexoBiologico": 2,
  "cedula": "52987654",
  "correoUsuario": "laura.garcia@entidad.gov.co",
  "claveAcceso": "Func@2024!",
  "codEntidad": 5,
  "codDepartamento": 3,
  "cargo": "Auxiliar de Ventanilla"
}
```

### Crear supervisor (solo admin)

```http
POST /privado/usuarios/agregar
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "codRol": 2,
  "nombreUsuario": "Jorge Enrique Molina",
  "fechaNacimientoUsuario": "1975-03-10",
  "telefonoUsuario": "3209876543",
  "sexoBiologico": 1,
  "cedula": "79123456",
  "correoUsuario": "jorge.molina@entidad.gov.co",
  "claveAcceso": "Super@2024!",
  "codEntidad": 5,
  "codDepartamento": 3,
  "cargo": "Supervisor de Ventanilla Única"
}
```

### Campos

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `codRol` | `number` | Sí | `2` = Supervisor, `3` = Funcionario, `5` = Visitante |
| `nombreUsuario` | `string` | Sí | Nombre completo |
| `fechaNacimientoUsuario` | `string` | Sí | Formato `YYYY-MM-DD` |
| `telefonoUsuario` | `string` | Sí | Teléfono de contacto |
| `sexoBiologico` | `number` | Sí | `1` = Masculino, `2` = Femenino |
| `cedula` | `string` | Sí | 6–20 chars, única en el sistema |
| `correoUsuario` | `string` | Sí | Email válido, único en el sistema |
| `claveAcceso` | `string` | Sí | Mínimo 6 chars |
| `codEntidad` | `number` | Sí | ID de la entidad donde trabajará |
| `cargo` | `string` | Sí | Cargo descriptivo, 3–100 chars |
| `codDepartamento` | `number` | Recomendado | Departamento dentro de la entidad. Sin este campo el funcionario no podrá ver ni actuar en ningún trámite del workflow |
| `codCiudadNacimiento` | `number` | No | ID de ciudad |
| `codBarrioResidencia` | `number` | No | ID de barrio |
| `direccionResidencia` | `string` | No | 5–500 chars |

> **Nota sobre `codDepartamento` en este endpoint:** al crear un usuario directamente, el departamento es opcional en el DTO. Sin embargo, **si el usuario va a interactuar con trámites, el departamento es obligatorio en la práctica.** La forma recomendada es incluirlo aquí o usar `PUT /asignar-entidad/:id` después (que sí lo exige).

### Restricciones por rol del solicitante

| Quien llama | `codRol` permitido | `codEntidad` permitida |
|-------------|-------------------|----------------------|
| Admin | 2, 3 o 5 | Cualquiera |
| Supervisor | Solo 3 | Solo la suya |

### Respuesta exitosa — HTTP 201

```json
{
  "mensaje": "Usuario registrado correctamente",
  "usuario": {
    "codUsuario": 25,
    "nombreUsuario": "Laura Milena García",
    "correoUsuario": "laura.garcia@entidad.gov.co"
  }
}
```

### Errores

| HTTP | Mensaje | Causa |
|------|---------|-------|
| 401 | `"Token no enviado"` | Falta el header `Authorization` |
| 401 | `"Token inválido"` | JWT expirado o malformado |
| 403 | `"No tienes permiso para crear usuarios"` | El usuario es ciudadano |
| 403 | `"Solo puedes crear usuarios en tu entidad"` | Supervisor intentando crear en otra entidad |
| 403 | `"Un supervisor solo puede crear funcionarios"` | Supervisor intentando asignar `codRol` 2 o 1 |
| 409 | `"La cédula ya existe"` | Cédula duplicada |
| 409 | `"El correo ya existe"` | Correo duplicado |
| 500 | `"Error al registrar usuario"` | Error de servidor |

---

## 12. `PUT /privado/usuarios/asignar-entidad/:id`

Vincula a un usuario existente con una entidad y un departamento dentro de ella. El `codRol` determina directamente qué puede hacer el usuario en el sistema. Solo accesible para admin.

### Asignar como funcionario

```http
PUT /privado/usuarios/asignar-entidad/12
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "codEntidad": 5,
  "codDepartamento": 3,
  "cargo": "Revisor de Documentos",
  "codRol": 3
}
```

### Asignar como supervisor

```http
PUT /privado/usuarios/asignar-entidad/12
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "codEntidad": 5,
  "codDepartamento": 3,
  "cargo": "Jefe de Ventanilla",
  "codRol": 2
}
```

### Asignar como visitante (solo lectura)

```http
PUT /privado/usuarios/asignar-entidad/30
Authorization: Bearer {token_admin}
Content-Type: application/json

{
  "codEntidad": 5,
  "codDepartamento": 3,
  "cargo": "Consultor Externo",
  "codRol": 5
}
```

### Parámetros de ruta

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `:id` | `number` | `cod_usuario` del usuario a asignar |

### Campos del body

| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| `codEntidad` | `number` | Sí | ID de la entidad a asignar |
| `codDepartamento` | `number` | Sí | ID del departamento dentro de esa entidad |
| `cargo` | `string` | Sí | Cargo descriptivo, 3–100 chars |
| `codRol` | `number` | Sí | `2` = supervisor, `3` = funcionario, `5` = visitante |

> **`codDepartamento` es obligatorio.** Es el dato que fluye al JWT y permite a los guards del workflow verificar que el funcionario pertenece al departamento responsable del paso.

### Respuesta exitosa — HTTP 200

```json
{
  "mensaje": "Usuario vinculado en Secretaría de Hacienda — Departamento de Planeación",
  "usuario": {
    "codUsuario": 12,
    "nombreUsuario": "Carlos Andrés Pérez",
    "cedula": "1023456789",
    "rolActual": "funcionario",
    "departamento": "Departamento de Planeación",
    "vinculoCreado": {
      "entidad": "Secretaría de Hacienda",
      "cargo": "Revisor de Documentos",
      "fechaAsignacion": "2026-06-04T15:30:00.000Z"
    }
  }
}
```

### Comportamiento de elevación de rol

Después de la asignación el usuario debe **hacer login nuevamente** para recibir el JWT con el rol y entidad actualizados. El rol **nunca baja** (menor número = mayor privilegio):

| Estado anterior | `codRol` enviado | Rol resultante |
|-----------------|------------------|----------------|
| ciudadano (4) | `3` | funcionario (3) |
| ciudadano (4) | `2` | supervisor (2) |
| ciudadano (4) | `5` | visitante (5) |
| funcionario (3) | `2` | supervisor (2) |
| supervisor (2) | `3` | supervisor (2) — sin cambio |

### Errores

| HTTP | Mensaje | Causa |
|------|---------|-------|
| 400 | `"No se puede asignar entidad a un administrador"` | El usuario es admin |
| 400 | `"codRol debe ser: 2 (supervisor) \| 3 (funcionario) \| 5 (visitante)"` | Valor de `codRol` no permitido |
| 400 | `"El departamento no pertenece a la entidad indicada"` | Departamento de otra entidad |
| 404 | `"Usuario no encontrado"` | El `:id` no existe |
| 404 | `"La entidad especificada no existe"` | `codEntidad` no existe |
| 404 | `"El departamento especificado no existe"` | `codDepartamento` no existe |
| 409 | `"El usuario ya tiene un vínculo activo con esta entidad"` | Vínculo duplicado para la misma entidad |

---

## 13. Tabla de eventos de auditoría

Cada acción de autenticación queda registrada en la tabla `access_logs`. Los eventos registrados son:

| Evento (`event`) | Cuándo se genera | Incluye `userId` |
|-----------------|-----------------|------------------|
| `LOGIN_SUCCESS` | Login correcto | Sí |
| `LOGIN_FAIL` | Credenciales incorrectas, cuenta inactiva o rate limit | Solo si el usuario fue encontrado |
| `REGISTER` | Registro público completado | Sí |
| `PASSWORD_RESET_REQUEST` | Solicitud de recuperación de contraseña | Sí |
| `PASSWORD_RESET_SUCCESS` | Contraseña restablecida con token | Sí |
| `PASSWORD_CHANGE` | Cambio de contraseña autenticado (éxito o fallo) | Sí |

Todos los eventos registran:
- `ip` — IP real del cliente
- `userId` — ID del usuario (string) si aplica
- `event` — Tipo de evento
- `details` — Descripción textual del evento
- `createdAt` — Timestamp automático

---

## 14. Códigos de error comunes

| HTTP | Nombre | Cuándo ocurre en auth |
|------|--------|-----------------------|
| 400 | Bad Request | Validación de DTO fallida (campo faltante, formato incorrecto) |
| 401 | Unauthorized | Token ausente, inválido o expirado; credenciales incorrectas |
| 403 | Forbidden | Token válido pero sin permiso para la acción |
| 404 | Not Found | Recurso no encontrado (usuario, entidad, token de reset) |
| 406 | Not Acceptable | Conflicto de unicidad en registro (correo, cédula, NIT duplicados) |
| 409 | Conflict | Conflicto de unicidad en creación por admin; vínculo duplicado |
| 429 | Too Many Requests | Rate limit superado en login |
| 500 | Internal Server Error | Error inesperado del servidor |

---

## Flujo completo — Ciudadano que se convierte en funcionario

```
1. Ciudadano se registra
   POST /publico/registros/user
   → JWT: { nombre_rol: "ciudadano", cod_entidad: null, cod_departamento: null }

2. Ciudadano usa el sistema como ciudadano (crea trámites, sube documentos)

3. Admin lo asigna a una entidad con departamento y rol
   PUT /privado/usuarios/asignar-entidad/12
   { codEntidad: 5, codDepartamento: 3, cargo: "Auxiliar", codRol: 3 }
   → cod_rol = 3 (funcionario) guardado en BD
   → cod_departamento = 3 (Planeación) guardado en BD

4. Funcionario hace login nuevamente
   POST /publico/auth/login
   → JWT: { nombre_rol: "funcionario", cod_entidad: 5, cod_departamento: 3 }

5. Funcionario ve solo los trámites donde su departamento (3) tiene pasos responsables
   GET /privado/tramites/todos
   → El sistema filtra: solo trámites con EXISTS(tramite_paso WHERE cod_departamento_responsable = 3)

6. Funcionario puede iniciar revisión, aprobar o devolver los pasos de su departamento
   POST /privado/tramites/1/pasos/1/aprobar
   → validateAccion() verifica: cod_departamento(3) = paso.codDepartamentoResponsable(3) ✓
```

---

*Generado para VentanillaUnica — NestJS + TypeORM + PostgreSQL*
