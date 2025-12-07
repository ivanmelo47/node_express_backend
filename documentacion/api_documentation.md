# Documentación de la API de Gestión de Usuarios

Este documento proporciona detalles sobre cómo utilizar las APIs de Gestión de Usuarios. Puedes importar estos detalles en herramientas como **EchoAPI**, **Postman** o **Thunder Client**.

## URL Base

`http://localhost:4000/api`

## Autenticación

Todas las APIs de Usuario requieren un Token Bearer. Primero debes iniciar sesión para obtener este token.

### 1. Registro Público (Nuevo Usuario)

Crea una cuenta nueva. El usuario se creará como **no confirmado**. Se enviará un correo electrónico con un token de confirmación.

- **Método:** `POST`
- **URL:** `/auth/register`
- **Cuerpo (JSON):**
  ```json
  {
    "name": "Juan Perez",
    "email": "juan@example.com",
    "password": "securePassword123"
  }
  ```
- **Respuesta:**
  ```json
  {
    "success": true,
    "message": "Registration successful. Please check your email to confirm your account."
  }
  ```

### 2. Confirmar Cuenta

Activa la cuenta del usuario utilizando el token recibido por correo electrónico.

- **Método:** `POST`
- **URL:** `/auth/confirm-account`
- **Cuerpo (JSON):**
  ```json
  {
    "token": "token_recibido_por_email"
  }
  ```
- **Respuesta:**
  ```json
  {
    "success": true,
    "message": "Account confirmed successfully"
  }
  ```

### 3. Iniciar Sesión (Obtener Token)

- **Método:** `POST`
- **URL:** `/auth/login`
- **Requisitos:** La cuenta debe estar confirmada (`confirmed: true`) y activa (`status: true`).
- **Cuerpo (JSON):**
  ```json
  {
    "email": "juan@example.com",
    "password": "securePassword123"
  }
  ```
- **Respuesta:** Copia el `token` de la respuesta `data`.

---

## Endpoints de Usuario

**Encabezados para todas las solicitudes:**

- `Authorization`: `Bearer <TU_TOKEN>`
- `Content-Type`: `application/json` (excepto para Subida de Imagen)

### 2. Obtener Todos los Usuarios

Recupera una lista de todos los usuarios registrados.

- **Método:** `GET`
- **URL:** `/users`
- **Permisos:** Usuario Autenticado

### 3. Obtener Usuario por ID

Recupera detalles de un usuario específico.

- **Método:** `GET`
- **URL:** `/users/:id`
- **Ejemplo de URL:** `/users/1`
- **Permisos:** Usuario Autenticado

### 4. Crear Usuario (Solo Admin)

Crea una nueva cuenta de usuario.

- **Método:** `POST`
- **URL:** `/users`
- **Permisos:** Rol de Admin
- **Cuerpo (JSON):**
  ```json
  {
    "name": "Nuevo Usuario",
    "email": "nuevousuario@example.com",
    "password": "passwordSeguro123",
    "roleId": 2
  }
  ```

### 5. Actualizar Usuario (con Subida de Imagen)

Actualiza la información de un usuario existente. Este endpoint soporta **multipart/form-data** para permitir subidas de imágenes.

- **Método:** `PUT`
- **URL:** `/users/:id`
- **Permisos:** Rol de Admin
- **Encabezados:**
  - `Authorization`: `Bearer <TU_TOKEN>`
  - `Content-Type`: `multipart/form-data` (Establecido automáticamente por las herramientas al seleccionar archivos)
- **Cuerpo (Form-Data):**
  - `name` (Texto): Nombre Actualizado
  - `email` (Texto): actualizado@example.com
  - `image` (Archivo): Selecciona un archivo de imagen (jpg, png, etc.)

> **Nota:** Si subes una nueva imagen, la anterior se elimina automáticamente. Si no proporcionas una imagen, se conserva la existente.

### 6. Eliminar Usuario

Elimina permanentemente un usuario.

- **Método:** `DELETE`
- **URL:** `/users/:id`
- **Permisos:** Rol de Admin
