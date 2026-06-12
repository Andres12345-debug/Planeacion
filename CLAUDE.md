# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Comandos

```bash
npm start        # dev server en http://localhost:3000
npm run build    # build de producción en /build
npm test         # tests con Jest (watch mode)
```

---

## Stack

- **React 19** + **TypeScript 4.9** (Create React App)
- **MUI v7** para toda la UI — usar `sx` prop, no CSS externo
- **React Router v7** para el ruteo
- **react-toastify** para notificaciones — siempre usar `crearMensaje()` de `utilidades/funciones/mensaje.tsx`, nunca llamar a `toast` directamente
- **jwt-decode** para leer el payload del JWT sin verificar firma
- **sessionStorage** para el token — nunca usar `localStorage` para el token

---

## Arquitectura

```
src/
├── App.tsx                          # BrowserRouter + ThemeContextProvider + ToastContainer
├── ruteo/
│   └── RuteoPrincipal.tsx           # Todas las rutas. Guard: <Vigilante>
├── app/
│   ├── modelos/
│   │   └── InicioSesion.tsx         # Interface Login { username, claveAcceso }
│   ├── servicios/
│   │   ├── publicos/
│   │   │   └── AccesoServicio.ts    # Llamadas SIN auth: login, registro, password recovery
│   │   └── reutilizables/
│   │       └── ApiServicio.ts       # Cliente HTTP base para llamadas CON auth (inyecta Bearer)
│   ├── seguridad/
│   │   └── Vigilate.tsx             # Guard único — verifica token + expiración JWT
│   ├── utilidades/
│   │   ├── auth/
│   │   │   └── tokenHelper.ts       # ÚNICA fuente de verdad del token (sessionStorage)
│   │   ├── dominios/
│   │   │   └── urls.tsx             # Constantes de endpoints de la API
│   │   └── funciones/
│   │       ├── UsoFormulario.tsx    # Hook genérico de formularios con doble enlace
│   │       └── mensaje.tsx          # Wrapper de react-toastify → crearMensaje()
│   ├── compartido/
│   │   ├── layout/MainLayout.tsx    # Wrapper páginas públicas: SmallNav + TopNavigation + Footer + Outlet
│   │   ├── nav/
│   │   │   ├── Nav.tsx              # TopNavigation (AppBar con logo, links, búsqueda, toggle tema)
│   │   │   ├── SmallNav.tsx         # Barra superior (logo gov.co + toggle tema)
│   │   │   └── Sidebar.tsx          # Sidebar colapsable del dashboard privado
│   │   ├── footer/Footer.tsx
│   │   ├── theme/ThemeConext.tsx    # Contexto MUI dark/light + paleta custom
│   │   └── Error.tsx                # Página 404 / ruta errónea
│   ├── publico/
│   │   ├── paginas/
│   │   │   ├── Welcome.tsx          # Landing page pública
│   │   │   ├── IniciarSesion.tsx    # Login (email + clave)
│   │   │   └── Registro.tsx         # Registro Persona Natural / Jurídica
│   │   └── componentes/
│   │       ├── RecuperarContrasenia.tsx
│   │       ├── NuevaContrasenia.tsx
│   │       ├── ImageCarousel.tsx    # Carrusel hero de Welcome
│   │       ├── infoSection.tsx      # Sección misión/visión de Welcome
│   │       ├── Features.tsx         # Catálogo de trámites de Welcome
│   │       ├── Allies.tsx           # Carrusel de entidades aliadas
│   │       ├── ExpandMoreProps.tsx  # Sección de noticias (cards expandibles)
│   │       └── ThankYouSection.tsx  # Sección de agradecimientos
│   └── privado/
│       ├── compartido/
│       │   └── DashboardLayout.tsx  # Layout área privada: Sidebar + Outlet
│       ├── TableroPrincipal.tsx     # Página principal del dashboard (renderiza Profile)
│       └── Profile.tsx              # Perfil del usuario — datos leídos del JWT
```

---

## Flujo de autenticación

```
Login / Registro
    └─ AccesoServicio → POST /publico/auth/login  (o /publico/registros/user)
           └─ Respuesta: { token, mensaje }
                  └─ tokenHelper.set(token)       → sessionStorage
                  └─ decodeToken(token)           → lee nombre, nombre_rol, etc.
                  └─ navigate("/dashboard")

Rutas privadas
    └─ <Vigilante> lee tokenHelper.get()
           ├─ Sin token         → redirect /login
           ├─ Token expirado    → tokenHelper.remove() + redirect /login
           └─ Token válido      → renderiza <Outlet />

Logout (Sidebar)
    └─ tokenHelper.remove() + navigate("/")
```

---

## JWT payload (campos relevantes)

```ts
{
  sub: number           // cod_usuario
  name: string          // nombre completo
  nombre_rol: string    // "admin" | "supervisor" | "funcionario" | "ciudadano" | "visitante"
  cod_entidad: number | null
  cod_departamento: number | null
  iat: number
  exp: number
}
```

---

## Servicios

### `AccesoServicio` — endpoints públicos (sin token)

| Método | Endpoint backend | Descripción |
|---|---|---|
| `iniciarSesion` | `POST /publico/auth/login` | Body: `{ username, claveAcceso }` |
| `registrarUsuario` | `POST /publico/registros/user` | Body: ver modelos/Registro |
| `recuperarContrasenia` | `POST /publico/registros/recuperar-password` | Body: `{ correoUsuario }` |
| `nuevaContrasenia` | `PATCH /publico/registros/nueva-password` | Body: `{ token, nuevaClave }` |

### `ApiServicio` — endpoints privados (con token automático)

Métodos estáticos: `get<T>`, `post<T>`, `put<T>`, `patch<T>`, `delete<T>`. Todos leen el token con `tokenHelper.get()` e inyectan `Authorization: Bearer`.

---

## URLs base

Definidas en `utilidades/dominios/urls.tsx`:

```ts
URL_BASE: "http://localhost:3550"   // cambiar al puerto del backend local
```

---

## Reglas de contraseña (validación frontend y backend)

Mínimo 8 chars · al menos 1 mayúscula · 1 minúscula · 1 número · 1 especial de `@$!%*?&`.

Regex: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/`

---

## Paleta de colores (ThemeConext)

| Token | Valor | Uso |
|---|---|---|
| `primary.main` | `#1c42ae` | Botones principales, acentos |
| `secondary.main` | `#42BFA7` | Acentos secundarios, links |
| `sidebar.main` | `#1e293b` | Fondo del Sidebar |
| `sidebar.contrastText` | `#e2e8f0` | Texto e iconos del Sidebar |
