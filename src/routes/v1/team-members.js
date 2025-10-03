const express = require('express');
const teamMemberController = require('../../controllers/teamMemberController');
const { protect, restrictTo, checkPermission } = require('../../middleware/auth');
const { validate, teamMemberValidation, queryValidation } = require('../../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', validate(queryValidation, 'query'), teamMemberController.getAll);
router.get('/featured', teamMemberController.getFeatured);
router.get('/analytics', teamMemberController.getAnalytics);
router.get('/stats', teamMemberController.getStats);
router.get('/search', teamMemberController.searchMembers);
router.get('/skills-summary', teamMemberController.getSkillsSummary);
router.get('/with-project-count', teamMemberController.getWithProjectCount);
router.get('/skills/:skillName', teamMemberController.getBySkill);
router.get('/team/:teamId', teamMemberController.getByTeam);
router.get('/:id', teamMemberController.getById);

// Protected routes - require authentication
router.use(protect);

// Routes that require specific permissions
router.post('/', 
  restrictTo('Admin', 'Editor'),
  checkPermission('team-members', 'create'),
  validate(teamMemberValidation.create),
  teamMemberController.create
);

router.put('/:id', 
  restrictTo('Admin', 'Editor'),
  checkPermission('team-members', 'update'),
  validate(teamMemberValidation.update),
  teamMemberController.update
);

router.delete('/:id', 
  restrictTo('Admin'),
  checkPermission('team-members', 'delete'),
  teamMemberController.delete
);

module.exports = router;