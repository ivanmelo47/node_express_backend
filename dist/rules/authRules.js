"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confirmAccountRules = exports.loginRules = exports.registerRules = void 0;
const express_validator_1 = require("express-validator");
exports.registerRules = [
    (0, express_validator_1.body)("name")
        .notEmpty()
        .withMessage("Name is required")
        .withMessage("Name must be a string")
        .trim()
        .escape(),
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
    (0, express_validator_1.body)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    (0, express_validator_1.body)("password_confirmation").custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password confirmation does not match password");
        }
        return true;
    }),
];
exports.loginRules = [
    (0, express_validator_1.body)("email")
        .isEmail()
        .withMessage("Must be a valid email address")
        .normalizeEmail(),
    (0, express_validator_1.body)("password").notEmpty().withMessage("Password is required"),
];
exports.confirmAccountRules = [
    (0, express_validator_1.body)("token").notEmpty().withMessage("Token is required").escape(),
];
