const User = require('../models/User');

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.create({ name, email, role });
    res.successResponse(user, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.successResponse(users, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.errorResponse('User not found', 404);
    }
    res.successResponse(user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.errorResponse('User not found', 404);
    }
    await user.update({ name, email, role });
    res.successResponse(user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.errorResponse('User not found', 404);
    }
    await user.destroy();
    res.successResponse(null, 'User deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};
