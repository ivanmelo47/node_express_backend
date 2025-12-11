import AuthService from '@/services/AuthService';
import { validationResult } from 'express-validator';
import * as authRules from '@/rules/authRules';
import { Request, Response } from 'express';

// Helper to run validations imperatively
const validate = async (req: Request, rules: any[]) => {
    await Promise.all(rules.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error: any = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error; // Let the catch block handle response
    }
};

export const register = async (req: Request, res: any) => {
  try {
    // Run validation rules from src/rules/authRules.js
    await validate(req, authRules.registerRules);

    const { name, email, password } = req.body;

    const { user, confirmationToken } = await AuthService.register({ name, email, password });

    // TODO: Send email with confirmationToken here
    console.log(`[Mock Email] Confirmation Token for ${email}: ${confirmationToken}`);

    res.successResponse({
      message: 'Registration successful. Please check your email to confirm your account.',
      // Returning token temporarily for ease of testing without email service
      mockConfirmationToken: confirmationToken 
    }, 'User registered successfully', 201);

  } catch (error: any) {
    console.error('Register Error:', error);
    const statusCode = error.statusCode || 500;
    // Check if it's a validation error with data
    if (statusCode === 422 && error.data) {
        return res.errorResponse(error.message, statusCode, error.data);
    }
    res.errorResponse(statusCode === 500 ? 'Internal Server Error' : error.message, statusCode, error.statusCode ? null : error.message);
  }
};

export const login = async (req: Request, res: any) => {
  try {
    // Run validation rules
    await validate(req, authRules.loginRules);

    const { email, password } = req.body;

    const { user, token, roleName } = await AuthService.login(email, password);

    res.successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: roleName
      },
      token,
    }, 'Login successful');

  } catch (error: any) {
    console.error('Login Error:', error);
    const statusCode = error.statusCode || 500;
     if (statusCode === 422 && error.data) {
        return res.errorResponse(error.message, statusCode, error.data);
    }
    res.errorResponse(statusCode === 500 ? 'Internal Server Error' : error.message, statusCode, error.statusCode ? null : error.message);
  }
};

export const confirmAccount = async (req: Request, res: any) => {
  try {
    await validate(req, authRules.confirmAccountRules);

    const { token } = req.body;
    await AuthService.confirmAccount(token);

    res.successResponse(null, 'Account confirmed successfully');

  } catch (error: any) {
    console.error('Confirmation Error:', error);
    const statusCode = error.statusCode || 500;
     if (statusCode === 422 && error.data) {
        return res.errorResponse(error.message, statusCode, error.data);
    }
    res.errorResponse(statusCode === 500 ? 'Internal Server Error' : error.message, statusCode, error.statusCode ? null : error.message);
  }
};
