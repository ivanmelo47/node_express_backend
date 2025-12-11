import { body } from 'express-validator';

export const registerRules = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .withMessage('Name must be a string')
        .trim().escape(),
    body('email')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

export const loginRules = [
    body('email')
        .isEmail().withMessage('Must be a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

export const confirmAccountRules = [
    body('token')
        .notEmpty().withMessage('Token is required')
        .escape()
];
