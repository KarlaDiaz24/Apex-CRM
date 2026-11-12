# 🚀 Apex CRM Enterprise - Turing Inteligencia Artificial S.A.S.

Sistema CRM de alto rendimiento desarrollado como parte del reto técnico del período de prueba para el puesto Trainee de software. Cuenta con una arquitectura moderna de cliente-servidor, separación de responsabilidades y un diseño enterprise enfocado en la experiencia de usuario.

---

## 📋 Características Principales

- **Autenticación y Seguridad:** Sistema de inicio de sesión con roles diferenciados (`admin` y `user`).
- **Módulo de Clientes:** Gestión completa de cartera comercial con indicadores y métricas de rendimiento en tiempo real.
- **Módulo de Tareas (Agenda):** Creación de pendientes, validación de fechas pasadas y sección de tareas completadas mediante pestañas interactivas.
- **Pipeline de Ventas (Deals):** Tablero de oportunidades comerciales con estados dinámicos (*Prospecto, Propuesta, Negociación, Ganado, Perdido*) y formato monetario.
- **Panel de Administración:** Bitácora de auditoría y trazabilidad del sistema, además de una papelera lógica con opción de restauración de registros.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** React.js, Vite, CSS Modules / Estilos corporativos modernos (Glassmorphism & Enterprise Theme).
- **Backend:** Node.js, Express.js, Arquitectura RESTful API con operaciones CRUD completas (`GET`, `POST`, `PUT`, `DELETE`).
- **Base de Datos:** SQLite / Relacional (Diseño normalizado a 3NF).
- **Control de Versiones:** Git y GitHub.

---

## 🗄️ Esquema de Base de Datos

El diseño de la base de datos está normalizado (3NF) para eliminar redundancias y asegurar la integridad referencial. Consta de las siguientes tablas principales:

1. **`users` (Usuarios):** Almacena credenciales de acceso y roles (`id`, `username`, `email`, `password`, `role`, `created_at`).
2. **`clients` (Clientes):** Cartera comercial con soporte para eliminación lógica / Soft Delete (`id`, `company_name`, `contact_name`, `email`, `phone`, `is_deleted`, `deleted_at`, `created_at`).
3. **`deals` (Oportunidades / Pipeline):** Oportunidades comerciales vinculadas a clientes (`id`, `client_id`, `title`, `amount`, `stage`, `closing_date`, `created_at`).
4. **`tasks` (Tareas y Agenda):** Gestión de pendientes y estados de finalización (`id`, `title`, `description`, `due_date`, `completed`, `created_at`).
5. **`audit_logs` (Bitácora de Auditoría):** Trazabilidad de acciones del sistema (`id`, `user_id`, `user_name`, `action`, `details`, `created_at`).

---

## ⚙️ Instrucciones de Instalación y Ejecución Local

Sigue estos pasos para clonar y poner en marcha el proyecto en tu máquina local usando `pnpm`:

### Prerrequisitos
- [Node.js](https://nodejs.org/) instalado en tu equipo.
- Gestor de paquetes **pnpm** (`npm install -g pnpm`).
- Git.

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/Apex-CRM.git
cd Apex-CRM
```

### 2. Configurar y ejecutar el Backend
```bash
cd backend
pnpm install
pnpm run dev
```

### 3. Configurar y ejecutar el Frontend
Abre una nueva terminal, ubícate en la carpeta del frontend y ejecuta:
```bash
cd frontend
pnpm install
pnpm run dev
```