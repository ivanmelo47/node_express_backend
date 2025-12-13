# Documentación de la API

Este documento proporciona detalles exhaustivos sobre cómo utilizar las APIs del sistema. Diseñado para ser importado en herramientas como **EchoAPI**, **Postman** o **Thunder Client**.

## Información General

- **URL Base:** `http://localhost:4000/api`
- **Formato de Respuesta:** JSON estándar.
- **Seguridad:** Autenticación vía Bearer Token (JWT).

---

## Módulo: Autenticación (`/auth`)

Todas las rutas de este módulo son públicas, excepto donde se indique lo contrario.

### 1. Registro (Nuevo Usuario)

Registra un nuevo usuario en el sistema. La cuenta se crea con estado `confirmed: false`.

- **Método:** `POST`
- **URL:** `/auth/register`
- **Cuerpo (JSON):**
  ```json
  {
    "name": "Juan Perez",
    "email": "juan.perez@example.com",
    "password": "PasswordSeguro123!",
    "password_confirmation": "PasswordSeguro123!"
  }
  ```
- **Respuesta (201 Created):**
  ```json
  {
    "success": true,
    "message": "Registration successful. Please check your email to confirm your account."
  }
  ```

### 2. Confirmar Cuenta

Valida el correo electrónico del usuario mediante un token enviado previamente.

- **Método:** `POST`
- **URL:** `/auth/confirm-account`
- **Cuerpo (JSON):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "message": "Account confirmed successfully"
  }
  ```

### 3. Iniciar Sesión (Login)

Autentica al usuario y devuelve un token JWT de acceso.

- **Método:** `POST`
- **URL:** `/auth/login`
- **Requisitos:** Cuenta confirmada y activa.
- **Cuerpo (JSON):**
  ```json
  {
    "email": "juan.perez@example.com",
    "password": "PasswordSeguro123!"
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "messsage": "Login successful",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsIn...",
      "user": {
        "uuid": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Juan Perez",
        "email": "juan.perez@example.com",
        "role": "user"
      }
    }
  }
  ```

### 4. Recuperar Contraseña (Solicitud)

Envía un correo con un token para restablecer la contraseña.

- **Método:** `POST`
- **URL:** `/auth/forgot-password`
- **Cuerpo (JSON):**
  ```json
  {
    "email": "juan.perez@example.com"
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "message": "Password reset email sent"
  }
  ```

### 5. Restablecer Contraseña

Establece una nueva contraseña utilizando el token recibido.

- **Método:** `POST`
- **URL:** `/auth/reset-password`
- **Cuerpo (JSON):**
  ```json
  {
    "token": "token_recibido_por_email",
    "password": "NuevaPassword123!",
    "password_confirmation": "NuevaPassword123!"
  }
  ```
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "message": "Password reset successfully"
  }
  ```

---

## Módulo: Usuarios (`/users`)

Requiere autenticación: `Authorization: Bearer <TOKEN>`

### Perfil Personal

#### 6. Obtener Mi Perfil

Obtiene la información detallada del perfil del usuario actual.

- **Método:** `GET`
- **URL:** `/users/profile/me`
- **Permisos:** Usuario Autenticado
- **Respuesta (200 OK):**
  ```json
  {
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "Juan",
    "lastNamePaternal": "Perez",
    "lastNameMaternal": "Lopez",
    "dateOfBirth": "1990-05-15",
    "gender": "M",
    "curp": "PELJ900515HDFRRD05",
    "rfc": "PELJ900515HOM",
    "contact": {
      "primary": "5512345678",
      "secondary": "5587654321",
      "alternateEmail": "juan.personal@gmail.com"
    },
    "address": {
      "street": "Av. Reforma",
      "exterior": "123",
      "interior": "A-4",
      "neighborhood": "Centro",
      "city": "Ciudad de México",
      "state": "CDMX",
      "zip": "06000",
      "country": "Mexico"
    },
    "bio": "Desarrollador Full Stack apasionado.",
    "nationality": "Mexicana",
    "updatedAt": "2025-12-11T12:00:00.000Z"
  }
  ```

#### 7. Actualizar Mi Perfil

Actualiza o crea la información del perfil del usuario.

- **Método:** `PUT`
- **URL:** `/users/profile/me`
- **Permisos:** Usuario Autenticado
- **Cuerpo (JSON):**
  ```json
  {
    "firstName": "Juan",
    "lastNamePaternal": "Perez",
    "lastNameMaternal": "Lopez",
    "dateOfBirth": "1990-05-15",
    "gender": "M",
    "curp": "PELJ900515HDFRRD05",
    "rfc": "PELJ900515HOM",
    "phonePrimary": "5512345678",
    "phoneSecondary": null,
    "emailAlternate": "juan.alt@email.com",
    "street": "Av. Reforma",
    "exteriorNumber": "123",
    "interiorNumber": "Dept 4",
    "neighborhood": "Juarez",
    "city": "Cuauhtémoc",
    "state": "Ciudad de México",
    "zipCode": "06600",
    "country": "Mexico",
    "bio": "Actualizando mi biografía...",
    "nationality": "Mexicana"
  }
  ```

### Gestión de Usuarios (Admin)

#### 8. Obtener Todos los Usuarios

- **Método:** `GET`
- **URL:** `/users`
- **Permisos:** Admin, User (Lectura básica)
- **Respuesta:** Lista de usuarios.

#### 9. Obtener Usuario por UUID

- **Método:** `GET`
- **URL:** `/users/:uuid`
- **Ejemplo:** `/users/550e8400-e29b-41d4-a716-446655440000`
- **Permisos:** Admin o el propio usuario.

#### 10. Crear Usuario (Admin)

Crea un usuario directamente y activado.

- **Método:** `POST`
- **URL:** `/users`
- **Permisos:** Admin
- **Cuerpo (JSON):**
  ```json
  {
    "name": "Admin User",
    "email": "admin@empresa.com",
    "password": "Password123!",
    "roleId": 1
  }
  ```

#### 11. Actualizar Usuario

Actualiza información básica.

- **Método:** `PUT`
- **URL:** `/users/:uuid`
- **Permisos:** Admin
- **Cuerpo (JSON/Multipart):**
  ```json
  {
    "name": "Updated Name",
    "email": "updated@email.com"
  }
  ```

#### 12. Actualizar Perfil de Usuario (Admin)

Actualiza la información detallada del perfil de otro usuario. No se puede actualizar a otros administradores.

- **Método:** `PUT`
- **URL:** `/users/profile/:uuid`
- **Permisos:** Admin
- **Cuerpo (JSON):**
  ```json
  {
    "firstName": "Updated Name",
    "bio": "Updated Bio via Admin"
  }
  ```

#### 13. Eliminar Usuario

Realiza un borrado lógico.

- **Método:** `DELETE`
- **URL:** `/users/:uuid`
- **Permisos:** Admin
- **Respuesta (200 OK):**
  ```json
  {
    "success": true,
    "message": "Usuario eliminado exitosamente"
  }
  ```

---

## Módulo: Gestión de Habilidades (Master)

Requiere autenticación y rol **Master**.

### 14. Obtener Habilidades de Usuario

Obtiene la lista de habilidades asignadas específicamente a un usuario.

- **Método:** `GET`
- **URL:** `/users/:uuid/abilities`
- **Permisos:** Master
- **Respuesta (200 OK):**
  ```json
  ["create", "read", "update"]
  ```

### 15. Sincronizar Habilidades de Usuario

Reemplaza todas las habilidades actuales del usuario con la lista proporcionada.

- **Método:** `PUT`
- **URL:** `/users/:uuid/abilities`
- **Permisos:** Master
- **Cuerpo (JSON):**
  ```json
  {
    "abilities": ["create", "read", "update"]
  }
  ```
- **Respuesta (200 OK):** Devuelve la nueva lista de habilidades asignadas.

### 16. Listar Todas las Habilidades del Sistema

Obtiene la lista de todas las habilidades disponibles en el sistema.

- **Método:** `GET`
- **URL:** `/users/abilities`
- **Permisos:** Master
- **Respuesta (200 OK):**
  ```json
  [
    {
      "id": 1,
      "name": "create",
      "createdAt": "...",
      "updatedAt": "..."
    },
    ...
  ]
  ```

---

## Notas de Seguridad y Jerarquía

### Jerarquía de Roles

El sistema utiliza una jerarquía numérica donde un número menor indica mayor privilegio:

1. **Master** (Acceso Total)
2. **Admin** (Administración General)
3. **User** (Usuario Regular)

El middleware de roles verifica si `Usuario.jerarquia <= RolRequerido.jerarquia`.

### Habilidades (RBAC Dinámico)

Además de roles, los usuarios tienen habilidades específicas (`create`, `read`, `update`, `delete`).

- **Master/Admin**: Tienen habilidades asignadas en base de datos.
- **User**: Tienen habilidades específicas asignadas.
- El token JWT incluye estas habilidades para validación en el frontend.
