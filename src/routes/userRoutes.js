const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

const roleMiddleware = require('../middlewares/roleMiddleware');
const abilityMiddleware = require('../middlewares/abilityMiddleware');

// Public or Authenticated routes (depending on requirements, here keeping them authenticated)
router.get('/', authMiddleware, abilityMiddleware('user:read'), userController.getUsers);
router.get('/:id', authMiddleware, abilityMiddleware('user:read'), userController.getUserById);

// Admin only routes (also checking for specific abilities for granularity)
router.post('/', authMiddleware, roleMiddleware(['admin']), abilityMiddleware('user:create'), userController.createUser);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), abilityMiddleware('user:update'), userController.updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), abilityMiddleware('user:delete'), userController.deleteUser);

module.exports = router;
