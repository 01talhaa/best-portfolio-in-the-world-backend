const express = require('express');
const searchController = require('../../controllers/searchController');
const { protect, restrictTo } = require('../../middleware/auth');
const { searchLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

// Public search endpoints with rate limiting
router.get('/global', 
  searchLimiter,
  searchController.globalSearch
);

router.get('/smart', 
  searchLimiter,
  searchController.smartSearch
);

router.get('/autocomplete', 
  searchController.getAutocomplete
);

// Protected admin endpoints
router.use(protect);

router.get('/analytics', 
  restrictTo('Admin', 'Manager'),
  searchController.getSearchAnalytics
);

module.exports = router;