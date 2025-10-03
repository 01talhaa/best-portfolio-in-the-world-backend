/**
 * Advanced Feature Flags Manager
 * 
 * Supports:
 * - User-based targeting
 * - Role-based access
 * - Percentage rollouts
 * - Dynamic flag updates
 */

class FeatureFlagManager {
  constructor() {
    this.flags = {
      NEW_DASHBOARD: {
        enabled: true,
        description: 'New dashboard interface',
        rolloutPercentage: 10, // 10% of users
        enabledForUsers: [], // Specific user IDs
        enabledForRoles: ['admin', 'beta-tester'], // User roles
        createdAt: new Date().toISOString(),
      },
      ADVANCED_ANALYTICS: {
        enabled: true,
        description: 'Advanced analytics features',
        rolloutPercentage: 25,
        enabledForUsers: [],
        enabledForRoles: ['admin'],
        createdAt: new Date().toISOString(),
      },
      EXPERIMENTAL_FEATURE: {
        enabled: false,
        description: 'Experimental feature in development',
        rolloutPercentage: 0,
        enabledForUsers: ['dev-user-1', 'dev-user-2'],
        enabledForRoles: ['developer'],
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Check if a feature is enabled for a user
   * @param {string} flagName - Name of the feature flag
   * @param {Object} user - User object with id and role properties
   * @returns {boolean} - True if feature is enabled for this user
   */
  isEnabled(flagName, user = null) {
    const flag = this.flags[flagName];
    
    if (!flag) {
      console.warn(`Feature flag '${flagName}' not found`);
      return false;
    }

    // If globally disabled, return false
    if (!flag.enabled) {
      return false;
    }

    // If no user context provided, return global enabled state
    if (!user) {
      return flag.enabled;
    }

    // Check if user ID is explicitly enabled
    if (user.id && flag.enabledForUsers.includes(user.id)) {
      return true;
    }

    // Check if user role is enabled
    if (user.role && flag.enabledForRoles.includes(user.role)) {
      return true;
    }

    // Check rollout percentage (consistent per user)
    if (flag.rolloutPercentage > 0 && user.id) {
      const userHash = this.hashUserId(user.id);
      return userHash < flag.rolloutPercentage;
    }

    return false;
  }

  /**
   * Hash a user ID to a number between 0-99 for percentage rollouts
   * Same user ID always produces the same hash
   * @param {string} userId - User identifier
   * @returns {number} - Hash value between 0-99
   */
  hashUserId(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash % 100);
  }

  /**
   * Update a feature flag configuration
   * @param {string} flagName - Name of the feature flag
   * @param {Object} updates - Properties to update
   */
  updateFlag(flagName, updates) {
    if (!this.flags[flagName]) {
      console.warn(`Feature flag '${flagName}' not found`);
      return false;
    }

    this.flags[flagName] = {
      ...this.flags[flagName],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return true;
  }

  /**
   * Create a new feature flag
   * @param {string} flagName - Name of the feature flag
   * @param {Object} config - Flag configuration
   */
  createFlag(flagName, config = {}) {
    if (this.flags[flagName]) {
      console.warn(`Feature flag '${flagName}' already exists`);
      return false;
    }

    this.flags[flagName] = {
      enabled: false,
      description: '',
      rolloutPercentage: 0,
      enabledForUsers: [],
      enabledForRoles: [],
      createdAt: new Date().toISOString(),
      ...config,
    };
    return true;
  }

  /**
   * Delete a feature flag
   * @param {string} flagName - Name of the feature flag
   */
  deleteFlag(flagName) {
    if (!this.flags[flagName]) {
      return false;
    }
    delete this.flags[flagName];
    return true;
  }

  /**
   * Get all feature flags
   * @returns {Object} - All feature flags
   */
  getAllFlags() {
    return { ...this.flags };
  }

  /**
   * Get all enabled flags for a specific user
   * @param {Object} user - User object
   * @returns {Array} - Array of enabled flag names
   */
  getEnabledFlagsForUser(user) {
    return Object.keys(this.flags).filter(flagName => 
      this.isEnabled(flagName, user)
    );
  }

  /**
   * Export flags to JSON
   * @returns {string} - JSON string of all flags
   */
  exportFlags() {
    return JSON.stringify(this.flags, null, 2);
  }

  /**
   * Import flags from JSON
   * @param {string} jsonString - JSON string of flags
   */
  importFlags(jsonString) {
    try {
      const importedFlags = JSON.parse(jsonString);
      this.flags = importedFlags;
      return true;
    } catch (error) {
      console.error('Failed to import flags:', error);
      return false;
    }
  }
}

// Export a singleton instance
const featureFlagManager = new FeatureFlagManager();

module.exports = featureFlagManager;
module.exports.FeatureFlagManager = FeatureFlagManager;
