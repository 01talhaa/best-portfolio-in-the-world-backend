/**
 * Feature Flags Configuration
 * 
 * This module provides a simple feature flag system for controlling
 * feature rollout and A/B testing.
 * 
 * Usage:
 *   const { isFeatureEnabled } = require('./config/featureFlags');
 *   
 *   if (isFeatureEnabled('NEW_FEATURE')) {
 *     // New implementation
 *   } else {
 *     // Old implementation
 *   }
 */

// Simple environment-based feature flags
const featureFlags = {
  // API Features
  API_V2_ENDPOINTS: process.env.FEATURE_API_V2 === 'true',
  GRAPHQL_SUPPORT: process.env.FEATURE_GRAPHQL === 'true',
  
  // Authentication Features
  OAUTH_LOGIN: process.env.FEATURE_OAUTH === 'true',
  TWO_FACTOR_AUTH: process.env.FEATURE_2FA === 'true',
  
  // Business Features
  PREMIUM_FEATURES: process.env.FEATURE_PREMIUM === 'true',
  BETA_FEATURES: process.env.FEATURE_BETA === 'true',
  
  // Infrastructure
  NEW_DATABASE: process.env.FEATURE_NEW_DB === 'true',
  CACHING_LAYER: process.env.FEATURE_CACHE === 'true',
  RATE_LIMITING: process.env.FEATURE_RATE_LIMIT === 'true',
};

/**
 * Check if a feature is enabled
 * @param {string} featureName - The name of the feature flag
 * @returns {boolean} - True if feature is enabled
 */
function isFeatureEnabled(featureName) {
  if (!(featureName in featureFlags)) {
    console.warn(`Feature flag '${featureName}' not found, defaulting to false`);
    return false;
  }
  return featureFlags[featureName] === true;
}

/**
 * Get all feature flags and their current state
 * @returns {Object} - Object containing all feature flags
 */
function getAllFlags() {
  return { ...featureFlags };
}

/**
 * Log feature flag usage (useful for analytics)
 * @param {string} featureName - The name of the feature flag
 * @param {boolean} enabled - Whether the feature is enabled
 * @param {Object} context - Additional context (e.g., user info)
 */
function logFeatureUsage(featureName, enabled, context = {}) {
  // In production, you might send this to an analytics service
  console.log({
    event: 'feature_flag_checked',
    feature: featureName,
    enabled: enabled,
    timestamp: new Date().toISOString(),
    ...context,
  });
}

module.exports = {
  featureFlags,
  isFeatureEnabled,
  getAllFlags,
  logFeatureUsage,
};
