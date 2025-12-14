"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfileRules = void 0;
const express_validator_1 = require("express-validator");
exports.updateProfileRules = [
    (0, express_validator_1.body)("firstName")
        .optional()
        .notEmpty()
        .withMessage("First name cannot be empty")
        .trim()
        .escape(),
    (0, express_validator_1.body)("lastNamePaternal")
        .optional()
        .notEmpty()
        .withMessage("Paternal last name cannot be empty")
        .trim()
        .escape(),
    (0, express_validator_1.body)("lastNameMaternal").optional().trim().escape(),
    (0, express_validator_1.body)("dateOfBirth")
        .optional()
        .isDate()
        .withMessage("Invalid date format (YYYY-MM-DD)"),
    (0, express_validator_1.body)("gender")
        .optional()
        .isIn(["M", "F", "O"])
        .withMessage("Gender must be M, F, or O"),
    (0, express_validator_1.body)("curp")
        .optional()
        .isLength({ min: 18, max: 18 })
        .withMessage("CURP must be 18 characters")
        .trim()
        .escape(),
    (0, express_validator_1.body)("rfc")
        .optional()
        .isLength({ min: 12, max: 13 })
        .withMessage("RFC must be 12 or 13 characters")
        .trim()
        .escape(),
    (0, express_validator_1.body)("phonePrimary")
        .optional()
        .isMobilePhone("any")
        .withMessage("Invalid phone number"),
    (0, express_validator_1.body)("phoneSecondary")
        .optional()
        .isMobilePhone("any")
        .withMessage("Invalid phone number"),
    (0, express_validator_1.body)("emailAlternate")
        .optional()
        .isEmail()
        .withMessage("Invalid email")
        .normalizeEmail(),
    (0, express_validator_1.body)("street").optional().trim().escape(),
    (0, express_validator_1.body)("exteriorNumber").optional().trim().escape(),
    (0, express_validator_1.body)("interiorNumber").optional().trim().escape(),
    (0, express_validator_1.body)("neighborhood").optional().trim().escape(),
    (0, express_validator_1.body)("city").optional().trim().escape(),
    (0, express_validator_1.body)("state").optional().trim().escape(),
    (0, express_validator_1.body)("zipCode")
        .optional()
        .isPostalCode("any")
        .withMessage("Invalid zip code"),
    (0, express_validator_1.body)("country").optional().trim().escape(),
    (0, express_validator_1.body)("bio").optional().trim().escape(),
    (0, express_validator_1.body)("nationality").optional().trim().escape(),
];
