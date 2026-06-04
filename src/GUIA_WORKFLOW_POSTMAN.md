# Guía de Workflow en Postman — VentanillaUnica
## Ruta de Construcción: ejemplos completos de uso

**Base URL:** `http://localhost:{PUERTO_SERVIDOR}`  
**Actualizado:** 2026-06-04

---

## Escenario de referencia

Este documento usa el workflow **"Ruta de Construcción"** como ejemplo concreto:

```
Workflow: Ruta de Construcción
└── Etapa 1: Concepto de verificación de licencias de construcción
    ├── Paso 1: Diligenciamiento del formato PDT-PDFT-002  (ciudadano sube documento)
    ├── Paso 2: Verificación técnica de planos              (funcionario revisa)
    └── Paso 3: Concepto de norma urbanística              (funcionario revisa)
```

### Actores del escenario

| Actor | Rol | Entidad | Departamento |
|-------|-----|---------|--------------|
| Admin | `admin` | — | — |
| Juan García | `supervisor` | Alcaldía Mayor de Tunja (id: 1) | Dpto. Planeación (id: 3) |
| Laura Pérez | `funcionario` | Alcaldía Mayor de Tunja (id: 1) | Dpto. Planeación (id: 3) |
| Carlos Soto | `ciudadano` | — | — |
| Ana Rojas | `visitante` | Alcaldía Mayor de Tunja (id: 1) | Dpto. Planeación (id: 3) |

> **Visitante:** consultor externo o ente de control que puede revisar el estado de los trámites de la entidad pero no puede crear ni actuar sobre ningún paso.

---

## Configuración de variables en Postman

En tu collection de Postman, configura estas variables:

| Variable | Valor |
|----------|-------|
| `BASE_URL` | `http://localhost:3000` |
| `TOKEN_ADMIN` | *(se obtiene al hacer login)* |
| `TOKEN_SUPERVISOR` | *(se obtiene al hacer login)* |
| `TOKEN_FUNCIONARIO` | *(se obtiene al hacer login)* |
| `TOKEN_CIUDADANO` | *(se obtiene al hacer login)* |
| `TOKEN_VISITANTE` | *(se obtiene al hacer login)* |
| `WORKFLOW_ID` | *(se obtiene al crear el workflow)* |
| `ETAPA_ID` | *(se obtiene al crear la etapa)* |
| `TRAMITE_ID` | *(se obtiene al iniciar el trámite)* |
| `PASO_PDT_ID` | *(id del paso PDT-PDFT-002 en el trámite)* |

---

## Índice

1. [Fase 0 — Logins](#fase-0--logins)
2. [Fase 1 — Admin crea el workflow](#fase-1--admin-crea-el-workflow)
3. [Fase 2 — Admin asigna funcionarios a entidad y departamento](#fase-2--admin-asigna-funcionarios-a-entidad-y-departamento)
4. [Fase 3 — Ciudadano inicia el trámite](#fase-3--ciudadano-inicia-el-trámite)
5. [Fase 4 — Ciudadano sube el documento PDT-PDFT-002](#fase-4--ciudadano-sube-el-documento-pdt-pdft-002)
6. [Fase 5 — Funcionario revisa, aprueba o devuelve](#fase-5--funcionario-revisa-aprueba-o-devuelve)
7. [Fase 6 — Ciudadano subsana y reenvía](#fase-6--ciudadano-subsana-y-reenvía)
8. [Fase 7 — Supervisor asigna funcionario a un paso](#fase-7--supervisor-asigna-funcionario-a-un-paso)
9. [Fase 8 — Consultas y seguimiento](#fase-8--consultas-y-seguimiento)
10. [Máquina de estados](#máquina-de-estados)
11. [Errores comunes](#errores-comunes)

---

## Fase 0 — Logins

### Login administrador

```http
POST {{BASE_URL}}/publico/auth/login
Content-Type: application/json

{
  "username": "admin@ventanilla.local",
  "claveAcceso": "Admin123!"
}
```

**Respuesta:**
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```
> Guardar el token en la variable `TOKEN_ADMIN`.

---

### Login supervisor

```http
POST {{BASE_URL}}/publico/auth/login
Content-Type: application/json

{
  "username": "juan.garcia@alcaldia.gov.co",
  "claveAcceso": "Superv@2024!"
}
```
> Guardar el token en `TOKEN_SUPERVISOR`.

---

### Login funcionario

```http
POST {{BASE_URL}}/publico/auth/login
Content-Type: application/json

{
  "username": "laura.perez@alcaldia.gov.co",
  "claveAcceso": "Func@2024!"
}
```
> Guardar el token en `TOKEN_FUNCIONARIO`.

---

### Login ciudadano

```http
POST {{BASE_URL}}/publico/auth/login
Content-Type: application/json

{
  "username": "carlos.soto@gmail.com",
  "claveAcceso": "Ciudad@2024!"
}
```
> Guardar el token en `TOKEN_CIUDADANO`.

---

### Login visitante

```http
POST {{BASE_URL}}/publico/auth/login
Content-Type: application/json

{
  "username": "ana.rojas@contraloria.gov.co",
  "claveAcceso": "Visit@2024!"
}
```
> Guardar el token en `TOKEN_VISITANTE`.

---

## Fase 1 — Admin crea el workflow

### 1.1 Crear el workflow

```http
POST {{BASE_URL}}/privado/workflows
Authorization: Bearer {{TOKEN_ADMIN}}
Content-Type: application/json

{
  "codigo": "RUTA-CONST-001",
  "nombre": "Ruta de Construcción",
  "descripcion": "Proceso de verificación de licencias de construcción en el municipio",
  "activo": true
}
```

**Respuesta:**
```json
{
  "codWorkflow": 1,
  "codigo": "RUTA-CONST-001",
  "nombre": "Ruta de Construcción",
  "descripcion": "Proceso de verificación de licencias de construcción en el municipio",
  "activo": true
}
```
> Guardar `codWorkflow` → `WORKFLOW_ID = 1`

---

### 1.2 Crear la etapa

```http
POST {{BASE_URL}}/privado/workflows/{{WORKFLOW_ID}}/etapas
Authorization: Bearer {{TOKEN_ADMIN}}
Content-Type: application/json

{
  "nombre": "Concepto de verificación de licencias de construcción",
  "codDepartamentoResponsable": 3,
  "descripcion": "Revisión inicial de documentos y verificación de requisitos para licencia",
  "orden": 1
}
```

**Respuesta:**
```json
{
  "codEtapa": 1,
  "codWorkflow": 1,
  "nombre": "Concepto de verificación de licencias de construcción",
  "codDepartamentoResponsable": 3,
  "descripcion": "Revisión inicial de documentos y verificación de requisitos para licencia",
  "orden": 1
}
```
> Guardar `codEtapa` → `ETAPA_ID = 1`

> **Importante:** `codDepartamentoResponsable: 3` es el departamento de Planeación. Solo los funcionarios asignados a ese departamento podrán actuar sobre los pasos de esta etapa.

---

### 1.3 Crear Paso 1 — PDT-PDFT-002 (lo llena el ciudadano)

```http
POST {{BASE_URL}}/privado/workflows/{{WORKFLOW_ID}}/etapas/{{ETAPA_ID}}/pasos
Authorization: Bearer {{TOKEN_ADMIN}}
Content-Type: application/json

{
  "codigo": "PDT-PDFT-002",
  "nombre": "Diligenciamiento del formato PDT-PDFT-002",
  "descripcion": "El ciudadano debe subir el formulario PDT-PDFT-002 diligenciado y firmado",
  "canal": "VIRTUAL",
  "slaDias": 5,
  "ordenVisual": 1,
  "requiereDocumentos": true,
  "permiteSubsanacion": true,
  "visibleCiudadano": true,
  "activo": true
}
```

**Respuesta:**
```json
{
  "codPaso": 1,
  "codWorkflow": 1,
  "codEtapa": 1,
  "codigo": "PDT-PDFT-002",
  "nombre": "Diligenciamiento del formato PDT-PDFT-002",
  "canal": "VIRTUAL",
  "slaDias": 5,
  "ordenVisual": 1,
  "requiereDocumentos": true,
  "permiteSubsanacion": true,
  "visibleCiudadano": true,
  "activo": true
}
```

---

### 1.4 Crear Paso 2 — Verificación técnica de planos

```http
POST {{BASE_URL}}/privado/workflows/{{WORKFLOW_ID}}/etapas/{{ETAPA_ID}}/pasos
Authorization: Bearer {{TOKEN_ADMIN}}
Content-Type: application/json

{
  "codigo": "VERIF-PLANOS-001",
  "nombre": "Verificación técnica de planos",
  "descripcion": "El funcionario verifica que los planos cumplan con las normas técnicas vigentes",
  "canal": "VIRTUAL",
  "slaDias": 10,
  "ordenVisual": 2,
  "requiereDocumentos": false,
  "permiteSubsanacion": true,
  "visibleCiudadano": true,
  "activo": true
}
```

---

### 1.5 Crear Paso 3 — Concepto de norma urbanística

```http
POST {{BASE_URL}}/privado/workflows/{{WORKFLOW_ID}}/etapas/{{ETAPA_ID}}/pasos
Authorization: Bearer {{TOKEN_ADMIN}}
Content-Type: application/json

{
  "codigo": "NORMA-URB-001",
  "nombre": "Concepto de norma urbanística",
  "descripcion": "El funcionario emite concepto sobre si el proyecto cumple la norma urbanística",
  "canal": "VIRTUAL",
  "slaDias": 10,
  "ordenVisual": 3,
  "requiereDocumentos": false,
  "permiteSubsanacion": false,
  "visibleCiudadano": true,
  "activo": true
}
```

### 1.6 Verificar el workflow completo

```http
GET {{BASE_URL}}/privado/workflows/{{WORKFLOW_ID}}
Authorization: Bearer {{TOKEN_ADMIN}}
```

**Respuesta:**
```json
{
  "codWorkflow": 1,
  "codigo": "RUTA-CONST-001",
  "nombre": "Ruta de Construcción",
  "activo": true,
  "etapas": [
    {
      "codEtapa": 1,
      "nombre": "Concepto de verificación de licencias de construcción",
      "orden": 1,
      "codDepartamentoResponsable": 3
    }
  ],
  "pasos": [
    { "codPaso": 1, "codigo": "PDT-PDFT-002", "ordenVisual": 1, "requiereDocumentos": true },
    { "codPaso": 2, "codigo": "VERIF-PLANOS-001", "ordenVisual": 2 },
    { "codPaso": 3, "codigo": "NORMA-URB-001", "ordenVisual": 3 }
  ]
}
```

---

## Fase 2 — Admin asigna usuarios a entidad y departamento

> **Por qué este paso es crítico:** `codDepartamento` viaja en el JWT. Los pasos de la Etapa 1 tienen `codDepartamentoResponsable: 3`. Solo usuarios con ese departamento en su JWT podrán actuar sobre esos pasos.  
> El campo `codRol` es la fuente de verdad: `2` = supervisor, `3` = funcionario, `5` = visitante.

### 2.1 Asignar Juan García como supervisor (`codRol: 2`)

```http
PUT {{BASE_URL}}/privado/usuarios/asignar-entidad/{{ID_USUARIO_JUAN}}
Authorization: Bearer {{TOKEN_ADMIN}}
Content-Type: application/json

{
  "codEntidad": 1,
  "codDepartamento": 3,
  "cargo": "Supervisor de Planeación",
  "codRol": 2
}
```

**Respuesta:**
```json
{
  "mensaje": "Usuario vinculado en Alcaldía Mayor de Tunja — Departamento Administrativo de Planeación",
  "usuario": {
    "codUsuario": 5,
    "nombreUsuario": "Juan García",
    "rolActual": "supervisor",
    "departamento": "Departamento Administrativo de Planeación",
    "vinculoCreado": {
      "entidad": "Alcaldía Mayor de Tunja",
      "cargo": "Supervisor de Planeación",
      "fechaAsignacion": "2026-06-04T10:00:00.000Z"
    }
  }
}
```

> Después de este paso, Juan debe **volver a hacer login** para que su JWT incluya `cod_departamento: 3` y `cod_entidad: 1`.

---

### 2.2 Asignar Laura Pérez como funcionaria (`codRol: 3`)

```http
PUT {{BASE_URL}}/privado/usuarios/asignar-entidad/{{ID_USUARIO_LAURA}}
Authorization: Bearer {{TOKEN_ADMIN}}
Content-Type: application/json

{
  "codEntidad": 1,
  "codDepartamento": 3,
  "cargo": "Revisora de Licencias de Construcción",
  "codRol": 3
}
```

**Respuesta:**
```json
{
  "mensaje": "Usuario vinculado en Alcaldía Mayor de Tunja — Departamento Administrativo de Planeación",
  "usuario": {
    "codUsuario": 6,
    "nombreUsuario": "Laura Pérez",
    "rolActual": "funcionario",
    "departamento": "Departamento Administrativo de Planeación",
    "vinculoCreado": {
      "entidad": "Alcaldía Mayor de Tunja",
      "cargo": "Revisora de Licencias de Construcción",
      "fechaAsignacion": "2026-06-04T10:05:00.000Z"
    }
  }
}
```

> Laura debe **volver a hacer login** para obtener el JWT actualizado.

---

### 2.3 (Opcional) Asignar Ana Rojas como visitante (`codRol: 5`)

El visitante solo puede consultar trámites. No puede crear, subir documentos ni actuar sobre ningún paso.

```http
PUT {{BASE_URL}}/privado/usuarios/asignar-entidad/{{ID_USUARIO_ANA}}
Authorization: Bearer {{TOKEN_ADMIN}}
Content-Type: application/json

{
  "codEntidad": 1,
  "codDepartamento": 3,
  "cargo": "Consultora Externa — Contraloría Municipal",
  "codRol": 5
}
```

**Respuesta:**
```json
{
  "mensaje": "Usuario vinculado en Alcaldía Mayor de Tunja — Departamento Administrativo de Planeación",
  "usuario": {
    "codUsuario": 10,
    "nombreUsuario": "Ana Rojas",
    "rolActual": "visitante",
    "departamento": "Departamento Administrativo de Planeación",
    "vinculoCreado": {
      "entidad": "Alcaldía Mayor de Tunja",
      "cargo": "Consultora Externa — Contraloría Municipal",
      "fechaAsignacion": "2026-06-04T10:10:00.000Z"
    }
  }
}
```

> El visitante solo puede hacer `GET` sobre trámites y documentos de su entidad. Cualquier intento de crear o actuar devolverá HTTP 403.

---

### 2.4 JWT del funcionario después del login

Después de re-loguearse, el JWT de Laura incluye:

```json
{
  "jti": "b7e3f9a2-...",
  "sub": 6,
  "name": "Laura Pérez",
  "nombre_rol": "funcionario",
  "cod_entidad": 1,
  "cod_departamento": 3,
  "iat": 1748995200,
  "exp": 1748998800
}
```

Con `cod_departamento: 3` == `codDepartamentoResponsable: 3` del paso → Laura puede ver y actuar.

> **Si Laura perteneciera al departamento de Hacienda (`cod_departamento: 7`)**, el sistema:
> - No mostraría los trámites de Planeación en su lista (`GET /tramites/todos`)
> - Devolvería 403 si intentara ver el detalle de un trámite de Planeación
> - Devolvería 403 en cualquier acción sobre los pasos de Planeación

---

## Fase 3 — Ciudadano inicia el trámite

### 3.1 Carlos Soto inicia el trámite de licencia de construcción

```http
POST {{BASE_URL}}/privado/tramites/iniciar/{{WORKFLOW_ID}}
Authorization: Bearer {{TOKEN_CIUDADANO}}
Content-Type: application/json

{
  "codEntidadAsignada": 1,
  "observacionInicial": "Solicito concepto para construcción de vivienda unifamiliar en predio con matrícula inmobiliaria 12345"
}
```

**Respuesta:**
```json
{
  "codTramite": 1,
  "codUsuarioCreador": 8,
  "codEntidadAsignada": 1,
  "codWorkflow": 1,
  "codigoExpediente": "TRM-1748995300000",
  "tipoTramite": "Ruta de Construcción",
  "estado": "EN_PROCESO",
  "progreso": 0,
  "fechaCreacion": "2026-06-04T10:30:00.000Z",
  "pasos": [
    {
      "codTramitePaso": 1,
      "codPaso": 1,
      "estado": "PENDIENTE",
      "habilitado": true,
      "codDepartamentoResponsable": 3,
      "paso": { "codigo": "PDT-PDFT-002", "nombre": "Diligenciamiento del formato PDT-PDFT-002" }
    },
    {
      "codTramitePaso": 2,
      "codPaso": 2,
      "estado": "PENDIENTE",
      "habilitado": true,
      "codDepartamentoResponsable": 3,
      "paso": { "codigo": "VERIF-PLANOS-001", "nombre": "Verificación técnica de planos" }
    },
    {
      "codTramitePaso": 3,
      "codPaso": 3,
      "estado": "PENDIENTE",
      "habilitado": true,
      "codDepartamentoResponsable": 3,
      "paso": { "codigo": "NORMA-URB-001", "nombre": "Concepto de norma urbanística" }
    }
  ]
}
```

> Guardar `codTramite` → `TRAMITE_ID = 1`  
> Guardar `codTramitePaso` del paso PDT-PDFT-002 → `PASO_PDT_ID = 1`

> **Los 3 pasos quedan `habilitado: true`** porque todos pertenecen a la Etapa 1 y el sistema habilita todos los pasos de la etapa activa simultáneamente al crear el trámite. El funcionario puede iniciar revisión en cualquiera de ellos.

---

## Fase 4 — Ciudadano sube el documento PDT-PDFT-002

> El ciudadano usa `multipart/form-data`. En Postman: seleccionar `Body → form-data`.

### 4.1 Subir el documento

```http
POST {{BASE_URL}}/privado/tramites/{{TRAMITE_ID}}/pasos/{{PASO_PDT_ID}}/documentos/subir
Authorization: Bearer {{TOKEN_CIUDADANO}}
Content-Type: multipart/form-data

file: [seleccionar archivo PDT-PDFT-002.pdf]
descripcion: Formato PDT-PDFT-002 diligenciado con datos del predio
```

**En Postman — configuración del body:**
```
KEY          TYPE    VALUE
file         File    PDT-PDFT-002.pdf
descripcion  Text    Formato PDT-PDFT-002 diligenciado con datos del predio
```

**Respuesta:**
```json
{
  "mensaje": "Documento subido correctamente",
  "documento": {
    "codDocumentoPaso": 1,
    "nombreDocumento": "PDT-PDFT-002.pdf",
    "tamaño": 524288,
    "tipoContenido": "application/pdf",
    "fechaCarga": "2026-06-04T10:35:00.000Z",
    "descripcion": "Formato PDT-PDFT-002 diligenciado con datos del predio"
  }
}
```

> El archivo se guarda en `./uploads/documentos/` con nombre único. Extensiones permitidas: pdf, docx, xlsx, jpg, jpeg, png, gif, txt, xls, doc, ppt, pptx, zip. Límite: 10 MB.

### 4.2 Verificar que el documento aparece en el paso

```http
GET {{BASE_URL}}/privado/tramites/{{TRAMITE_ID}}/pasos/{{PASO_PDT_ID}}/documentos
Authorization: Bearer {{TOKEN_CIUDADANO}}
```

**Respuesta:**
```json
{
  "cantidad": 1,
  "documentos": [
    {
      "codDocumentoPaso": 1,
      "nombreDocumento": "PDT-PDFT-002.pdf",
      "tamaño": 524288,
      "tipoContenido": "application/pdf",
      "fechaCarga": "2026-06-04T10:35:00.000Z",
      "descripcion": "Formato PDT-PDFT-002 diligenciado con datos del predio"
    }
  ]
}
```

---

## Fase 5 — Funcionario revisa, aprueba o devuelve

### 5.1 Funcionario ve los documentos del paso

```http
GET {{BASE_URL}}/privado/tramites/{{TRAMITE_ID}}/pasos/{{PASO_PDT_ID}}/documentos
Authorization: Bearer {{TOKEN_FUNCIONARIO}}
```

### 5.2 Funcionario descarga el documento para revisarlo

```http
GET {{BASE_URL}}/privado/tramites/{{TRAMITE_ID}}/pasos/{{PASO_PDT_ID}}/documentos/1/descargar
Authorization: Bearer {{TOKEN_FUNCIONARIO}}
```

> Responde con el archivo binario (Content-Disposition: attachment). En Postman se descarga automáticamente.

### 5.3 Funcionario inicia la revisión del paso

Transición: `HABILITADO → EN_REVISION`

```http
POST {{BASE_URL}}/privado/tramites/{{TRAMITE_ID}}/pasos/{{PASO_PDT_ID}}/iniciar
Authorization: Bearer {{TOKEN_FUNCIONARIO}}
Content-Type: application/json

{
  "observacion": "Iniciando revisión del formato PDT-PDFT-002 presentado"
}
```

**Respuesta:**
```json
{
  "codTramitePaso": 1,
  "estado": "EN_REVISION",
  "habilitado": true,
  "fechaInicio": "2026-06-04T11:00:00.000Z"
}
```

---

### OPCIÓN A — Funcionario aprueba el paso

Transición: `EN_REVISION → APROBADO`

```http
POST {{BASE_URL}}/privado/tramites/{{TRAMITE_ID}}/pasos/{{PASO_PDT_ID}}/aprobar
Authorization: Bearer {{TOKEN_FUNCIONARIO}}
Content-Type: application/json

{
  "observacion": "Formato PDT-PDFT-002 correctamente diligenciado. Todos los campos completos y firma del solicitante presente."
}
```

**Respuesta:**
```json
{
  "codTramitePaso": 1,
  "estado": "APROBADO",
  "habilitado": false,
  "fechaFin": "2026-06-04T11:30:00.000Z"
}
```

> El sistema recalcula automáticamente. Si todos los pasos de la etapa están aprobados, habilita la siguiente etapa. El progreso del trámite se actualiza.

---

### OPCIÓN B — Funcionario devuelve el paso para subsanación

Transición: `EN_REVISION → DEVUELTO`

```http
POST {{BASE_URL}}/privado/tramites/{{TRAMITE_ID}}/pasos/{{PASO_PDT_ID}}/devolver
Authorization: Bearer {{TOKEN_FUNCIONARIO}}
Content-Type: application/json

{
  "observacion": "El formato PDT-PDFT-002 está incompleto: falta firma del propietario en la sección 3 y no se adjuntó fotocopia de la escritura pública."
}
```

**Respuesta:**
```json
{
  "codTramitePaso": 1,
  "estado": "DEVUELTO",
  "habilitado": false,
  "numeroDevoluciones": 1
}
```

> El ciudadano recibirá notificación (actualmente solo logging). El paso queda bloqueado hasta que el ciudadano subsane.

---

## Fase 6 — Ciudadano subsana y reenvía

> Esta fase solo aplica cuando el paso fue devuelto (Opción B de la Fase 5).

### 6.1 Ciudadano marca el paso como en subsanación

Transición: `DEVUELTO → EN_SUBSANACION`

```http
POST {{BASE_URL}}/privado/tramites/{{TRAMITE_ID}}/pasos/{{PASO_PDT_ID}}/subsanar
Authorization: Bearer {{TOKEN_CIUDADANO}}
Content-Type: application/json

{
  "observacion": "Adjunto formato corregido con firma del propietario y fotocopia de escritura pública"
}
```

**Respuesta:**
```json
{
  "codTramitePaso": 1,
  "estado": "EN_SUBSANACION",
  "habilitado": true
}
```

### 6.2 Ciudadano sube el documento corregido

```http
POST {{BASE_URL}}/privado/tramites/{{TRAMITE_ID}}/pasos/{{PASO_PDT_ID}}/documentos/subir
Authorization: Bearer {{TOKEN_CIUDADANO}}
Content-Type: multipart/form-data

file: [seleccionar PDT-PDFT-002-corregido.pdf]
descripcion: Formato corregido con firma y escritura pública adjunta
```

### 6.3 Ciudadano reenvía el paso al funcionario

Transición: `EN_SUBSANACION → REENVIADO → EN_REVISION`

```http
POST {{BASE_URL}}/privado/tramites/{{TRAMITE_ID}}/pasos/{{PASO_PDT_ID}}/reenviar
Authorization: Bearer {{TOKEN_CIUDADANO}}
Content-Type: application/json

{
  "observacion": "Documentación corregida y completa. He adjuntado todos los documentos solicitados."
}
```

**Respuesta:**
```json
{
  "codTramitePaso": 1,
  "estado": "REENVIADO",
  "habilitado": true
}
```

> El paso queda en `REENVIADO` y el sistema lo habilita nuevamente para revisión. El funcionario puede iniciar revisión y aprobar o devolver de nuevo.

---

## Fase 7 — Supervisor asigna funcionario a un paso

> El supervisor puede asignar un funcionario específico a un paso para que sea el único que pueda actuar sobre él.

### 7.1 Asignar Laura al paso PDT-PDFT-002

```http
POST {{BASE_URL}}/privado/tramites/{{TRAMITE_ID}}/pasos/{{PASO_PDT_ID}}/asignar
Authorization: Bearer {{TOKEN_SUPERVISOR}}
Content-Type: application/json

{
  "codFuncionarioAsignado": 6
}
```

**Respuesta:**
```json
{
  "codTramitePaso": 1,
  "codFuncionarioAsignado": 6,
  "estado": "HABILITADO"
}
```

> Una vez asignado, solo Laura (cod_usuario: 6) puede actuar sobre ese paso. Otros funcionarios del mismo departamento recibirán 403.

---

## Fase 8 — Consultas y seguimiento

### 8.1 Ver todos los trámites (según el rol)

```http
GET {{BASE_URL}}/privado/tramites/todos
Authorization: Bearer {{TOKEN_FUNCIONARIO}}
```

- **Admin:** ve todos los trámites del sistema
- **Supervisor / Funcionario:** ve solo los trámites de su entidad donde su departamento (`cod_departamento` del JWT) tiene al menos un paso responsable
- **Visitante:** ve todos los trámites de su entidad (`cod_entidad` del JWT), sin restricción de departamento
- **Ciudadano:** ve solo sus propios trámites

**Filtros disponibles:**
```http
GET {{BASE_URL}}/privado/tramites/todos?estado=EN_PROCESO
GET {{BASE_URL}}/privado/tramites/todos?codEntidadAsignada=1
```

**Respuesta:**
```json
{
  "data": [
    {
      "codTramite": 1,
      "codigoExpediente": "TRM-1748995300000",
      "tipoTramite": "Ruta de Construcción",
      "estado": "EN_PROCESO",
      "progreso": 0,
      "fechaCreacion": "2026-06-04T10:30:00.000Z",
      "usuarioCreador": { "nombreUsuario": "Carlos Soto" },
      "entidadAsignada": { "nombreEntidad": "Alcaldía Mayor de Tunja" }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 25
}
```

---

### 8.2 Ver detalle completo de un trámite con sus pasos

```http
GET {{BASE_URL}}/privado/tramites/{{TRAMITE_ID}}/detalle
Authorization: Bearer {{TOKEN_FUNCIONARIO}}
```

**Respuesta:**
```json
{
  "codTramite": 1,
  "codigoExpediente": "TRM-1748995300000",
  "tipoTramite": "Ruta de Construcción",
  "estado": "EN_PROCESO",
  "progreso": 33,
  "workflow": { "nombre": "Ruta de Construcción" },
  "pasos": [
    {
      "codTramitePaso": 1,
      "estado": "APROBADO",
      "habilitado": false,
      "codDepartamentoResponsable": 3,
      "numeroDevoluciones": 0,
      "fechaInicio": "2026-06-04T11:00:00.000Z",
      "fechaFin": "2026-06-04T11:30:00.000Z",
      "paso": {
        "codigo": "PDT-PDFT-002",
        "nombre": "Diligenciamiento del formato PDT-PDFT-002",
        "requiereDocumentos": true
      },
      "documentos": [
        {
          "codDocumentoPaso": 1,
          "nombreDocumento": "PDT-PDFT-002.pdf",
          "estadoValidacion": "PENDIENTE",
          "fechaCarga": "2026-06-04T10:35:00.000Z"
        }
      ]
    },
    {
      "codTramitePaso": 2,
      "estado": "HABILITADO",
      "habilitado": true,
      "paso": { "codigo": "VERIF-PLANOS-001", "nombre": "Verificación técnica de planos" }
    },
    {
      "codTramitePaso": 3,
      "estado": "PENDIENTE",
      "habilitado": false,
      "paso": { "codigo": "NORMA-URB-001", "nombre": "Concepto de norma urbanística" }
    }
  ]
}
```

---

### 8.3 Ver el timeline de eventos del trámite

```http
GET {{BASE_URL}}/privado/tramites/{{TRAMITE_ID}}/timeline
Authorization: Bearer {{TOKEN_FUNCIONARIO}}
```

**Respuesta:**
```json
[
  {
    "codEvento": 1,
    "tipoEvento": "CREACION_TRAMITE",
    "estadoNuevo": "EN_PROCESO",
    "codUsuario": 8,
    "rol": "ciudadano",
    "observacion": "Solicito concepto para construcción de vivienda unifamiliar",
    "fecha": "2026-06-04T10:30:00.000Z"
  },
  {
    "codEvento": 2,
    "tipoEvento": "HABILITACION_PASO",
    "estadoAnterior": "PENDIENTE",
    "estadoNuevo": "PENDIENTE",
    "codUsuario": 0,
    "rol": "sistema",
    "observacion": "Paso habilitado — etapa 1",
    "tramitePaso": { "codTramitePaso": 1 },
    "fecha": "2026-06-04T10:30:01.000Z"
  },
  {
    "codEvento": 3,
    "tipoEvento": "ENVIO_DOCUMENTOS",
    "codUsuario": 8,
    "rol": "usuario",
    "observacion": "Documento 1 subido en paso 1",
    "fecha": "2026-06-04T10:35:00.000Z"
  },
  {
    "codEvento": 4,
    "tipoEvento": "INICIO_REVISION",
    "estadoAnterior": "HABILITADO",
    "estadoNuevo": "EN_REVISION",
    "codUsuario": 6,
    "rol": "funcionario",
    "observacion": "Iniciando revisión del formato PDT-PDFT-002",
    "fecha": "2026-06-04T11:00:00.000Z"
  },
  {
    "codEvento": 5,
    "tipoEvento": "APROBACION",
    "estadoAnterior": "EN_REVISION",
    "estadoNuevo": "APROBADO",
    "codUsuario": 6,
    "rol": "funcionario",
    "observacion": "Formato PDT-PDFT-002 correctamente diligenciado.",
    "fecha": "2026-06-04T11:30:00.000Z"
  }
]
```

---

### 8.4 Listar workflows disponibles

```http
GET {{BASE_URL}}/privado/workflows
Authorization: Bearer {{TOKEN_FUNCIONARIO}}
```

**Con filtros:**
```http
GET {{BASE_URL}}/privado/workflows?activo=true&nombre=Ruta
```

**Respuesta:**
```json
{
  "data": [
    {
      "codWorkflow": 1,
      "codigo": "RUTA-CONST-001",
      "nombre": "Ruta de Construcción",
      "activo": true,
      "etapas": [...],
      "pasos": [...]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 25
}
```

---

## Máquina de estados

### Estado del trámite

```
EN_PROCESO → COMPLETADO  (todos los pasos aprobados — automático)
EN_PROCESO → ANULADO     (admin anula el trámite)
EN_PROCESO → CANCELADO   (ciudadano cancela)
```

### Estado de cada paso

```
PENDIENTE
    └→ HABILITADO          (sistema habilita al completar etapa anterior)
         └→ EN_REVISION    (funcionario inicia revisión)
              ├→ APROBADO  (funcionario aprueba)
              │    └→ CERRADO  (cierre automático)
              └→ DEVUELTO  (funcionario devuelve)
                   └→ EN_SUBSANACION  (ciudadano confirma subsanación)
                        └→ REENVIADO (ciudadano reenvía)
                             └→ EN_REVISION (vuelve a revisión)
```

### Reglas de acceso por rol

El sistema aplica **dos niveles de validación** encadenados:

**Nivel 1 — ¿Puede ver el trámite?**

| Rol | Condición para ver el trámite |
|-----|-------------------------------|
| `admin` | Siempre |
| `ciudadano` | Solo si él lo creó |
| `visitante` | Su `cod_entidad` = `codEntidadAsignada` del trámite |
| `funcionario` | Su `cod_entidad` = `codEntidadAsignada` **Y** su `cod_departamento` tiene al menos un paso responsable en el trámite |
| `supervisor` | Igual que funcionario |

**Nivel 2 — ¿Puede actuar sobre un paso?**

| Rol | Condición para actuar |
|-----|----------------------|
| `admin` | Siempre |
| `funcionario` / `supervisor` | Nivel 1 cumplido **Y** `cod_departamento` = `codDepartamentoResponsable` del paso **Y** paso habilitado |
| `ciudadano` | Solo subsanar y reenviar sus propios trámites |
| `visitante` | Nunca puede actuar, solo leer |

> **Consecuencia práctica:** Un funcionario de Hacienda asignado a Alcaldía **no verá** en su lista los trámites cuya etapa responsable es Planeación. Y aunque llegara a ver uno, no podría iniciar revisión, aprobar ni devolver ningún paso, porque su departamento no coincide.

### Tabla de acciones

| Acción | Endpoint | `admin` | `supervisor` | `funcionario` | `ciudadano` | `visitante` |
|--------|----------|---------|--------------|---------------|-------------|-------------|
| Ver lista | `GET /tramites/todos` | ✅ Todo | ✅ Entidad+Dpto | ✅ Entidad+Dpto | ✅ Propios | ✅ Entidad |
| Ver detalle / timeline | `GET /tramites/:id/detalle` | ✅ | ✅ Entidad+Dpto | ✅ Entidad+Dpto | ✅ Propio | ✅ Entidad |
| Ver/descargar documentos | `GET /pasos/:id/documentos` | ✅ | ✅ | ✅ | ✅ Propios | ✅ Entidad |
| Iniciar revisión | `POST /pasos/:id/iniciar` | ✅ | ✅ Mismo dpto. | ✅ Mismo dpto. | ❌ | ❌ |
| Aprobar paso | `POST /pasos/:id/aprobar` | ✅ | ✅ Mismo dpto. | ✅ Mismo dpto. | ❌ | ❌ |
| Devolver paso | `POST /pasos/:id/devolver` | ✅ | ✅ Mismo dpto. | ✅ Mismo dpto. | ❌ | ❌ |
| Subir documento | `POST /pasos/:id/documentos/subir` | ✅ | ✅ | ✅ | ✅ Propio | ❌ |
| Eliminar documento | `DELETE /pasos/:id/documentos/:docId` | ✅ | ✅ | ✅ | ✅ Propio | ❌ |
| Subsanar | `POST /pasos/:id/subsanar` | ❌ | ❌ | ❌ | ✅ Solo creador | ❌ |
| Reenviar | `POST /pasos/:id/reenviar` | ❌ | ❌ | ❌ | ✅ Solo creador | ❌ |
| Asignar funcionario | `POST /pasos/:id/asignar` | ✅ | ✅ Mismo dpto. | ❌ | ❌ | ❌ |
| Crear workflow/etapa/paso | `POST /workflows/...` | ✅ | ❌ | ❌ | ❌ | ❌ |

> **"Mismo dpto."** = `cod_departamento` del JWT del usuario coincide con `codDepartamentoResponsable` del paso (campo copiado de la etapa al iniciar el trámite).

---

## Errores comunes

### Al ver o actuar sobre un trámite/paso

| HTTP | Mensaje | Causa | Solución |
|------|---------|-------|----------|
| 403 | `"Este trámite no pertenece a tu entidad"` | El `cod_entidad` del JWT no coincide con `codEntidadAsignada` del trámite | Verificar que el usuario fue asignado a la entidad correcta |
| 403 | `"Tu usuario no tiene departamento asignado"` | El funcionario no tiene `cod_departamento` en su JWT | El funcionario debe re-loguearse después de que el admin lo asigne con `codDepartamento` |
| 403 | `"Tu departamento no es responsable de ningún paso en este trámite"` | El funcionario es de Hacienda pero el trámite es del departamento de Planeación | El usuario no tiene acceso a ese trámite porque no pertenece a ninguno de sus pasos |
| 403 | `"Tu departamento (X) no es responsable de este paso (requiere departamento: Y)"` | El departamento del JWT no coincide con el paso específico | El usuario puede ver el trámite pero no puede actuar en este paso |
| 403 | `"El paso no está habilitado"` | El paso está en `PENDIENTE` porque la etapa anterior no está completa | Completar todos los pasos de la etapa anterior |
| 403 | `"Este paso está asignado a otro funcionario"` | El supervisor asignó un funcionario específico | Solo ese funcionario puede actuar en el paso |
| 400 | `"Transición inválida desde este estado"` | Se intenta aprobar un paso que no está en `EN_REVISION` | Primero ejecutar `POST /iniciar` para llevar el paso a `EN_REVISION` |
| 403 | `"Solo el ciudadano puede subsanar pasos"` | Un funcionario intenta subsanar | Solo el ciudadano creador puede ejecutar subsanación y reenvío |

### Al crear el workflow

| HTTP | Mensaje | Causa |
|------|---------|-------|
| 400 | `"Código de workflow ya existe"` | Ya hay un workflow con ese código |
| 404 | `"Etapa no encontrada"` | El `codEtapa` no corresponde a ese workflow |
| 400 | `"canal must be one of: PRESENCIAL, VIRTUAL, MIXTO"` | Valor de canal inválido |

### Al asignar entidad al usuario

| HTTP | Mensaje | Causa |
|------|---------|-------|
| 400 | `"codRol debe ser: 2 (supervisor) \| 3 (funcionario) \| 5 (visitante)"` | `codRol` inválido (no se puede asignar admin ni ciudadano) |
| 400 | `"El departamento no pertenece a la entidad indicada"` | El departamento es de otra entidad |
| 400 | `"No se puede asignar entidad a un administrador"` | El usuario ya es admin |
| 404 | `"El departamento especificado no existe"` | El `codDepartamento` no existe |
| 404 | `"La entidad especificada no existe"` | El `codEntidad` no existe |
| 409 | `"El usuario ya tiene un vínculo activo con esta entidad"` | Ya fue asignado a esa entidad |

### Al subir documentos

| HTTP | Mensaje | Causa |
|------|---------|-------|
| 400 | `"No se envió ningún archivo"` | Falta el campo `file` en el form-data |
| 400 | `"Extensión de archivo no permitida: .exe"` | Extensión no permitida |
| 400 | `"El archivo excede el límite de 10485760 bytes"` | Archivo mayor a 10 MB |
| 403 | `"No está permitido subir documentos en este paso"` | El paso no está habilitado |

---

## Resumen del flujo completo

```
[ADMIN]                [CIUDADANO]          [FUNCIONARIO]         [VISITANTE]
   │                       │                    │                     │
   │ 1. Crear workflow      │                    │                     │
   │ 2. Crear etapa         │                    │                     │
   │ 3. Crear 3 pasos       │                    │                     │
   │ 4. Asignar usuarios    │                    │                     │
   │    codRol: 2/3/5       │                    │                     │
   │                       │                    │                     │
   │                       │ 5. Login           │                     │
   │                       │ 6. Iniciar tramite │                     │
   │                       │ 7. Subir doc       │                     │
   │                       │                    │                     │
   │                       │               8. Ver docs            9. Ver tramites
   │                       │               10. Iniciar revisión   10. Ver detalle
   │                       │               11. Aprobar/Devolver        │
   │                       │                    │                     │
   │         (si devuelto) │ 12. Subsanar       │                     │
   │                       │ 13. Reenviar       │                     │
   │                       │               14. Re-revisar             │
   │                       │               15. Aprobar                │
   │                       │                    │                     │
   │                       │ ← Sistema completa trámite               │
```

---

*Guía de Workflow — VentanillaUnica · NestJS + TypeORM + PostgreSQL*
