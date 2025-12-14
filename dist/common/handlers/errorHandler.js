"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            message: 'Validation error',
            errors: err.errors.map((e) => e.message)
        });
    }
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            message: 'Conflict error',
            errors: err.errors.map((e) => e.message)
        });
    }
    res.status(500).json({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
};
exports.default = errorHandler;
