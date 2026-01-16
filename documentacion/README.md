# Node Express Backend

Un backend robusto y modular construido con **Node.js**, **Express** y **Sequelize**, listo para producción. Incluye autenticación, manejo de permisos, sistema de archivos, reportes y más.

## 📋 Requisitos Previos

### Recomendado (Docker)
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Manual (Local)
- [Node.js](https://nodejs.org/) (v18 o superior)
- [MySQL](https://www.mysql.com/) o [MariaDB](https://mariadb.org/)

---

## 🚀 Inicio Rápido con Docker (Recomendado)

Esta es la forma más fácil de levantar todo el entorno (App, Base de Datos, phpMyAdmin, MailHog).

1.  **Clonar el repositorio**:
    ```bash
    git clone <repository-url>
    cd node_express_backend
    ```

2.  **Configurar Variables de Entorno**:
    Copia el archivo de ejemplo:
    ```bash
    cp .env.example .env
    ```
    *Las configuraciones por defecto en `.env.example` están optimizadas para funcionar con Docker inmediatamente.*

3.  **Encender los Contenedores**:
    ```bash
    docker-compose up --build
    ```

### 🌐 Servicios Disponibles

Una vez que los contenedores estén corriendo, podrás acceder a:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **API Backend** | `http://localhost:4000` | El servidor principal de Express |
| **Documentación** | `http://localhost:4000/docs` | Swagger UI (Endpoints) |
| **phpMyAdmin** | `http://localhost:8090` | Gestión visual de la Base de Datos |
| **MailHog** | `http://localhost:8025` | Bandeja de entrada simulada para emails |

---

## 🛠️ Instalación y Configuración Manual

Si prefieres correr el proyecto directamente en tu máquina:

1.  **Instalar Dependencias**:
    ```bash
    npm install
    ```

2.  **Configurar Base de Datos**:
    - Asegúrate de tener un servidor MySQL/MariaDB corriendo.
    - Crea una base de datos vacía (ej. `node_express`).
    - Edita el archivo `.env` con tus credenciales locales:
      ```env
      DB_HOST=127.0.0.1
      DB_PORT=3306
      DB_DATABASE=node_express
      DB_USERNAME=tu_usuario
      DB_PASSWORD=tu_contraseña
      ```

3.  **Ejecutar Migraciones y Seeders**:
    Inicializa la estructura de la base de datos y carga datos de prueba:
    ```bash
    # Correr migraciones
    npm run migrate
    
    # Cargar datos iniciales (Seeders)
    npm run seed
    ```

4.  **Iniciar el Servidor**:
    ```bash
    # Modo Desarrollo (con recarga automática)
    npm run dev
    
    # Modo Producción
    npm run build
    npm run start:prod
    ```

---

## 📚 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor en modo desarrollo usando `nodemon`. |
| `npm run build` | Compila el código TypeScript a JavaScript en la carpeta `dist`. |
| `npm run start:prod` | Inicia el servidor usando el código compilado. |
| `npm run migrate` | Ejecuta las migraciones de Sequelize pendientes. |
| `npm run migrate:undo` | Revierte la última migración. |
| `npm run make:migration --name CreateUser` | Crea un nuevo archivo de migración. |
| `npm run seed` | Ejecuta todos los seeders para poblar la BD. |
| `npm run verify` | Ejecuta scripts de verificación del sistema. |

## 🔑 Estructura del Proyecto

- `src/app.ts`: Punto de entrada de la aplicación.
- `src/config/`: Configuraciones globales (DB, Swagger, etc.).
- `src/modules/`: Módulos encapsulados (Auth, Users, System, etc.).
- `src/common/`: Utilidades compartidas, middlewares y helpers.
- `public/`: Archivos estáticos servidos públicamente.

## 📝 Documentación de API (Swagger)

La documentación se genera automáticamente basada en los comentarios del código y archivos de definición.
Para verla, asegúrate de tener `ENABLE_SWAGGER=true` en tu `.env` (por defecto en development) y navega a:

👉 **http://localhost:4000/docs**
