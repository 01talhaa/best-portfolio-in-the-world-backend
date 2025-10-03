const express = require('express');

// Import all route modules
const serviceRoutes = require('./services');
const teamMemberRoutes = require('./team-members');
const teamRoutes = require('./teams');
const projectRoutes = require('./projects');
const clientRoutes = require('./clients');
const blogRoutes = require('./blog');
const testimonialRoutes = require('./testimonials');
const contactRoutes = require('./contact');
const authRoutes = require('./auth');
const aiRoutes = require('./ai');
const searchRoutes = require('./search');
const uploadRoutes = require('../upload');

const router = express.Router();

// API Documentation route
router.get('/', (req, res) => {
  res.json({
    message: 'Company Portfolio API v1',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      services: '/api/v1/services',
      'team-members': '/api/v1/team-members',
      teams: '/api/v1/teams',
      projects: '/api/v1/projects',
      clients: '/api/v1/clients',
      blog: '/api/v1/blog',
      testimonials: '/api/v1/testimonials',
      contact: '/api/v1/contact',
      ai: '/api/v1/ai',
      search: '/api/v1/search',
      upload: '/api/v1/upload'
    },
    documentation: '/api-docs',
    support: 'contact@company.com'
  });
});

// Mount routes
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/team-members', teamMemberRoutes);
router.use('/teams', teamRoutes);
router.use('/projects', projectRoutes);
router.use('/clients', clientRoutes);
router.use('/blog', blogRoutes);
router.use('/testimonials', testimonialRoutes);
router.use('/contact', contactRoutes);
router.use('/ai', aiRoutes);
router.use('/search', searchRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;