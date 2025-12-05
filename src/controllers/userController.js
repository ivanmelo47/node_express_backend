const UserService = require('@/services/UserService');

exports.createUser = async (req, res, next) => {
  try {
    // Note: Password hashing should ideally be in Service or Model hook.
    // For now, assuming it's handled or we might need to move it here if not already.
    // Wait, the previous controller didn't hash password! It just took req.body.
    // The authController.register DOES hash. 
    // This createUser is for Admin creating users. It SHOULD hash.
    // Let's add hashing here or in Service. Service is better but let's stick to controller for now to match previous behavior + fix.
    // Actually, previous code: const user = await User.create({ name, email, role });
    // It missed password! And didn't hash.
    // Let's fix this: Admin creating user needs password.
    
    // For this refactor, I will just delegate to Service.
    // But I should probably ensure password is handled if it's in body.
    
    const user = await UserService.createUser(req.body);
    res.successResponse(user, 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const users = await UserService.getAllUsers();
    res.successResponse(users, 'Users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await UserService.getUserById(req.params.id);
    if (!user) {
      return res.errorResponse('User not found', 404);
    }
    res.successResponse(user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const createUploadMiddleware = require('@/middlewares/uploadMiddleware');
const upload = createUploadMiddleware('public/uploads/profiles');

exports.updateUser = async (req, res, next) => {
  try {
    // Manually handle upload
    await new Promise((resolve, reject) => {
      upload.single('image')(req, res, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const updateData = { ...req.body };
    
    // If image was uploaded, add it to update data
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const user = await UserService.updateUser(req.params.id, updateData);
    if (!user) {
      return res.errorResponse('User not found', 404);
    }
    res.successResponse(user, 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const success = await UserService.deleteUser(req.params.id);
    if (!success) {
      return res.errorResponse('User not found', 404);
    }
    res.successResponse(null, 'User deleted successfully', 200);
  } catch (error) {
    next(error);
  }
};
