const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middlewares/rateLimiter');

// Apply stricter rate limit to authentication routes
router.use(authLimiter);

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/confirm-account', authController.confirmAccount);

module.exports = router;
