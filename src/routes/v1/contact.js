const express = require('express');
const contactController = require('../../controllers/contactController');
const { protect, restrictTo, checkPermission } = require('../../middleware/auth');
const { validate, contactValidation, queryValidation } = require('../../middleware/validation');
const { contactLimiter } = require('../../middleware/rateLimiter');

const router = express.Router();

// Public route for contact form submission
router.post('/', 
  contactLimiter,
  validate(contactValidation.create),
  contactController.create
);

// Protected routes - require authentication
router.use(protect);

// Routes that require specific permissions
router.get('/', 
  restrictTo('Admin', 'Manager', 'Editor'),
  checkPermission('contact', 'read'),
  validate(queryValidation, 'query'),
  contactController.getAll
);

router.get('/analytics', 
  restrictTo('Admin', 'Manager'),
  contactController.getAnalytics
);

router.get('/overdue', 
  restrictTo('Admin', 'Manager', 'Editor'),
  contactController.getOverdue
);

router.get('/assignee/:assigneeId', 
  restrictTo('Admin', 'Manager', 'Editor'),
  contactController.getByAssignee
);

router.get('/:id', 
  restrictTo('Admin', 'Manager', 'Editor'),
  checkPermission('contact', 'read'),
  contactController.getById
);

// Update operations
router.patch('/:id/status', 
  restrictTo('Admin', 'Manager', 'Editor'),
  checkPermission('contact', 'update'),
  validate({
    status: require('joi').string().required().valid(
      'New', 'Viewed', 'In Progress', 'Responded', 
      'Follow-up Required', 'Converted', 'Archived', 'Spam'
    )
  }),
  contactController.updateStatus
);

router.patch('/:id/assign', 
  restrictTo('Admin', 'Manager'),
  checkPermission('contact', 'update'),
  validate({
    assignedTo: require('joi').string().pattern(/^[0-9a-fA-F]{24}$/).required()
  }),
  contactController.assignTo
);

router.post('/:id/notes', 
  restrictTo('Admin', 'Manager', 'Editor'),
  checkPermission('contact', 'update'),
  validate({
    note: require('joi').string().required().max(1000)
  }),
  contactController.addNote
);

router.patch('/bulk-update', 
  restrictTo('Admin', 'Manager'),
  checkPermission('contact', 'update'),
  validate({
    ids: require('joi').array().items(require('joi').string().pattern(/^[0-9a-fA-F]{24}$/)).required(),
    updates: require('joi').object().required()
  }),
  contactController.bulkUpdate
);

router.put('/:id', 
  restrictTo('Admin', 'Manager'),
  checkPermission('contact', 'update'),
  contactController.update
);

router.delete('/:id', 
  restrictTo('Admin'),
  checkPermission('contact', 'delete'),
  contactController.delete
);

module.exports = router;