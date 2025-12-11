import { NextFunction } from "express";

const roleMiddleware = (roles: string[]) => {
  return (req: any, res: any, next: NextFunction) => {
    if (!req.user) {
      return res.errorResponse('Unauthorized', 401);
    }

    const userRole = req.user.Role ? req.user.Role.name : null;

    if (!userRole || !roles.includes(userRole)) {
      return res.errorResponse('Forbidden: Insufficient permissions', 403);
    }

    next();
  };
};

export default roleMiddleware;
