const express = require('express');
const clientController = require('../../controllers/clientController');
const { protect, restrictTo, checkPermission } = require('../../middleware/auth');
const { validate, queryValidation } = require('../../middleware/validation');

const router = express.Router();

// Public routes (limited client info)
router.get('/featured', clientController.getFeatured);

// Protected routes - require authentication for full client data
router.use(protect);

router.get('/', 
  restrictTo('Admin', 'Manager', 'Editor'),
  validate(queryValidation, 'query'), 
  clientController.getAll
);

router.get('/analytics', 
  restrictTo('Admin', 'Manager'),
  clientController.getAnalytics
);

router.get('/top', 
  restrictTo('Admin', 'Manager'),
  clientController.getTopClients
);

router.get('/satisfaction', 
  restrictTo('Admin', 'Manager'),
  clientController.getSatisfactionMetrics
);

router.get('/retention', 
  restrictTo('Admin', 'Manager'),
  clientController.getRetentionMetrics
);

router.get('/search', 
  restrictTo('Admin', 'Manager', 'Editor'),
  clientController.searchClients
);

router.get('/industry/:industry', 
  restrictTo('Admin', 'Manager', 'Editor'),
  clientController.getByIndustry
);

router.get('/:id', 
  restrictTo('Admin', 'Manager', 'Editor'),
  clientController.getById
);

// Routes that require specific permissions
router.post('/', 
  restrictTo('Admin', 'Manager'),
  checkPermission('clients', 'create'),
  clientController.create
);

router.put('/:id', 
  restrictTo('Admin', 'Manager'),
  checkPermission('clients', 'update'),
  clientController.update
);

router.delete('/:id', 
  restrictTo('Admin'),
  checkPermission('clients', 'delete'),
  clientController.delete
);

module.exports = router;