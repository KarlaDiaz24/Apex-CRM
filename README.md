# Apex CRM

Manual de instalación, ejecución y prueba del CRM comercial desarrollado.

## Qué incluye

- Frontend de una sola página construido con React, Vite y Tailwind CSS 4.
- API REST construida con Node.js y Express.
- Base de datos MySQL con usuarios, clientes, interacciones, oportunidades, tareas y auditoría.
- Inicio de sesión con JWT y roles `admin` y `user`.
- Borrado lógico de clientes, oportunidades, tareas e interacciones mediante `deleted_at`.
- Papelera y restauración de clientes disponibles para administradores.
- Registro e historial de interacciones comerciales desde la interfaz.
- Administración de cuentas de agentes desde la interfaz de administrador.
- Las tareas operativas de agentes quedan aisladas por usuario; administración puede consultar todas.

## Requisitos

- Node.js 20.19 o superior (o 22.12 o superior).
- npm, incluido con Node.js.
- pnpm para instalar las dependencias del frontend.
- MySQL 8 o un servicio compatible, como Aiven MySQL.
- Postman para probar los endpoints (opcional).

## 1. Obtener el proyecto

```bash
git clone https://github.com/KarlaDiaz24/Apex-CRM.git
cd Apex-CRM
```

## 2. Crear la base de datos

El esquema está en [`backend/database/schema.sql`](backend/database/schema.sql). El archivo crea las seis tablas que utiliza el backend; no inserta usuarios ni contraseñas predeterminadas.

En MySQL Workbench, conéctate al servidor, selecciona la base destino y ejecuta el contenido de `backend/database/schema.sql`. En una instalación local puedes crear primero la base:

```sql
CREATE DATABASE turing_crm_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Luego selecciónala (`USE turing_crm_db;`) antes de ejecutar el esquema. Si usas Aiven u otro proveedor con una base ya creada, selecciona esa base (por ejemplo, `defaultdb`) y ejecuta el mismo esquema allí. El usuario de base de datos debe tener permiso para crear tablas.

El esquema conserva las relaciones y los `ENUM` del reto. La información descriptiva de cada entidad vive en su propia tabla; las demás tablas guardan sus claves foráneas. `audit_logs` obtiene el nombre y correo del usuario con una consulta, en vez de duplicarlos.

## 3. Configurar el backend

Copia `backend/.env.example` como `backend/.env` y reemplaza los valores de ejemplo por los de la base que acabas de preparar:

```env
PORT=5000
JWT_SECRET=un-secreto-aleatorio-privado-de-32-caracteres-o-mas
JWT_EXPIRES_IN=8h
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu-contraseña-de-mysql
DB_NAME=turing_crm_db
DB_PORT=3306
```

Para generar un secreto JWT aleatorio desde la terminal:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Usa un secreto distinto en cada entorno. Guarda `.env`. Para Aiven, sustituye host, usuario, contraseña, puerto y nombre por los datos de conexión de Aiven.

Instala e inicia el backend desde la carpeta `backend`:

```bash
cd backend
npm ci
npm run dev
```

La API local queda en `http://localhost:5000`. El servidor necesita `JWT_SECRET` de 32 caracteres o más y conexión válida a MySQL para iniciar correctamente.

## 4. Crear la primera cuenta administradora

Las credenciales no vienen predefinidas. La persona que instala el sistema crea el primer admin en la base configurada en `backend/.env`:

```bash
npm run create-admin
```

El comando solicita nombre, correo y contraseña; la contraseña no aparece en pantalla y se guarda como hash bcrypt. Se niega a crear otro admin si ya existe uno en esa base. Anota el correo y la contraseña en un gestor seguro: esos serán los datos que se usarán en el login.

Si el comando indica que ya existe un admin, utiliza la cuenta administradora que ya se configuró. Si se perdió esa contraseña, restablécela mediante un procedimiento administrativo seguro; no compartas ni guardes credenciales en el README.

## 5. Crear usuarios normales

Una vez que exista el admin, inicia sesión y abre **Usuarios** para crear, consultar, editar y desactivar cuentas de agentes. Al editar, la contraseña es opcional; si se cambia, se guarda con bcrypt. La desactivación es lógica y bloquea de inmediato el uso de sus tokens JWT. También se pueden usar `POST /api/auth/register`, `PUT /api/auth/users/:id` y `DELETE /api/auth/users/:id` con el JWT admin. La API solo permite administrar cuentas con rol `user`; no permite cambiar ni desactivar cuentas admin.

## 6. Configurar y ejecutar el frontend

El proyecto del frontend usa pnpm. Si no tienes pnpm, habilítalo con `corepack enable` o instálalo desde su sitio oficial. En una segunda terminal:

```bash
cd frontend
pnpm install --frozen-lockfile
```

Para desarrollo local crea `frontend/.env.local`:

```env
VITE_API_URL=http://localhost:5000/api
```

Luego inicia Vite:

```bash
pnpm run dev
```

Abre la URL local que imprime Vite, normalmente `http://localhost:5173`. El archivo `api.js` usa como URL predeterminada la API desplegada en Render; define `VITE_API_URL=http://localhost:5000/api` en `frontend/.env.local` si necesitas conectar el frontend al backend local.

## 7. Iniciar sesión y probar con Postman

Todas las solicitudes usan `http://localhost:5000` en local. En Postman selecciona **No Auth** para el login.

### Obtener un JWT

Envía `POST /api/auth/login`, con Body → raw → JSON y las credenciales que creaste con `npm run create-admin`:

```json
{
  "email": "correo-admin-que-configuraste@example.com",
  "password": "la-contraseña-que-configuraste"
}
```

Una respuesta correcta devuelve `200` y un objeto `token`. Mantén ese token privado. Para las demás solicitudes, selecciona Authorization → Bearer Token y pega el JWT.

### Comprobar autenticación y permisos

| Solicitud | Token | Respuesta esperada |
|---|---|---|
| `GET /api/auth/me` | Admin o user | `200` y perfil |
| `GET /api/clients` | Admin o user | `200` |
| `GET /api/audit` | Admin | `200` |
| `GET /api/clients/deleted` | Admin | `200` |
| `GET /api/audit` | User | `403` |
| `GET /api/clients/deleted` | User | `403` |
| `GET /api/clients` | Sin token | `401` |

Para crear una cuenta `user`, envía `POST /api/auth/register` con el token admin y el body:

```json
{
  "name": "Agente de prueba",
  "email": "agente@example.com",
  "password": "contraseña-segura"
}
```

El body no debe incluir rol. Después inicia sesión con esa cuenta para obtener su token y comprobar los casos de permiso de la tabla.

### Comprobar el borrado lógico y la restauración

1. Con un token autenticado, crea un cliente usando `POST /api/clients` y este JSON:

   ```json
   {
     "company_name": "Empresa de prueba",
     "contact_name": "Contacto de prueba",
     "email": "contacto@example.com",
     "phone": "5551234567",
     "status": "Nuevo"
   }
   ```

2. Anota el `id` de la respuesta y envía `DELETE /api/clients/{id}`.
3. Comprueba que no aparece en `GET /api/clients`.
4. Con token admin, confirma que aparece en `GET /api/clients/deleted`.
5. Envía `PUT /api/clients/restore/{id}` y confirma que vuelve a aparecer en `GET /api/clients`.

`DELETE` marca `deleted_at`; no borra físicamente la fila. Deals, tareas e interacciones también se eliminan lógicamente. La papelera de la interfaz permite restaurar clientes; los demás tipos no tienen restauración de interfaz.

## Endpoints

Todas las rutas salvo `POST /api/auth/login` requieren `Authorization: Bearer <JWT>`.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | Público | Inicia sesión y devuelve JWT |
| GET | `/api/auth/me` | Autenticado | Devuelve el perfil del token |
| POST | `/api/auth/register` | Admin | Crea un usuario `user` |
| GET | `/api/auth/users` | Admin | Lista usuarios activos |
| PUT | `/api/auth/users/:id` | Admin | Edita nombre, correo y opcionalmente contraseña de un agente |
| DELETE | `/api/auth/users/:id` | Admin | Desactiva lógicamente un agente y revoca sus sesiones |
| GET, POST | `/api/clients` | Admin y user | Consultar y crear clientes activos |
| PUT, DELETE | `/api/clients/:id` | Admin y user | Editar o eliminar lógicamente |
| GET | `/api/clients/deleted` | Admin | Consulta la papelera de clientes |
| PUT | `/api/clients/restore/:id` | Admin | Restaura un cliente |
| GET, POST, PUT, DELETE | `/api/deals` y `/api/deals/:id` | Admin y user | CRUD de oportunidades; DELETE lógico |
| GET, POST | `/api/tasks` | Admin y user | Admin consulta todas y asigna tareas a agentes activos; cada user consulta y crea sus tareas para sí mismo |
| PUT, DELETE | `/api/tasks/:id` | Admin y user | Admin edita y gestiona todas; cada user edita y gestiona las propias |
| PUT | `/api/tasks/:id/complete` | Admin y user | Completa una tarea activa propia o, como admin, cualquier tarea |
| GET, POST | `/api/interactions` | Admin y user | Consultar y crear interacciones |
| PUT | `/api/interactions/:id` | Admin y user | Admin edita cualquiera; cada user edita las propias |
| DELETE | `/api/interactions/:id` | Admin y user | Admin o autor elimina lógicamente |
| GET | `/api/audit` | Admin | Consulta auditoría |

La aplicación también incluye las vistas de **Interacciones** (crear y consultar actividades) y **Usuarios** (crear agentes y consultar cuentas activas; solo admin).

## Reglas de captura y validación

- Empresa: letras, números, espacios y los signos `. , & ' ( ) / # : + -`; máximo 150 caracteres.
- Contacto: letras, espacios, puntos, apóstrofes y guiones; de 2 a 100 caracteres.
- Correo: formato de correo válido; máximo 100 caracteres.
- Teléfono: obligatorio y compuesto por exactamente 10 dígitos. El formulario elimina caracteres no numéricos mientras se escribe y no permite enviar menos de 10.
- Oportunidad y tarea: título de 2 a 150 caracteres; acepta letras, números, espacios y los signos `. , & ' ( ) / # : + -`.
- Monto: opcional, de 0 a 99,999,999.99, con hasta 2 decimales.
- Notas de tareas e interacciones: texto libre limitado a 2,000 y 5,000 caracteres, respectivamente.

El frontend informa estas reglas y limita las entradas. El backend las vuelve a validar y responde `400` con un mensaje que indica qué corregir; la seguridad no depende solo de las restricciones del navegador.

### Backend en Render

Configura el servicio con raíz `backend` (o los comandos equivalentes desde la raíz): instalación `npm ci`, inicio `npm start`. En **Environment** agrega `JWT_SECRET` (aleatorio y privado), `JWT_EXPIRES_IN` si deseas cambiar el valor predeterminado, y las variables `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `DB_PORT` correspondientes a la base de producción. Tras cada cambio guarda y despliega el servicio.

La base de producción debe tener el esquema y el usuario admin creado en ella. Ejecuta `npm run create-admin` en un entorno conectado a esa base antes de usar el login, o sigue el procedimiento administrativo de tu proveedor. Una cuenta creada en local no se copia automáticamente a producción.

### Frontend

Define `VITE_API_URL=https://apex-crm-7rh1.onrender.com/api` en el entorno de compilación del frontend y vuelve a desplegarlo después de cambiar esa variable. Vite incorpora las variables `VITE_` al build, así que el valor nuevo requiere recompilar.

## Comandos disponibles

- Backend: `npm ci`, `npm run dev`, `npm start`, `npm run create-admin`.
- Frontend: `pnpm install --frozen-lockfile`, `pnpm run dev`, `pnpm run build`, `pnpm run lint`, `pnpm run preview`.

