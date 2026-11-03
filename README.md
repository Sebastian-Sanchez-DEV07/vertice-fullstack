# Vértice — Avance del reto (Full Stack)

Aplicación full stack basada en el sitio de arquitectura **Vértice** (Actividad 1).
El frontend es HTML, CSS y JavaScript vanilla; el backend es Node.js + Express con
PostgreSQL y autenticación JWT.

## Stack

- **Frontend:** HTML5, CSS3, JavaScript (DOM y Fetch API)
- **Backend:** Node.js + Express 5
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT + bcryptjs
- **Seguridad:** CORS, Helmet (CSP), validación por middleware, consultas parametrizadas

## Estructura del proyecto

```
vertice/
├── backend/
│   ├── sql/
│   │   ├── schema.sql          # Tablas users, projects y messages
│   │   └── seed.js             # Crea tablas, admin y proyectos de ejemplo
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js          # Variables de entorno
│   │   │   └── db.js           # Pool de PostgreSQL
│   │   ├── controllers/        # Lógica de auth, proyectos y mensajes
│   │   ├── routes/             # Endpoints de la API
│   │   ├── middlewares/        # JWT, validación y manejo de errores
│   │   ├── utils/              # asyncHandler y firma de JWT
│   │   ├── app.js              # Configuración de Express
│   │   └── server.js           # Arranque del servidor
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── index.html              # Sitio público (proyectos desde la API)
│   ├── login.html              # Inicio de sesión
│   ├── admin.html              # Panel administrativo
│   ├── css/
│   │   ├── style.css           # Diseño base de Vértice
│   │   └── admin.css           # Estilos de login y panel
│   ├── js/
│   │   ├── api.js              # Cliente HTTP y sesión
│   │   ├── main.js             # Proyectos públicos y formulario de contacto
│   │   ├── login.js            # Inicio de sesión
│   │   └── admin.js            # CRUD de proyectos y mensajes
│   └── images/
├── package.json
├── render.yaml               # Blueprint de Render
├── DEPLOY.md                 # Guía de despliegue gratis
└── README.md
```

## Requisitos

- Node.js 20 o superior
- PostgreSQL 14 o superior
- npm

## Instalación paso a paso

### Opción rápida con Docker

Si ya tienes Docker, no necesitas instalar PostgreSQL en el sistema:

```bash
docker run --name vertice-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=vertice \
  -v vertice_pgdata:/var/lib/postgresql \
  -p 5432:5432 \
  -d postgres:18
```

En PostgreSQL 18 el volumen va en `/var/lib/postgresql` (no en
`/var/lib/postgresql/data`). Verifica con:

```bash
docker ps
pg_isready -h 127.0.0.1 -p 5432
```

Si el contenedor ya existe, solo enciéndelo con `docker start vertice-postgres`.

### 1. Crear la base de datos (si no usas Docker)

```bash
sudo -u postgres psql
```

Dentro de `psql`:

```sql
CREATE DATABASE vertice;
\q
```

### 2. Configurar variables de entorno

```bash
cd vertice/backend
cp .env.example .env
```

Edita `.env` y cambia al menos:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/vertice
JWT_SECRET=una_clave_larga_y_aleatoria_de_32_caracteres
```

`JWT_SECRET` es obligatorio y debe tener mínimo 16 caracteres. El archivo `.env`
nunca se sube a GitHub (está en `.gitignore`).

### 3. Instalar dependencias

Desde la carpeta `vertice/`:

```bash
npm run install:api
```

### 4. Crear tablas y usuario administrador

```bash
npm run db:seed
```

Esto crea:
- Las tablas `users`, `projects` y `messages`.
- Un administrador con los datos de `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD`.
- Tres proyectos de ejemplo (solo si la tabla está vacía).

Credenciales por defecto (cámbialas en `.env`):

```
Email: admin@vertice.local
Password: Vertice123!
```

### 5. Ejecutar el proyecto

```bash
npm run dev
```

Abre:

- Sitio público: <http://localhost:3000>
- Login: <http://localhost:3000/login.html>
- Panel admin: <http://localhost:3000/admin.html>

Express sirve el frontend y la API desde el mismo puerto, así que no hace falta
otro servidor ni configurar CORS en local.

## Endpoints de la API

Base: `/api`

### Autenticación

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/auth/login` | Público | Inicia sesión y devuelve un JWT |
| GET | `/api/auth/me` | JWT | Devuelve el usuario autenticado |
| POST | `/api/auth/register` | JWT admin | Crea otro usuario administrador |

### Proyectos

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| GET | `/api/projects` | Público | Lista proyectos (opcional `?featured=true`) |
| GET | `/api/projects/:id` | Público | Obtiene un proyecto |
| POST | `/api/projects` | JWT | Crea un proyecto |
| PUT | `/api/projects/:id` | JWT | Actualiza un proyecto |
| DELETE | `/api/projects/:id` | JWT | Elimina un proyecto |

Cuerpo para crear o actualizar:

```json
{
  "title": "Casa Límite",
  "category": "Residential",
  "year": 2026,
  "description": "A geometric concrete residence.",
  "image_url": "/images/project-casa-limite.jpg",
  "featured": true
}
```

### Mensajes de contacto

| Método | Ruta | Acceso | Descripción |
|--------|------|--------|-------------|
| POST | `/api/messages` | Público | Guarda un mensaje del formulario |
| GET | `/api/messages` | JWT | Lista mensajes recibidos |
| DELETE | `/api/messages/:id` | JWT | Elimina un mensaje |

Para rutas protegidas envía el encabezado:

```
Authorization: Bearer <token>
```

## Seguridad implementada

- Contraseñas hasheadas con bcrypt (10 rondas).
- JWT firmado con secreto obligatorio y expiración (`JWT_EXPIRES_IN`).
- Rutas de escritura protegidas con `requireAuth` y validación de rol.
- Consultas SQL parametrizadas (`$1`, `$2`, ...) para evitar inyección.
- Validación de datos con middleware propio.
- Helmet con Content Security Policy.
- CORS restringido por variable de entorno.
- Límite de tamaño del body JSON (100 kb).
- `.env` fuera del repositorio.

## Pruebas con Postman

1. `POST /api/auth/login` con `{ "email": "...", "password": "..." }`.
2. Copia el `token` de la respuesta.
3. En la pestaña **Authorization** elige **Bearer Token** y pega el token.
4. Prueba `POST`, `PUT` y `DELETE` en `/api/projects`.

## Despliegue gratis (Render + Neon)

La guía completa está en [`DEPLOY.md`](DEPLOY.md). Resumen:

1. Sube **el contenido de `vertice/`** a un repositorio de GitHub.
2. Crea una base de datos gratuita en [Neon](https://neon.tech) y copia su
   connection string.
3. En [Render](https://render.com) crea un **Blueprint** desde el repositorio;
   `render.yaml` configura el servicio automáticamente.
4. Ingresa `DATABASE_URL` (Neon) y `ADMIN_PASSWORD`. Después del primer
   despliegue cambia `CORS_ORIGIN` por la URL pública.
5. Crea las tablas y el administrador una sola vez:

```bash
npm run db:seed
```

Se puede ejecutar desde la **Shell** de Render o desde tu computadora apuntando
a Neon.

> No uses la base de datos gratuita de Render: expira a los 30 días. Neon no
> expira y se reactiva solo después de unos minutos de inactividad.

## Uso de IA (documentado para la rúbrica)

- La estructura de variables de entorno con `dotenv` se consultó con IA y se adaptó
  al proyecto.
- Se usaron sugerencias de IA para el diseño del login y la accesibilidad, y se
  validaron manualmente antes de integrarlas.
- Todo el código fue revisado y ajustado para mantener un nivel comprensible y
  funcional.

## Mejoras futuras

- Recuperación de contraseña.
- Subida de imágenes en lugar de URL.
- Paginación y búsqueda de proyectos.
- Rate limiting en el login.
- Pruebas automatizadas con Jest y Supertest.
