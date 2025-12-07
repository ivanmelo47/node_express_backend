const AuthService = require('@/services/AuthService');
const { validationResult } = require('express-validator');
const authRules = require('@/rules/authRules');

// Helper to run validations imperatively
const validate = async (req, rules) => {
    await Promise.all(rules.map(validation => validation.run(req)));
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation Failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw error; // Let the catch block handle response
    }
};

exports.register = async (req, res) => {
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

  } catch (error) {
    console.error('Register Error:', error);
    const statusCode = error.statusCode || 500;
    // Check if it's a validation error with data
    if (statusCode === 422 && error.data) {
        return res.errorResponse(error.message, statusCode, error.data);
    }
    res.errorResponse(statusCode === 500 ? 'Internal Server Error' : error.message, statusCode, error.statusCode ? null : error.message);
  }
};

exports.login = async (req, res) => {
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

  } catch (error) {
    console.error('Login Error:', error);
    const statusCode = error.statusCode || 500;
     if (statusCode === 422 && error.data) {
        return res.errorResponse(error.message, statusCode, error.data);
    }
    res.errorResponse(statusCode === 500 ? 'Internal Server Error' : error.message, statusCode, error.statusCode ? null : error.message);
  }
};

exports.confirmAccount = async (req, res) => {
  try {
    await validate(req, authRules.confirmAccountRules);

    const { token } = req.body;
    await AuthService.confirmAccount(token);

    res.successResponse(null, 'Account confirmed successfully');

  } catch (error) {
    console.error('Confirmation Error:', error);
    const statusCode = error.statusCode || 500;
     if (statusCode === 422 && error.data) {
        return res.errorResponse(error.message, statusCode, error.data);
    }
    res.errorResponse(statusCode === 500 ? 'Internal Server Error' : error.message, statusCode, error.statusCode ? null : error.message);
  }
};
