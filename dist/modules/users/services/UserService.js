"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const User_1 = __importDefault(require("@/modules/users/models/User"));
const ImageService_1 = __importDefault(require("@/common/services/ImageService"));
// @ts-ignore
const database_1 = __importDefault(require("@/config/database"));
const uploadHelper_1 = require("@/common/helpers/uploadHelper");
const path_1 = __importDefault(require("path"));
class UserService {
    /**
     * Crea un nuevo usuario.
     * @param {Object} data - Datos del usuario (nombre, email, roleId, etc.).
     * @returns {Promise<User>}
     */
    static async createUser(data) {
        const t = await database_1.default.init();
        try {
            // Si se proporciona el nombre del rol en lugar del ID, resolverlo (lógica de ayuda opcional)
            // Por ahora asumimos que el controlador pasa una estructura de datos válida que coincide con el modelo
            const user = await User_1.default.create(data, { transaction: t });
            await database_1.default.commit(t);
            return user;
        }
        catch (error) {
            await database_1.default.rollback(t);
            // Limpieza: si se subió una imagen pero la BD falló, eliminar los archivos de imagen
            if (data.image) {
                const uploadPath = path_1.default.join(__dirname, '../../../../public/uploads/profiles');
                ImageService_1.default.deleteProfileImage(uploadPath, data.image);
            }
            throw error;
        }
    }
    /**
     * Obtiene todos los usuarios.
     * @returns {Promise<Array<User>>}
     */
    static async getAllUsers() {
        return await User_1.default.findAll({
            include: ['Role'] // Incluir información del rol por defecto
        });
    }
    /**
     * Obtiene un usuario por UUID.
     * @param {string} uuid
     * @returns {Promise<User|null>}
     */
    static async getUserByUuid(uuid) {
        return await User_1.default.findOne({
            where: { uuid },
            include: ['Role']
        });
    }
    /**
     * Actualiza un usuario.
     * Soporta sobrecarga: puede recibir el objeto request (req) para manejar la subida de archivos internamente.
     *
     * @param {string} uuid - UUID del usuario a actualizar.
     * @param {Object} dataOrReq - Objeto de datos  o el objeto request de Express.
     * @param {Object} [res=null] - Objeto response de Express (necesario si se usa req).
     * @returns {Promise<User|null>} - Usuario actualizado o null si no se encuentra.
     */
    static async updateUser(uuid, dataOrReq, res = null) {
        const t = await database_1.default.init();
        const uploadPath = path_1.default.join(__dirname, '../../../../public/uploads/profiles');
        let data = {};
        let newImageName = null;
        try {
            // Checar si el segundo argumento es el objeto 'req' (o equivalente)
            if (res && dataOrReq.on) {
                const req = dataOrReq;
                // Manejar la subida del archivo a memoria
                await (0, uploadHelper_1.handleMemoryUpload)('image', req, res);
                data = { ...req.body };
                if (req.file) {
                    const imageResult = await ImageService_1.default.processProfileImage(req.file.buffer, uploadPath);
                    newImageName = imageResult.baseName;
                    data.image = newImageName;
                }
            }
            else {
                data = dataOrReq;
                newImageName = data.image; // Si se pasa directamente
            }
            const user = await User_1.default.findOne({ where: { uuid }, transaction: t });
            if (!user) {
                await database_1.default.rollback(t);
                // Si el usuario no se encuentra, pero subimos una imagen, borrar la imagen nueva
                if (newImageName) {
                    ImageService_1.default.deleteProfileImage(uploadPath, newImageName);
                }
                return null;
            }
            const oldImage = user.image;
            await user.update(data, { transaction: t });
            await database_1.default.commit(t);
            // Realizar el borrado de la imagen VIEJA después de un commit exitoso
            if (newImageName && oldImage && newImageName !== oldImage) {
                ImageService_1.default.deleteProfileImage(uploadPath, oldImage);
            }
            return user;
        }
        catch (error) {
            await database_1.default.rollback(t);
            // Limpieza: si la actualización falló, borrar la imagen NUEVA que se subió
            if (newImageName) {
                ImageService_1.default.deleteProfileImage(uploadPath, newImageName);
            }
            throw error;
        }
    }
    /**
     * Elimina un usuario (soft delete).
     * @param {string} uuid
     * @returns {Promise<boolean>} - True si se eliminó, false si no se encontró
     */
    static async deleteUser(uuid) {
        const t = await database_1.default.init();
        try {
            const user = await User_1.default.findOne({ where: { uuid }, transaction: t });
            if (!user) {
                await database_1.default.rollback(t);
                return false;
            }
            // Soft delete: NO borrar los archivos de imagen.
            // Mantenemos la imagen en caso de restauración.
            await user.destroy({ transaction: t });
            await database_1.default.commit(t);
            return true;
        }
        catch (error) {
            await database_1.default.rollback(t);
            throw error;
        }
    }
    /**
     * Obtiene las habilidades de un usuario por UUID.
     */
    static async getUserAbilities(uuid) {
        const user = await User_1.default.findOne({
            where: { uuid },
            include: ['abilities']
        });
        if (!user)
            return null;
        return user.abilities;
    }
    /**
     * Sincroniza las habilidades de un usuario.
     * Reemplaza las habilidades actuales con la lista proporcionada.
     */
    static async syncUserAbilities(uuid, abilityNames) {
        const t = await database_1.default.init();
        try {
            const user = await User_1.default.findOne({ where: { uuid }, transaction: t });
            if (!user) {
                await database_1.default.rollback(t);
                return null;
            }
            // @ts-ignore
            const Ability = await Promise.resolve().then(() => __importStar(require('@/modules/users/models/Ability'))).then(m => m.default);
            // Obtener los IDs de las habilidades solicitadas
            const abilities = await Ability.findAll({
                where: {
                    name: abilityNames
                },
                transaction: t
            });
            // Actualizar relaciones (setAbilities reemplaza las existentes)
            // @ts-ignore
            await user.setAbilities(abilities, { transaction: t });
            await database_1.default.commit(t);
            return abilities;
        }
        catch (error) {
            await database_1.default.rollback(t);
            throw error;
        }
    }
    /**
     * Obtiene todas las habilidades disponibles en el sistema.
     */
    static async getAllAbilities() {
        // @ts-ignore
        const Ability = await Promise.resolve().then(() => __importStar(require('@/modules/users/models/Ability'))).then(m => m.default);
        return await Ability.findAll();
    }
}
exports.default = UserService;
