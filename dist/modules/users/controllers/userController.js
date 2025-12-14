"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listAbilities = exports.updateUserAbilities = exports.getUserAbilities = exports.deleteUser = exports.updateUser = exports.getUserByUuid = exports.getUsers = exports.createUser = void 0;
const UserService_1 = __importDefault(require("@/modules/users/services/UserService"));
const UserResource_1 = __importDefault(require("@/modules/users/resources/UserResource"));
const createUser = async (req, res, next) => {
    try {
        const user = await UserService_1.default.createUser(req.body);
        // @ts-ignore
        res.successResponse(new UserResource_1.default(user).resolve(), 'Usuario creado exitosamente', 201);
    }
    catch (error) {
        next(error);
    }
};
exports.createUser = createUser;
const getUsers = async (req, res, next) => {
    try {
        const users = await UserService_1.default.getAllUsers();
        res.successResponse(UserResource_1.default.collection(users), 'Usuarios recuperados exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.getUsers = getUsers;
const getUserByUuid = async (req, res, next) => {
    try {
        const user = await UserService_1.default.getUserByUuid(req.params.uuid);
        if (!user) {
            return res.errorResponse('Usuario no encontrado', 404);
        }
        // @ts-ignore
        res.successResponse(new UserResource_1.default(user).resolve(), 'Usuario recuperado exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.getUserByUuid = getUserByUuid;
const updateUser = async (req, res, next) => {
    try {
        // Delegar toda la lógica de subida y actualización al servicio
        const user = await UserService_1.default.updateUser(req.params.uuid, req, res);
        if (!user) {
            return res.errorResponse('Usuario no encontrado', 404);
        }
        // @ts-ignore
        res.successResponse(new UserResource_1.default(user).resolve(), 'Usuario actualizado exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res, next) => {
    try {
        const success = await UserService_1.default.deleteUser(req.params.uuid);
        if (!success) {
            return res.errorResponse('Usuario no encontrado', 404);
        }
        res.successResponse(null, 'Usuario eliminado exitosamente', 200);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteUser = deleteUser;
const getUserAbilities = async (req, res, next) => {
    try {
        const abilities = await UserService_1.default.getUserAbilities(req.params.uuid);
        if (!abilities) {
            return res.errorResponse('Usuario no encontrado', 404);
        }
        res.successResponse(abilities, 'Habilidades recuperadas exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.getUserAbilities = getUserAbilities;
const updateUserAbilities = async (req, res, next) => {
    try {
        const { abilities } = req.body;
        if (!Array.isArray(abilities)) {
            return res.errorResponse('El formato de habilidades es inválido. Se espera un arreglo de strings.', 400);
        }
        const updatedAbilities = await UserService_1.default.syncUserAbilities(req.params.uuid, abilities);
        if (!updatedAbilities) {
            return res.errorResponse('Usuario no encontrado o error al actualizar habilidades', 404);
        }
        res.successResponse(updatedAbilities, 'Habilidades actualizadas exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.updateUserAbilities = updateUserAbilities;
const listAbilities = async (req, res, next) => {
    try {
        const abilities = await UserService_1.default.getAllAbilities();
        res.successResponse(abilities, 'Habilidades del sistema recuperadas exitosamente');
    }
    catch (error) {
        next(error);
    }
};
exports.listAbilities = listAbilities;
