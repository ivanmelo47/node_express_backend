import { Request, Response, NextFunction } from 'express';

const responseMiddleware = (req: Request, res: any, next: NextFunction) => {
  res.successResponse = (data: any, message: string = 'Operación exitosa.', code: number = 200, icon: string = 'success') => {
    return res.status(code).json({
      message,
      code,
      icon,
      data,
    });
  };

  res.errorResponse = (message: string = 'Ha ocurrido un error.', code: number = 500, data: any = null) => {
    return res.status(code).json({
      message,
      code,
      icon: 'error',
      data,
    });
  };

  next();
};

export default responseMiddleware;
