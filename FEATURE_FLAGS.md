# Feature Flags System

## Overview

Feature flags (also called feature toggles) allow you to deploy code to production while keeping new features hidden until they're ready. This enables:

- **Continuous deployment** without releasing incomplete features
- **A/B testing** different implementations
- **Gradual rollouts** to monitor stability
- **Quick rollback** without code deployment
- **Testing in production** with limited user sets

## Implementation Strategies

### 1. Simple Environment-Based Flags

Create a `config/featureFlags.js`:

```javascript
// config/featureFlags.js
const featureFlags = {
  // Authentication features
  NEW_AUTH_FLOW: process.env.FEATURE_NEW_AUTH_FLOW === 'true',
  SOCIAL_LOGIN: process.env.FEATURE_SOCIAL_LOGIN === 'true',
  TWO_FACTOR_AUTH: process.env.FEATURE_2FA === 'true',
  
  // API features
  API_V2_ENDPOINTS: process.env.FEATURE_API_V2 === 'true',
  GRAPHQL_API: process.env.FEATURE_GRAPHQL === 'true',
  
  // Business features
  PREMIUM_FEATURES: process.env.FEATURE_PREMIUM === 'true',
  BETA_FEATURES: process.env.FEATURE_BETA === 'true',
  
  // Infrastructure
  NEW_DATABASE: process.env.FEATURE_NEW_DB === 'true',
  CACHING_LAYER: process.env.FEATURE_CACHE === 'true',
};

// Helper function to check if feature is enabled
const isFeatureEnabled = (featureName) => {
  return featureFlags[featureName] === true;
};

module.exports = {
  featureFlags,
  isFeatureEnabled,
};
```

### 2. User-Based Feature Flags

```javascript
// config/featureFlags.js
class FeatureFlagManager {
  constructor() {
    this.flags = {
      NEW_DASHBOARD: {
        enabled: false,
        rolloutPercentage: 0, // 0-100
        enabledForUsers: [], // Specific user IDs
        enabledForRoles: ['admin'], // User roles
      },
      EXPERIMENTAL_FEATURE: {
        enabled: true,
        rolloutPercentage: 10, // 10% of users
        enabledForUsers: ['user123', 'user456'],
        enabledForRoles: ['beta-tester'],
      },
    };
  }

  isEnabled(flagName, user = null) {
    const flag = this.flags[flagName];
    
    if (!flag) {
      console.warn(`Feature flag ${flagName} not found`);
      return false;
    }

    // If globally disabled, return false
    if (!flag.enabled) {
      return false;
    }

    // If no user context, return global setting
    if (!user) {
      return flag.enabled;
    }

    // Check if user ID is explicitly enabled
    if (flag.enabledForUsers.includes(user.id)) {
      return true;
    }

    // Check if user role is enabled
    if (user.role && flag.enabledForRoles.includes(user.role)) {
      return true;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage > 0) {
      const hash = this.hashUserId(user.id);
      return hash < flag.rolloutPercentage;
    }

    return false;
  }

  hashUserId(userId) {
    // Simple hash function to determine if user is in rollout percentage
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 100);
  }

  updateFlag(flagName, updates) {
    if (this.flags[flagName]) {
      this.flags[flagName] = { ...this.flags[flagName], ...updates };
    }
  }

  getAllFlags() {
    return this.flags;
  }
}

module.exports = new FeatureFlagManager();
```

### 3. Database-Backed Feature Flags

```javascript
// models/FeatureFlag.js
const mongoose = require('mongoose');

const featureFlagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  description: String,
  rolloutPercentage: { type: Number, default: 0, min: 0, max: 100 },
  enabledForUsers: [{ type: String }],
  enabledForRoles: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FeatureFlag', featureFlagSchema);
```

```javascript
// services/featureFlagService.js
const FeatureFlag = require('../models/FeatureFlag');

class FeatureFlagService {
  async isEnabled(flagName, user = null) {
    const flag = await FeatureFlag.findOne({ name: flagName });
    
    if (!flag || !flag.enabled) {
      return false;
    }

    if (!user) {
      return true;
    }

    // Check specific user
    if (flag.enabledForUsers.includes(user.id)) {
      return true;
    }

    // Check role
    if (user.role && flag.enabledForRoles.includes(user.role)) {
      return true;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage > 0) {
      const hash = this.hashUserId(user.id);
      return hash < flag.rolloutPercentage;
    }

    return true;
  }

  async createFlag(flagData) {
    const flag = new FeatureFlag(flagData);
    return await flag.save();
  }

  async updateFlag(flagName, updates) {
    return await FeatureFlag.findOneAndUpdate(
      { name: flagName },
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
  }

  hashUserId(userId) {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash % 100);
  }
}

module.exports = new FeatureFlagService();
```

## Usage Examples

### In Express Routes

```javascript
const { isFeatureEnabled } = require('./config/featureFlags');

app.get('/api/dashboard', async (req, res) => {
  if (isFeatureEnabled('NEW_DASHBOARD')) {
    // New dashboard implementation
    return res.json({ version: 'v2', data: await getNewDashboard() });
  }
  
  // Old dashboard implementation
  return res.json({ version: 'v1', data: await getOldDashboard() });
});
```

### With User Context

```javascript
const featureFlagManager = require('./config/featureFlags');

app.get('/api/profile', authenticateUser, async (req, res) => {
  const user = req.user;
  
  const data = {
    profile: await getUserProfile(user.id),
  };
  
  if (featureFlagManager.isEnabled('PREMIUM_FEATURES', user)) {
    data.premiumContent = await getPremiumContent(user.id);
  }
  
  res.json(data);
});
```

### In Middleware

```javascript
const featureFlagMiddleware = (flagName) => {
  return (req, res, next) => {
    if (!isFeatureEnabled(flagName)) {
      return res.status(404).json({ 
        error: 'Feature not available' 
      });
    }
    next();
  };
};

// Use in routes
app.use('/api/v2', featureFlagMiddleware('API_V2_ENDPOINTS'));
```

## Environment Configuration

Create a `.env.example` file:

```bash
# Feature Flags
FEATURE_NEW_AUTH_FLOW=false
FEATURE_SOCIAL_LOGIN=false
FEATURE_2FA=false
FEATURE_API_V2=false
FEATURE_GRAPHQL=false
FEATURE_PREMIUM=false
FEATURE_BETA=false
FEATURE_NEW_DB=false
FEATURE_CACHE=true
```

## Best Practices

1. **Naming Convention**: Use UPPER_SNAKE_CASE for consistency
2. **Documentation**: Document what each flag controls
3. **Cleanup**: Remove flags once features are fully rolled out
4. **Default Off**: New flags should default to disabled
5. **Testing**: Test both flag states (on/off)
6. **Monitoring**: Log flag usage for analytics
7. **Temporary**: Treat flags as temporary - don't accumulate them
8. **Short-lived**: Aim to remove flags within 1-2 sprints

## Feature Flag Lifecycle

1. **Create**: Add flag for new feature (default: off)
2. **Develop**: Build feature behind the flag
3. **Test**: Enable for test users/environments
4. **Rollout**: Gradually increase percentage
5. **Monitor**: Watch metrics and errors
6. **Complete**: Enable for 100% of users
7. **Cleanup**: Remove flag and old code path

## Monitoring and Analytics

```javascript
// Log feature flag usage
const logFeatureUsage = (flagName, userId, enabled) => {
  console.log({
    event: 'feature_flag_check',
    flag: flagName,
    user: userId,
    enabled: enabled,
    timestamp: new Date().toISOString(),
  });
  
  // Send to analytics service
  // analytics.track('feature_flag_check', { flagName, userId, enabled });
};
```

## API Endpoints for Flag Management

```javascript
// Admin routes for managing feature flags
app.get('/admin/flags', adminAuth, async (req, res) => {
  const flags = featureFlagManager.getAllFlags();
  res.json(flags);
});

app.put('/admin/flags/:name', adminAuth, async (req, res) => {
  const { name } = req.params;
  const updates = req.body;
  
  featureFlagManager.updateFlag(name, updates);
  res.json({ success: true, flag: name });
});
```

## Testing with Feature Flags

```javascript
// In tests, override flags
describe('New Dashboard', () => {
  beforeEach(() => {
    process.env.FEATURE_NEW_DASHBOARD = 'true';
  });
  
  afterEach(() => {
    delete process.env.FEATURE_NEW_DASHBOARD;
  });
  
  it('should use new dashboard when flag is enabled', async () => {
    const response = await request(app).get('/api/dashboard');
    expect(response.body.version).toBe('v2');
  });
});
```

## Tools and Services

Consider using existing services for production:
- **LaunchDarkly**: Full-featured service
- **Unleash**: Open-source alternative
- **Split.io**: Feature delivery platform
- **ConfigCat**: Simple feature flag service
- **Firebase Remote Config**: For Firebase projects
