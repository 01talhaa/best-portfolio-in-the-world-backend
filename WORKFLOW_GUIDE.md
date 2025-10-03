# Complete Workflow Guide

This guide provides step-by-step instructions for common development workflows in this repository.

## Table of Contents

1. [Starting a New Feature](#starting-a-new-feature)
2. [Working on a Bug Fix](#working-on-a-bug-fix)
3. [Creating a Hotfix](#creating-a-hotfix)
4. [Preparing a Release](#preparing-a-release)
5. [Resolving Merge Conflicts](#resolving-merge-conflicts)
6. [Implementing Feature Flags](#implementing-feature-flags)
7. [Code Review Process](#code-review-process)
8. [Emergency Rollback](#emergency-rollback)

---

## Starting a New Feature

### Step 1: Create Feature Branch

```bash
# Use the helper script
./scripts/create-branch.sh feature user-profile

# Or manually:
git checkout develop
git pull origin develop
git checkout -b feature/user-profile
git push -u origin feature/user-profile
```

### Step 2: Implement the Feature

```bash
# Make your changes
# Edit files...

# Commit regularly with clear messages
git add .
git commit -m "feat: add user profile model"

git add .
git commit -m "feat: add user profile controller"

# Push to remote
git push origin feature/user-profile
```

### Step 3: Keep Branch Updated

```bash
# Periodically sync with develop (daily recommended)
./scripts/update-branch.sh

# Or manually:
git fetch origin
git merge origin/develop
# Resolve any conflicts
git push origin feature/user-profile
```

### Step 4: Add Feature Flag (if incomplete)

```javascript
// config/featureFlags.js
const featureFlags = {
  USER_PROFILE: process.env.FEATURE_USER_PROFILE === 'true',
};

// In your code:
if (isFeatureEnabled('USER_PROFILE')) {
  // New feature code
}
```

### Step 5: Test Thoroughly

```bash
# Run tests
npm test

# Run linting
npm run lint

# Manual testing
npm start
# Test your feature
```

### Step 6: Create Pull Request

1. Go to GitHub
2. Click "New Pull Request"
3. Select `feature/user-profile` → `develop`
4. Fill in PR template
5. Request reviewers
6. Link related issues

### Step 7: Address Review Feedback

```bash
# Make requested changes
git add .
git commit -m "refactor: address review comments"
git push origin feature/user-profile
```

### Step 8: Merge

```bash
# After approval, use safe merge script
./scripts/safe-merge.sh feature/user-profile develop

# Or use GitHub "Squash and merge"
```

### Step 9: Cleanup

```bash
# Delete local branch
git checkout develop
git pull origin develop
git branch -d feature/user-profile

# Delete remote branch (if not done via GitHub)
git push origin --delete feature/user-profile
```

---

## Working on a Bug Fix

### Step 1: Create Bug Fix Branch

```bash
./scripts/create-branch.sh bugfix login-validation

# Branch created from develop
```

### Step 2: Fix the Bug

```bash
# Identify and fix the issue
# Add tests to prevent regression
git add .
git commit -m "fix: validate email format on login"
```

### Step 3: Test the Fix

```bash
# Run existing tests
npm test

# Add new test for the bug
# tests/auth.test.js
git add tests/auth.test.js
git commit -m "test: add email validation test"
```

### Step 4: Create PR and Merge

```bash
# Push to remote
git push origin bugfix/login-validation

# Create PR on GitHub
# Get review and merge to develop
```

---

## Creating a Hotfix

**Use for critical production issues only!**

### Step 1: Create Hotfix Branch from Main

```bash
./scripts/create-branch.sh hotfix critical-security-fix

# This branches from main, not develop
```

### Step 2: Implement Fix

```bash
# Make minimal changes to fix the issue
git add .
git commit -m "fix: patch security vulnerability in auth"

# Push immediately
git push origin hotfix/critical-security-fix
```

### Step 3: Test Quickly but Thoroughly

```bash
npm test
# Manual testing of critical paths
```

### Step 4: Merge to Main

```bash
# Create PR to main
# Get expedited review
# Merge to main

# Or use script:
./scripts/safe-merge.sh hotfix/critical-security-fix main
```

### Step 5: Tag the Release

```bash
git checkout main
git pull origin main
git tag -a v1.0.1 -m "Hotfix: Security patch"
git push origin v1.0.1
```

### Step 6: Also Merge to Develop

```bash
./scripts/safe-merge.sh hotfix/critical-security-fix develop
```

### Step 7: Deploy

```bash
# Deploy main to production
# Monitor closely
```

---

## Preparing a Release

### Step 1: Create Release Branch

```bash
./scripts/create-branch.sh release v1.2.0
```

### Step 2: Update Version Numbers

```bash
# Update package.json, changelog, etc.
git add .
git commit -m "chore: bump version to 1.2.0"
```

### Step 3: Final Testing

```bash
# Full test suite
npm test

# Integration tests
npm run test:integration

# Manual QA
```

### Step 4: Merge to Main

```bash
./scripts/safe-merge.sh release/v1.2.0 main
```

### Step 5: Tag Release

```bash
git checkout main
git pull origin main
git tag -a v1.2.0 -m "Release version 1.2.0"
git push origin v1.2.0
```

### Step 6: Merge Back to Develop

```bash
./scripts/safe-merge.sh release/v1.2.0 develop
```

### Step 7: Create Release Notes

```bash
# On GitHub:
# Releases → Draft a new release
# Select tag v1.2.0
# Add release notes
# Publish release
```

---

## Resolving Merge Conflicts

### When Conflicts Occur

```bash
# Attempting to merge or update
git merge origin/develop
# CONFLICT: ...

# Or using helper script
./scripts/update-branch.sh
# Conflicts detected...
```

### Resolution Steps

#### Option 1: Use Helper Script

```bash
./scripts/conflict-helper.sh

# Follow the interactive prompts:
# 1 - View conflicts
# 2 - Accept current changes
# 3 - Accept incoming changes
# 4 - Manual resolution
# 6 - Continue after resolving
```

#### Option 2: Manual Resolution

```bash
# 1. View conflicted files
git status

# 2. Open each file and look for:
<<<<<<< HEAD
// Your changes
=======
// Their changes
>>>>>>> branch-name

# 3. Edit to keep what you want
# Remove conflict markers

# 4. Mark as resolved
git add <resolved-file>

# 5. Complete merge
git commit

# 6. Test!
npm test

# 7. Push
git push origin your-branch
```

### Complex Conflicts

```bash
# For complex conflicts, consider:

# 1. Start over with rebase
git merge --abort
git rebase origin/develop

# 2. Or create a fresh branch
git checkout -b feature/fresh-start develop
git cherry-pick <your-commits>
```

---

## Implementing Feature Flags

### Step 1: Add Flag Definition

```javascript
// config/featureFlags.js
const featureFlags = {
  NEW_FEATURE: process.env.FEATURE_NEW_FEATURE === 'true',
};
```

### Step 2: Add to .env.example

```bash
# .env.example
FEATURE_NEW_FEATURE=false
```

### Step 3: Use in Code

```javascript
const { isFeatureEnabled } = require('./config/featureFlags');

app.get('/api/data', (req, res) => {
  if (isFeatureEnabled('NEW_FEATURE')) {
    // New implementation
    return res.json({ version: 'v2', data: newData });
  }
  // Old implementation
  return res.json({ version: 'v1', data: oldData });
});
```

### Step 4: Test Both States

```javascript
// In tests
describe('API with feature flag', () => {
  beforeEach(() => {
    process.env.FEATURE_NEW_FEATURE = 'true';
  });
  
  it('uses new implementation', () => {
    // Test new code
  });
});

describe('API without feature flag', () => {
  beforeEach(() => {
    delete process.env.FEATURE_NEW_FEATURE;
  });
  
  it('uses old implementation', () => {
    // Test old code
  });
});
```

### Step 5: Gradual Rollout

```bash
# Development
FEATURE_NEW_FEATURE=true

# Staging
FEATURE_NEW_FEATURE=true

# Production (initially)
FEATURE_NEW_FEATURE=false

# Production (after validation)
FEATURE_NEW_FEATURE=true
```

### Step 6: Remove Flag

```javascript
// Once fully rolled out, remove the flag
// Keep only the new implementation
// Delete old code path
```

---

## Code Review Process

### For Authors

#### Before Creating PR

```bash
# 1. Self-review
git diff develop...HEAD

# 2. Run all checks
npm test
npm run lint

# 3. Update documentation
# Edit README, add comments, etc.

# 4. Rebase if needed
git rebase -i develop
# Squash WIP commits
```

#### Creating the PR

1. Use descriptive title
2. Fill out PR template completely
3. Add screenshots for UI changes
4. Link related issues
5. Request appropriate reviewers
6. Add labels (feature, bug, etc.)

#### During Review

- Respond to comments promptly
- Make requested changes
- Push new commits (don't force push during review)
- Re-request review after changes
- Thank reviewers for feedback

### For Reviewers

#### Review Checklist

- [ ] Code is correct and meets requirements
- [ ] Tests are adequate
- [ ] No security issues
- [ ] Performance is acceptable
- [ ] Documentation is updated
- [ ] Follows coding standards
- [ ] No unnecessary changes
- [ ] Feature flags used appropriately

#### Providing Feedback

- Be constructive and specific
- Explain the "why" behind suggestions
- Distinguish between required changes and suggestions
- Approve when ready or request changes
- Use GitHub's suggestion feature for small changes

---

## Emergency Rollback

### Option 1: Revert Commit

```bash
# Find the problematic commit
git log --oneline -10

# Revert it
git revert <commit-hash>

# Push immediately
git push origin main

# Deploy
```

### Option 2: Rollback to Previous Tag

```bash
# Create hotfix from previous version
git checkout v1.0.0
git checkout -b hotfix/rollback-to-v1.0.0

# Push and deploy
git push origin hotfix/rollback-to-v1.0.0
# Create PR and merge to main
```

### Option 3: Disable Feature Flag

```bash
# If feature is behind a flag, just disable it
# No code deployment needed!

# Update environment variable
FEATURE_PROBLEMATIC=false

# Or update in database/config service
# Restart app if needed
```

### Post-Rollback

1. **Communicate**: Notify team and stakeholders
2. **Document**: Record what happened and why
3. **Investigate**: Find root cause
4. **Fix**: Create proper fix
5. **Test**: Thoroughly test the fix
6. **Re-deploy**: When ready

---

## Tips for Success

### Daily Workflow

```bash
# Morning routine
git checkout develop
git pull origin develop
git checkout your-feature-branch
./scripts/update-branch.sh

# Make changes throughout the day
# Commit frequently

# End of day
git push origin your-feature-branch
```

### Best Practices

1. **Commit frequently**: Small, focused commits
2. **Write good messages**: Clear and descriptive
3. **Test often**: Don't wait until the end
4. **Update regularly**: Sync with base branch daily
5. **Review your own PRs**: Check the diff before requesting review
6. **Use feature flags**: For risky or incomplete features
7. **Ask for help**: When stuck or unsure

### Common Mistakes to Avoid

- ❌ Committing directly to main or develop
- ❌ Large, monolithic PRs
- ❌ Skipping tests
- ❌ Force pushing to shared branches
- ❌ Ignoring merge conflicts
- ❌ Not updating branch before merging
- ❌ Mixing unrelated changes

---

## Additional Resources

- [Branching Strategy](BRANCHING_STRATEGY.md)
- [Conflict Resolution Guide](CONFLICT_RESOLUTION.md)
- [Safe Merge Guide](SAFE_MERGE_GUIDE.md)
- [Feature Flags Guide](FEATURE_FLAGS.md)
- [Quick Reference](QUICK_REFERENCE.md)
