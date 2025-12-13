import { NextFunction } from "express";

const roleMiddleware = (roles: string[]) => {
  return async (req: any, res: any, next: NextFunction) => {
    if (!req.user) {
      return res.errorResponse('Unauthorized', 401);
    }

    const userRole = req.user.Role;

    if (!userRole) {
      return res.errorResponse('Forbidden: Insufficient permissions', 403);
    }

    // Dynamic Hierarchy Check
    try {
      // @ts-ignore
      const RoleModel = await import('@/modules/users/models/Role').then(m => m.default);

      // Get the hierarchy level of the roles allowed to access this route
      const allowedRoles = await RoleModel.findAll({
        where: {
          name: roles
        }
      });

      // Find the "minimum privilege" (highest hierarchy number) allowed.
      // e.g. if allowed is ['admin'], hierarchy is 2. We allow anyone with <= 2.
      // If allowed is ['user'], hierarchy is 3. We allow anyone with <= 3.
      // If allowed is ['admin', 'user'], max hierarchy is 3. We allow <= 3.
      const maxAllowedHierarchy = Math.max(...allowedRoles.map((r: any) => r.hierarchy));

      // User must have equal or higher privilege (lower or equal hierarchy number)
      if (userRole.hierarchy <= maxAllowedHierarchy) {
        return next();
      }

      return res.errorResponse('Forbidden: Insufficient permissions', 403);

    } catch (error) {
      console.error('Role middleware error:', error);
      return res.errorResponse('Internal Server Error', 500);
    }
  };
};

export default roleMiddleware;
