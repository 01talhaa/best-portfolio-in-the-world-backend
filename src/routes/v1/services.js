const express = require('express');
const serviceController = require('../../controllers/serviceController');
const { protect, restrictTo, checkPermission } = require('../../middleware/auth');
const { validate, serviceValidation, queryValidation } = require('../../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', validate(queryValidation, 'query'), serviceController.getAll);
router.get('/featured', serviceController.getFeatured);
router.get('/popular', serviceController.getPopular);
router.get('/analytics', serviceController.getAnalytics);
router.get('/stats', serviceController.getStats);
router.get('/search', serviceController.search);
router.get('/category/:categoryName', serviceController.getByCategory);
router.get('/with-project-count', serviceController.getWithProjectCount);
router.get('/:id', serviceController.getById);

// Protected routes - require authentication
router.use(protect);

// Routes that require specific permissions
router.post('/', 
  restrictTo('Admin', 'Editor'),
  checkPermission('services', 'create'),
  validate(serviceValidation.create),
  serviceController.create
);

router.put('/:id', 
  restrictTo('Admin', 'Editor'),
  checkPermission('services', 'update'),
  validate(serviceValidation.update),
  serviceController.update
);

router.delete('/:id', 
  restrictTo('Admin'),
  checkPermission('services', 'delete'),
  serviceController.delete
);

module.exports = router;