const User = require('@/models/User');
const Role = require('@/models/Role');
const ImageService = require('@/services/ImageService');
const db = require('@/config/database');
const { handleMemoryUpload } = require('@/helpers/uploadHelper');
const fs = require('fs');
const path = require('path');

class UserService {
  /**
   * Crea un nuevo usuario.
   * @param {Object} data - Datos del usuario (nombre, email, roleId, etc.).
   * @returns {Promise<User>}
   */
  static async createUser(data) {
    const t = await db.init();
    try {
      // Si se proporciona el nombre del rol en lugar del ID, resolverlo (lógica de ayuda opcional)
      // Por ahora asumimos que el controlador pasa una estructura de datos válida que coincide con el modelo
      const user = await User.create(data, { transaction: t });
      await db.commit(t);
      return user;
    } catch (error) {
      await db.rollback(t);
      // Limpieza: si se subió una imagen pero la BD falló, eliminar los archivos de imagen
      if (data.image) {
        const uploadPath = path.join(__dirname, '../../public/uploads/profiles');
        ImageService.deleteProfileImage(uploadPath, data.image);
      }
      throw error;
    }
  }

  /**
   * Obtiene todos los usuarios.
   * @returns {Promise<Array<User>>}
   */
  static async getAllUsers() {
    return await User.findAll({
      include: ['Role'] // Incluir información del rol por defecto
    });
  }

  /**
   * Obtiene un usuario por ID.
   * @param {number} id
   * @returns {Promise<User|null>}
   */
  static async getUserById(id) {
    return await User.findByPk(id, {
      include: ['Role']
    });
  }

  /**
   * Actualiza un usuario.
   * Soporta sobrecarga: puede recibir el objeto request (req) para manejar la subida de archivos internamente.
   * 
   * @param {number} id - ID del usuario a actualizar.
   * @param {Object} dataOrReq - Objeto de datos  o el objeto request de Express.
   * @param {Object} [res=null] - Objeto response de Express (necesario si se usa req).
   * @returns {Promise<User|null>} - Usuario actualizado o null si no se encuentra.
   */
  static async updateUser(id, dataOrReq, res = null) {
    const t = await db.init();
    const uploadPath = path.join(__dirname, '../../public/uploads/profiles');
    let data = {};
    let newImageName = null;

    try {
      // Checar si el segundo argumento es el objeto 'req' (o equivalente)
      if (res && dataOrReq.on) { 
          const req = dataOrReq;
          // Manejar la subida del archivo a memoria
          await handleMemoryUpload('image', req, res);
          
          data = { ...req.body };

          if (req.file) {
              const imageResult = await ImageService.processProfileImage(req.file.buffer, uploadPath);
              newImageName = imageResult.baseName;
              data.image = newImageName;
          }
      } else {
          data = dataOrReq;
          newImageName = data.image; // Si se pasa directamente
      }

      const user = await User.findByPk(id, { transaction: t });
      if (!user) {
        await db.rollback(t);
        // Si el usuario no se encuentra, pero subimos una imagen, borrar la imagen nueva
        if (newImageName) {
            ImageService.deleteProfileImage(uploadPath, newImageName);
        }
        return null;
      }

      const oldImage = user.image;

      await user.update(data, { transaction: t });
      await db.commit(t);

      // Realizar el borrado de la imagen VIEJA después de un commit exitoso
      if (newImageName && oldImage && newImageName !== oldImage) {
        ImageService.deleteProfileImage(uploadPath, oldImage);
      }

      return user;
    } catch (error) {
      await db.rollback(t);
      // Limpieza: si la actualización falló, borrar la imagen NUEVA que se subió
      if (newImageName) {
        ImageService.deleteProfileImage(uploadPath, newImageName);
      }
      throw error;
    }
  }

  /**
   * Elimina un usuario (soft delete).
   * @param {number} id
   * @returns {Promise<boolean>} - True si se eliminó, false si no se encontró
   */
  static async deleteUser(id) {
    const t = await db.init();
    try {
      const user = await User.findByPk(id, { transaction: t });
      if (!user) {
        await db.rollback(t);
        return false;
      }

      // Soft delete: NO borrar los archivos de imagen.
      // Mantenemos la imagen en caso de restauración.
      
      await user.destroy({ transaction: t });
      await db.commit(t);
      
      return true;
    } catch (error) {
      await db.rollback(t);
      throw error;
    }
  }
}

module.exports = UserService;
