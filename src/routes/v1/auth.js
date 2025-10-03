const express = require('express');
const { 
  register, 
  login, 
  logout, 
  refreshToken 
} = require('../../middleware/auth');
const { validate, authValidation } = require('../../middleware/validation');
const { authLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

// Auth routes with rate limiting
router.post('/register', 
  authLimiter,
  validate(authValidation.register),
  register
);

router.post('/login', 
  authLimiter,
  validate(authValidation.login),
  login
);

router.post('/logout', logout);

router.post('/refresh-token', 
  authLimiter,
  refreshToken
);

// TODO: Add password reset routes
// router.post('/forgot-password', forgotPassword);
// router.patch('/reset-password/:token', resetPassword);

module.exports = router;