const express = require('express');
const testimonialController = require('../../controllers/testimonialController');
const { protect, restrictTo, checkPermission } = require('../../middleware/auth');
const { validate, queryValidation } = require('../../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', validate(queryValidation, 'query'), testimonialController.getAll);
router.get('/featured', testimonialController.getFeatured);
router.get('/high-rated', testimonialController.getHighRated);
router.get('/analytics', testimonialController.getAnalytics);
router.get('/rating/:rating', testimonialController.getByRating);
router.get('/category/:category', testimonialController.getByServiceCategory);
router.get('/project/:projectId', testimonialController.getByProject);
router.get('/client/:clientId', testimonialController.getByClient);
router.get('/:id', testimonialController.getById);

// Public testimonial submission
router.post('/', 
  validate({
    clientName: require('joi').string().required().trim().max(100),
    clientCompany: require('joi').string().trim().max(100),
    clientDesignation: require('joi').string().trim().max(100),
    clientEmail: require('joi').string().email(),
    quote: require('joi').string().required().max(1000),
    rating: require('joi').number().required().min(1).max(5),
    relatedProject: require('joi').string().pattern(/^[0-9a-fA-F]{24}$/),
    serviceCategory: require('joi').string().valid(
      'Web Development', 'Mobile Development', 'UI/UX Design', 
      'Property Management', 'Real Estate', 'Software Development', 
      'Consulting', 'Other'
    )
  }),
  testimonialController.create
);

// Protected routes - require authentication
router.use(protect);

// Admin/Editor routes
router.patch('/:id/approve', 
  restrictTo('Admin', 'Editor'),
  checkPermission('testimonials', 'update'),
  testimonialController.approveTestimonial
);

router.patch('/:id/reject', 
  restrictTo('Admin', 'Editor'),
  checkPermission('testimonials', 'update'),
  testimonialController.rejectTestimonial
);

router.put('/:id', 
  restrictTo('Admin', 'Editor'),
  checkPermission('testimonials', 'update'),
  testimonialController.update
);

router.delete('/:id', 
  restrictTo('Admin'),
  checkPermission('testimonials', 'delete'),
  testimonialController.delete
);

// View all testimonials (including unapproved)
router.get('/all', 
  restrictTo('Admin', 'Editor'),
  validate(queryValidation, 'query'),
  testimonialController.getAll
);

module.exports = router;