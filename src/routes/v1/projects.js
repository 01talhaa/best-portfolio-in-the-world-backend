const express = require('express');
const projectController = require('../../controllers/projectController');
const { protect, restrictTo, checkPermission } = require('../../middleware/auth');
const { validate, queryValidation } = require('../../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', validate(queryValidation, 'query'), projectController.getAll);
router.get('/featured', projectController.getFeatured);
router.get('/recent', projectController.getRecent);
router.get('/analytics', projectController.getAnalytics);
router.get('/stats', projectController.getStats);
router.get('/search', projectController.search);
router.get('/timeline', projectController.getTimeline);
router.get('/category/:categoryName', projectController.getByCategory);
router.get('/status/:status', projectController.getByStatus);
router.get('/:id', projectController.getById);
router.get('/:projectId/recommendations', projectController.getRecommendations);

// Protected routes - require authentication
router.use(protect);

// Routes that require specific permissions
router.post('/', 
  restrictTo('Admin', 'Manager', 'Editor'),
  checkPermission('projects', 'create'),
  projectController.create
);

router.put('/:id', 
  restrictTo('Admin', 'Manager', 'Editor'),
  checkPermission('projects', 'update'),
  projectController.update
);

router.delete('/:id', 
  restrictTo('Admin'),
  checkPermission('projects', 'delete'),
  projectController.delete
);

module.exports = router;