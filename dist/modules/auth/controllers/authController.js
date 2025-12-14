"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.confirmAccount = exports.login = exports.register = void 0;
const AuthService_1 = __importDefault(require("@/modules/auth/services/AuthService"));
const express_validator_1 = require("express-validator");
const authRules = __importStar(require("@/modules/auth/rules/authRules"));
// Helper to run validations imperatively
const validate = async (req, rules) => {
    await Promise.all(rules.map((validation) => validation.run(req)));
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const error = new Error("Validation Failed");
        error.statusCode = 422;
        error.data = errors.array();
        throw error; // Let the catch block handle response
    }
};
const register = async (req, res) => {
    try {
        // Run validation rules from src/rules/authRules.js
        await validate(req, authRules.registerRules);
        const { name, email, password } = req.body;
        const { user, confirmationToken } = await AuthService_1.default.register({
            name,
            email,
            password,
        });
        // TODO: Send email with confirmationToken here
        console.log(`[Mock Email] Confirmation Token for ${email}: ${confirmationToken}`);
        res.successResponse({
            message: "Registration successful. Please check your email to confirm your account.",
            // Returning token temporarily for ease of testing without email service
            mockConfirmationToken: confirmationToken,
        }, "User registered successfully", 201);
    }
    catch (error) {
        console.error("Register Error:", error);
        const statusCode = error.statusCode || 500;
        // Check if it's a validation error with data
        if (statusCode === 422 && error.data) {
            return res.errorResponse(error.message, statusCode, error.data);
        }
        res.errorResponse(statusCode === 500 ? "Internal Server Error" : error.message, statusCode, error.statusCode ? null : error.message);
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        // Run validation rules
        await validate(req, authRules.loginRules);
        const { email, password } = req.body;
        const { user, token, roleName } = await AuthService_1.default.login(email, password);
        res.successResponse({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: roleName,
            },
            token,
        }, "Login successful");
    }
    catch (error) {
        console.error("Login Error:", error);
        const statusCode = error.statusCode || 500;
        if (statusCode === 422 && error.data) {
            return res.errorResponse(error.message, statusCode, error.data);
        }
        res.errorResponse(statusCode === 500 ? "Internal Server Error" : error.message, statusCode, error.statusCode ? null : error.message);
    }
};
exports.login = login;
const confirmAccount = async (req, res) => {
    try {
        await validate(req, authRules.confirmAccountRules);
        const { token } = req.body;
        await AuthService_1.default.confirmAccount(token);
        res.successResponse(null, "Account confirmed successfully");
    }
    catch (error) {
        console.error("Confirmation Error:", error);
        const statusCode = error.statusCode || 500;
        if (statusCode === 422 && error.data) {
            return res.errorResponse(error.message, statusCode, error.data);
        }
        res.errorResponse(statusCode === 500 ? "Internal Server Error" : error.message, statusCode, error.statusCode ? null : error.message);
    }
};
exports.confirmAccount = confirmAccount;
const forgotPassword = async (req, res) => {
    try {
        await validate(req, authRules.forgotPasswordRules);
        const { email } = req.body;
        const token = await AuthService_1.default.forgotPassword(email);
        // Mock sending email
        // console.log(`[Mock Email] Password Reset Token for ${email}: ${token}`);
        res.successResponse({
            message: "Password reset token sent to email.",
        }, "Reset token generated");
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        if (statusCode === 422 && error.data) {
            return res.errorResponse(error.message, statusCode, error.data);
        }
        res.errorResponse(error.message, statusCode);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        await validate(req, authRules.resetPasswordRules);
        const { token, password } = req.body;
        await AuthService_1.default.resetPassword(token, password);
        res.successResponse(null, "Password has been reset successfully.");
    }
    catch (error) {
        const statusCode = error.statusCode || 500;
        if (statusCode === 422 && error.data) {
            return res.errorResponse(error.message, statusCode, error.data);
        }
        res.errorResponse(error.message, statusCode);
    }
};
exports.resetPassword = resetPassword;
