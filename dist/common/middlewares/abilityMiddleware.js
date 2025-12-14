"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const abilityMiddleware = (ability) => {
    return (req, res, next) => {
        // Ensure request is authenticated
        if (!req.token) {
            return res.errorResponse('Unauthorized: No token provided', 401);
        }
        // Check ability using the helper method on the token model
        if (!req.token.can(ability)) {
            return res.errorResponse(`Forbidden: Missing ability [${ability}]`, 403);
        }
        next();
    };
};
exports.default = abilityMiddleware;
