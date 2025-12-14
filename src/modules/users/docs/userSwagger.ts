/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios y perfiles
 */

/**
 * @swagger
 * /users/profile/me:
 *   get:
 *     summary: Obtener mi perfil
 *     description: Recupera la información detallada del perfil del usuario autenticado actual.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil del usuario recuperado exitosamente.
 *       404:
 *         description: Perfil no encontrado (el usuario debe completarlo).
 *   put:
 *     summary: Actualizar mi perfil
 *     description: Actualiza o crea la información del perfil del usuario autenticado.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastNamePaternal:
 *                 type: string
 *               lastNameMaternal:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [M, F, O]
 *               bio:
 *                 type: string
 *               nationality:
 *                 type: string
 *               phonePrimary:
 *                 type: string
 *               phoneSecondary:
 *                 type: string
 *               address: 
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   exteriorNumber:
 *                     type: string
 *                   interiorNumber:
 *                     type: string
 *                   neighborhood:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country: 
 *                     type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente.
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Listar todos los usuarios
 *     description: Obtiene una lista paginada de todos los usuarios registrados en el sistema.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios recuperada exitosamente.
 *   post:
 *     summary: Crear un nuevo usuario (Admin)
 *     description: Permite a un administrador crear un nuevo usuario directamente con rol.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
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
 *               password:
 *                 type: string
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente.
 */

/**
 * @swagger
 * /users/{uuid}:
 *   get:
 *     summary: Obtener usuario por UUID
 *     description: Recupera los detalles básicos de una cuenta de usuario específica.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del usuario
 *     responses:
 *       200:
 *         description: Detalles del usuario recuperados.
 *       404:
 *         description: Usuario no encontrado.
 *   put:
 *     summary: Actualizar usuario por UUID (Admin)
 *     description: Actualiza la información básica de la cuenta (email, nombre, imagen/avatar).
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente.
 *   delete:
 *     summary: Eliminar usuario por UUID (Admin)
 *     description: Realiza un borrado lógico (soft delete) del usuario.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del usuario
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente.
 */

/**
 * @swagger
 * /users/profile/{uuid}:
 *   put:
 *     summary: Actualizar perfil de otro usuario (Admin)
 *     description: Permite a un administrador actualizar el perfil extendido de cualquier usuario.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *         description: UUID del usuario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastNamePaternal:
 *                 type: string
 *               lastNameMaternal:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [M, F, O]
 *               bio:
 *                 type: string
 *               nationality:
 *                 type: string
 *               phonePrimary:
 *                 type: string
 *               phoneSecondary:
 *                 type: string
 *               address: 
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   exteriorNumber:
 *                     type: string
 *                   interiorNumber:
 *                     type: string
 *                   neighborhood:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *                   country: 
 *                     type: string
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente.
 */

/**
 * @swagger
 * /users/abilities:
 *   get:
 *     summary: Listar todas las habilidades (Master)
 *     description: Obtiene un catálogo de todas las habilidades (permisos) disponibles en el sistema.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de habilidades recuperada.
 */

/**
 * @swagger
 * /users/{uuid}/abilities:
 *   get:
 *     summary: Obtener habilidades de usuario (Master)
 *     description: Lista las habilidades asignadas específicamente a un usuario.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de habilidades del usuario.
 *   put:
 *     summary: Actualizar habilidades de usuario (Master)
 *     description: Reemplaza las habilidades asignadas a un usuario específico.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: uuid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               abilities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Habilidades actualizadas exitosamente.
 */

export { };
