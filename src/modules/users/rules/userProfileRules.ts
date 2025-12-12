import { body } from "express-validator";

export const updateProfileRules = [
  body("firstName")
    .optional()
    .notEmpty()
    .withMessage("First name cannot be empty")
    .trim()
    .escape(),
  body("lastNamePaternal")
    .optional()
    .notEmpty()
    .withMessage("Paternal last name cannot be empty")
    .trim()
    .escape(),
  body("lastNameMaternal").optional().trim().escape(),
  body("dateOfBirth")
    .optional()
    .isDate()
    .withMessage("Invalid date format (YYYY-MM-DD)"),
  body("gender")
    .optional()
    .isIn(["M", "F", "O"])
    .withMessage("Gender must be M, F, or O"),
  body("curp")
    .optional()
    .isLength({ min: 18, max: 18 })
    .withMessage("CURP must be 18 characters")
    .trim()
    .escape(),
  body("rfc")
    .optional()
    .isLength({ min: 12, max: 13 })
    .withMessage("RFC must be 12 or 13 characters")
    .trim()
    .escape(),
  body("phonePrimary")
    .optional()
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),
  body("phoneSecondary")
    .optional()
    .isMobilePhone("any")
    .withMessage("Invalid phone number"),
  body("emailAlternate")
    .optional()
    .isEmail()
    .withMessage("Invalid email")
    .normalizeEmail(),
  body("street").optional().trim().escape(),
  body("exteriorNumber").optional().trim().escape(),
  body("interiorNumber").optional().trim().escape(),
  body("neighborhood").optional().trim().escape(),
  body("city").optional().trim().escape(),
  body("state").optional().trim().escape(),
  body("zipCode")
    .optional()
    .isPostalCode("any")
    .withMessage("Invalid zip code"),
  body("country").optional().trim().escape(),
  body("bio").optional().trim().escape(),
  body("nationality").optional().trim().escape(),
];
