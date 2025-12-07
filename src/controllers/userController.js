const UserService = require('@/services/UserService');
const UserResource = require('@/resources/UserResource');

exports.createUser = async (req, res, next) => {
  try {
    const user = await UserService.createUser(req.body);
    res.successResponse(new UserResource(user).resolve(), 'Usuario creado exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.successResponse(UserResource.collection(users), 'Usuarios recuperados exitosamente');
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) {
      return res.errorResponse('Usuario no encontrado', 404);
    }
    res.successResponse(new UserResource(user).resolve(), 'Usuario recuperado exitosamente');
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    // Delegar toda la lógica de subida y actualización al servicio
    const user = await UserService.updateUser(req.params.id, req, res);
    
    if (!user) {
      return res.errorResponse('Usuario no encontrado', 404);
    }
    res.successResponse(new UserResource(user).resolve(), 'Usuario actualizado exitosamente');
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const success = await UserService.deleteUser(req.params.id);
    if (!success) {
      return res.errorResponse('Usuario no encontrado', 404);
    }
    res.successResponse(null, 'Usuario eliminado exitosamente', 200);
  } catch (error) {
    next(error);
  }
};
