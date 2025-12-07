const { body } = require('express-validator');

const registerRules = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .withMessage('Name must be a string'),
    body('email')
        .isEmail().withMessage('Must be a valid email address'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const loginRules = [
    body('email')
        .isEmail().withMessage('Must be a valid email address'),
    body('password')
        .notEmpty().withMessage('Password is required')
];

module.exports = {
    registerRules,
    loginRules
};
