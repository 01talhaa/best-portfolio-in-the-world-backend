const express = require('express');
const blogController = require('../../controllers/blogController');
const { protect, restrictTo, checkPermission } = require('../../middleware/auth');
const { validate, queryValidation } = require('../../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', validate(queryValidation, 'query'), blogController.getAll);
router.get('/featured', blogController.getFeatured);
router.get('/popular', blogController.getPopular);
router.get('/analytics', blogController.getAnalytics);
router.get('/search', blogController.search);
router.get('/category/:category', blogController.getByCategory);
router.get('/tags/:tagName', blogController.getByTag);
router.get('/slug/:slug', blogController.getBySlug);
router.get('/:id/related', blogController.getRelatedPosts);

// Semi-protected routes (can be public but track user)
router.post('/:id/like', blogController.likeBlog);
router.post('/:id/comments', 
  validate({
    name: require('joi').string().required().trim().max(100),
    email: require('joi').string().email().required(),
    comment: require('joi').string().required().max(1000)
  }),
  blogController.addComment
);

// Protected routes - require authentication
router.use(protect);

// Routes that require specific permissions
router.post('/', 
  restrictTo('Admin', 'Editor'),
  checkPermission('blog', 'create'),
  blogController.create
);

router.put('/:id', 
  restrictTo('Admin', 'Editor'),
  checkPermission('blog', 'update'),
  blogController.update
);

router.delete('/:id', 
  restrictTo('Admin'),
  checkPermission('blog', 'delete'),
  blogController.delete
);

// Admin only routes
router.get('/all', 
  restrictTo('Admin', 'Editor'),
  validate(queryValidation, 'query'), 
  blogController.getAll
);

module.exports = router;