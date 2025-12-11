import UserService from '@/services/UserService';
import UserResource from '@/resources/UserResource';
import { Request, NextFunction } from 'express';

export const createUser = async (req: Request, res: any, next: NextFunction) => {
  try {
    const user = await UserService.createUser(req.body);
    // @ts-ignore
    res.successResponse(new UserResource(user).resolve(), 'Usuario creado exitosamente', 201);
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: any, next: NextFunction) => {
  try {
    const users = await UserService.getAllUsers();
    res.successResponse(UserResource.collection(users), 'Usuarios recuperados exitosamente');
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: any, next: NextFunction) => {
  try {
    const user = await UserService.getUserById(Number(req.params.id));
    if (!user) {
      return res.errorResponse('Usuario no encontrado', 404);
    }
    // @ts-ignore
    res.successResponse(new UserResource(user).resolve(), 'Usuario recuperado exitosamente');
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: Request, res: any, next: NextFunction) => {
  try {
    // Delegar toda la lógica de subida y actualización al servicio
    const user = await UserService.updateUser(Number(req.params.id), req, res);
    
    if (!user) {
      return res.errorResponse('Usuario no encontrado', 404);
    }
    // @ts-ignore
    res.successResponse(new UserResource(user).resolve(), 'Usuario actualizado exitosamente');
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: any, next: NextFunction) => {
  try {
    const success = await UserService.deleteUser(Number(req.params.id));
    if (!success) {
      return res.errorResponse('Usuario no encontrado', 404);
    }
    res.successResponse(null, 'Usuario eliminado exitosamente', 200);
  } catch (error) {
    next(error);
  }
};
