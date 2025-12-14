/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Operaciones de autenticación de usuarios
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     description: Permite registrar un nuevo usuario en la plataforma. Se enviará un correo electrónico para confirmar la cuenta.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - password_confirmation
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Perez
 *               email:
 *                 type: string
 *                 example: juan.perez@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *               password_confirmation:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente. Se ha enviado un correo de confirmación.
 *       400:
 *         description: Error de validación en los datos enviados.
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica a un usuario y devuelve un token JWT para acceder a las rutas protegidas.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan.perez@example.com
 *               password:
 *                 type: string
 *                 example: Password123!
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso. Retorna el token de acceso y datos del usuario.
 *       401:
 *         description: Credenciales inválidas o cuenta no confirmada.
 */

/**
 * @swagger
 * /auth/confirm-account:
 *   post:
 *     summary: Confirmar cuenta de usuario
 *     description: Valida el token enviado por correo electrónico para activar la cuenta del usuario.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token de confirmación recibido por email.
 *     responses:
 *       200:
 *         description: Cuenta confirmada exitosamente.
 *       400:
 *         description: Token inválido o expirado.
 */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Solicitar recuperación de contraseña
 *     description: Envía un correo electrónico con un token para restablecer la contraseña si el usuario existe.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: juan.perez@example.com
 *     responses:
 *       200:
 *         description: Correo de recuperación enviado (si el email existe).
 */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Restablecer contraseña
 *     description: Permite establecer una nueva contraseña utilizando un token válido.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *               - password_confirmation
 *             properties:
 *               token:
 *                 type: string
 *                 description: Token recibido en el correo de recuperación.
 *               password:
 *                 type: string
 *                 example: NuevaPassword123!
 *               password_confirmation:
 *                 type: string
 *                 example: NuevaPassword123!
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente.
 *       400:
 *         description: Token inválido o expirado.
 */

export { };
