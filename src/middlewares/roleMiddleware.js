const roleMiddleware = (roles) => {
  return (req, res, next) => {
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

module.exports = roleMiddleware;
