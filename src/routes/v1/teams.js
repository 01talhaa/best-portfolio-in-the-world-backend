const express = require('express');
const teamController = require('../../controllers/teamController');
const { protect, restrictTo, checkPermission } = require('../../middleware/auth');
const { validate, queryValidation } = require('../../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', validate(queryValidation, 'query'), teamController.getAll);
router.get('/analytics', teamController.getAnalytics);
router.get('/performance', teamController.getPerformanceMetrics);
router.get('/workload', teamController.getWorkload);
router.get('/stats', teamController.getStats);
router.get('/specialty/:specialty', teamController.getBySpecialty);
router.get('/:id', teamController.getById);

// Protected routes - require authentication
router.use(protect);

// Routes that require specific permissions
router.post('/', 
  restrictTo('Admin', 'Manager'),
  checkPermission('teams', 'create'),
  teamController.create
);

router.put('/:id', 
  restrictTo('Admin', 'Manager'),
  checkPermission('teams', 'update'),
  teamController.update
);

router.delete('/:id', 
  restrictTo('Admin'),
  checkPermission('teams', 'delete'),
  teamController.delete
);

module.exports = router;