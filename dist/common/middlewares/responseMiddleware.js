"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const responseMiddleware = (req, res, next) => {
    res.successResponse = (data, message = 'Operación exitosa.', code = 200, icon = 'success') => {
        return res.status(code).json({
            message,
            code,
            icon,
            data,
        });
    };
    res.errorResponse = (message = 'Ha ocurrido un error.', code = 500, data = null) => {
        return res.status(code).json({
            message,
            code,
            icon: 'error',
            data,
        });
    };
    next();
};
exports.default = responseMiddleware;
