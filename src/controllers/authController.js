const bcrypt = require('bcryptjs');
const User = require('@/models/User');
const AuthService = require('@/services/AuthService');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.errorResponse('Name, email, and password are required', 400);
    }

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.errorResponse('Email already in use', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Find default role
    const Role = require('@/models/Role');
    const userRole = await Role.findOne({ where: { name: 'user' } });
    
    if (!userRole) {
      return res.errorResponse('Default role not found', 500);
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      roleId: userRole.id
    });

    // Define abilities based on role (simplified logic)
    // In a real app, this might come from a config or policy
    const abilities = ['user:read', 'user:update']; 

    // Generate token
    const token = await AuthService.createToken(user, abilities);

    res.successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Register Error:', error);
    res.errorResponse('Internal Server Error', 500, error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.errorResponse('Email and password are required', 400);
    }

    // Find user with Role
    const user = await User.findOne({ 
      where: { email },
      include: ['Role']
    });
    
    if (!user) {
      return res.errorResponse('Invalid credentials', 401);
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.errorResponse('Invalid credentials', 401);
    }

    // Define abilities based on role
    let abilities = ['user:read']; // Default minimal access
    
    // Check if role exists before accessing name
    const roleName = user.Role ? user.Role.name : 'user';

    if (roleName === 'admin') {
      abilities = ['*']; // Super admin
    } else if (roleName === 'user') {
      abilities = ['user:read', 'user:update'];
    }

    // Generate token
    const token = await AuthService.createToken(user, abilities);

    res.successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    }, 'Login successful');
  } catch (error) {
    console.error('Login Error:', error);
    res.errorResponse('Internal Server Error', 500, error.message);
  }
};
