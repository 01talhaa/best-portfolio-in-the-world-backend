/**
 * Example: Using Feature Flags with Express.js
 * 
 * This example demonstrates how to use feature flags in an Express application
 * to control feature rollout and implement A/B testing.
 */

const express = require('express');
const { isFeatureEnabled } = require('../config/featureFlags');
const featureFlagManager = require('../config/featureFlagsAdvanced');

const app = express();
app.use(express.json());

// ============================================================================
// Example 1: Simple Feature Toggle
// ============================================================================

app.get('/api/dashboard', (req, res) => {
  if (isFeatureEnabled('NEW_DASHBOARD')) {
    // New dashboard implementation
    return res.json({
      version: 'v2',
      data: {
        widgets: ['sales', 'analytics', 'reports'],
        layout: 'grid',
        theme: 'modern',
      },
    });
  }
  
  // Old dashboard implementation
  return res.json({
    version: 'v1',
    data: {
      widgets: ['basic-stats'],
      layout: 'list',
      theme: 'classic',
    },
  });
});

// ============================================================================
// Example 2: User-Based Feature Toggle
// ============================================================================

// Middleware to extract user from request (simplified for example)
const authenticateUser = (req, res, next) => {
  // In real app, extract from JWT token or session
  req.user = {
    id: req.headers['x-user-id'] || 'guest',
    role: req.headers['x-user-role'] || 'user',
  };
  next();
};

app.get('/api/analytics', authenticateUser, (req, res) => {
  const user = req.user;
  
  if (featureFlagManager.isEnabled('ADVANCED_ANALYTICS', user)) {
    return res.json({
      basic: { views: 1000, clicks: 500 },
      advanced: {
        conversionRate: 0.05,
        userJourney: ['landing', 'product', 'checkout'],
        heatmap: 'enabled',
        cohortAnalysis: 'enabled',
      },
    });
  }
  
  return res.json({
    basic: { views: 1000, clicks: 500 },
  });
});

// ============================================================================
// Example 3: Feature Flag Middleware
// ============================================================================

/**
 * Middleware to check if a feature is enabled
 * Returns 404 if feature is not available
 */
const requireFeature = (featureName) => {
  return (req, res, next) => {
    if (!isFeatureEnabled(featureName)) {
      return res.status(404).json({
        error: 'Feature not available',
        feature: featureName,
      });
    }
    next();
  };
};

// Use middleware to protect entire routes
app.use('/api/v2', requireFeature('API_V2_ENDPOINTS'));

app.get('/api/v2/users', (req, res) => {
  res.json({ message: 'API v2 endpoint - new implementation' });
});

// ============================================================================
// Example 4: A/B Testing
// ============================================================================

app.get('/api/pricing', authenticateUser, (req, res) => {
  const user = req.user;
  
  // Different pricing based on feature flag rollout
  if (featureFlagManager.isEnabled('NEW_PRICING_MODEL', user)) {
    // Group A: New pricing model
    return res.json({
      plan: 'Pro',
      price: 29.99,
      features: ['feature1', 'feature2', 'feature3', 'feature4'],
      trial: 30,
      variant: 'A',
    });
  }
  
  // Group B: Old pricing model
  return res.json({
    plan: 'Pro',
    price: 39.99,
    features: ['feature1', 'feature2', 'feature3'],
    trial: 14,
    variant: 'B',
  });
});

// ============================================================================
// Example 5: Admin Endpoints for Managing Feature Flags
// ============================================================================

// Admin authentication middleware (simplified)
const requireAdmin = (req, res, next) => {
  const user = req.user;
  if (user && user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Get all feature flags
app.get('/admin/feature-flags', authenticateUser, requireAdmin, (req, res) => {
  res.json(featureFlagManager.getAllFlags());
});

// Update a feature flag
app.put('/admin/feature-flags/:name', authenticateUser, requireAdmin, (req, res) => {
  const { name } = req.params;
  const updates = req.body;
  
  const success = featureFlagManager.updateFlag(name, updates);
  
  if (success) {
    res.json({
      message: 'Feature flag updated',
      flag: name,
      newConfig: featureFlagManager.getAllFlags()[name],
    });
  } else {
    res.status(404).json({ error: 'Feature flag not found' });
  }
});

// Create a new feature flag
app.post('/admin/feature-flags', authenticateUser, requireAdmin, (req, res) => {
  const { name, config } = req.body;
  
  const success = featureFlagManager.createFlag(name, config);
  
  if (success) {
    res.status(201).json({
      message: 'Feature flag created',
      flag: name,
    });
  } else {
    res.status(400).json({ error: 'Feature flag already exists' });
  }
});

// Get enabled features for current user
app.get('/api/my-features', authenticateUser, (req, res) => {
  const enabledFeatures = featureFlagManager.getEnabledFlagsForUser(req.user);
  res.json({
    user: req.user.id,
    enabledFeatures,
  });
});

// ============================================================================
// Example 6: Gradual Rollout
// ============================================================================

app.get('/api/experimental', authenticateUser, (req, res) => {
  const user = req.user;
  
  // This feature is rolled out to a percentage of users
  // The same user will always get the same experience (consistent)
  if (featureFlagManager.isEnabled('EXPERIMENTAL_FEATURE', user)) {
    return res.json({
      message: 'You are part of the experimental group!',
      features: ['new-feature-1', 'new-feature-2'],
    });
  }
  
  return res.json({
    message: 'Standard experience',
    features: ['standard-feature'],
  });
});

// ============================================================================
// Start Server
// ============================================================================

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('\nExample endpoints:');
    console.log('  GET  /api/dashboard');
    console.log('  GET  /api/analytics');
    console.log('  GET  /api/v2/users');
    console.log('  GET  /api/pricing');
    console.log('  GET  /api/my-features');
    console.log('  GET  /admin/feature-flags');
    console.log('  PUT  /admin/feature-flags/:name');
    console.log('  POST /admin/feature-flags');
    console.log('\nTry with headers:');
    console.log('  x-user-id: user123');
    console.log('  x-user-role: admin');
  });
}

module.exports = app;
