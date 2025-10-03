const express = require('express');
const aiController = require('../../controllers/aiController');
const { protect, restrictTo } = require('../../middleware/auth');
const { validate, aiValidation } = require('../../middleware/validation');
const { aiLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

// Public AI endpoints with rate limiting
router.post('/chat', 
  aiLimiter,
  validate(aiValidation.chat),
  aiController.chatbot
);

router.post('/chatbot', 
  aiLimiter,
  validate(aiValidation.chat),
  aiController.chatbot
);

router.post('/assistant', 
  aiLimiter,
  validate(aiValidation.assistant),
  aiController.assistant
);

// Public status endpoint
router.get('/status', aiController.getStatus);

// Public feedback endpoint
router.post('/feedback',
  validate({
    conversationId: require('joi').string().required(),
    rating: require('joi').number().min(1).max(5).required(),
    feedback: require('joi').string().max(1000),
    responseId: require('joi').string()
  }),
  aiController.submitFeedback
);

// Protected admin endpoints
router.use(protect);

router.get('/analytics', 
  restrictTo('Admin', 'Manager'),
  aiController.getAnalytics
);

module.exports = router;