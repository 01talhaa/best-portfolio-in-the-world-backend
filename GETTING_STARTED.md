# Getting Started with Repository Management

Welcome! This repository now has comprehensive tools to help you manage branches, resolve conflicts, implement feature flags, and perform safe merges.

## 🚀 Quick Start (5 Minutes)

### 1. Understand the Documentation Structure

We've created **7 comprehensive guides**:

| Guide | Purpose | When to Use |
|-------|---------|-------------|
| [README.md](README.md) | Overview & quick reference | Start here |
| [BRANCHING_STRATEGY.md](BRANCHING_STRATEGY.md) | How to create and manage branches | When creating any branch |
| [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) | Complete step-by-step workflows | For end-to-end processes |
| [SAFE_MERGE_GUIDE.md](SAFE_MERGE_GUIDE.md) | Safe merging practices | Before merging branches |
| [CONFLICT_RESOLUTION.md](CONFLICT_RESOLUTION.md) | Resolve merge conflicts | When conflicts occur |
| [FEATURE_FLAGS.md](FEATURE_FLAGS.md) | Implement feature flags | For new features |
| [QUICK_REFERENCE.md](QUICK_REFERENCE.md) | Command cheat sheet | For quick lookups |

### 2. Use the Helper Scripts

All scripts are in the `scripts/` directory:

```bash
# Create a new feature branch
./scripts/create-branch.sh feature my-awesome-feature

# Update your branch with latest changes
./scripts/update-branch.sh

# Merge branches safely
./scripts/safe-merge.sh source-branch target-branch

# Resolve conflicts interactively
./scripts/conflict-helper.sh
```

### 3. Implement Feature Flags

```javascript
// 1. Add to config/featureFlags.js
const featureFlags = {
  MY_NEW_FEATURE: process.env.FEATURE_MY_NEW_FEATURE === 'true',
};

// 2. Use in your code
if (isFeatureEnabled('MY_NEW_FEATURE')) {
  // New implementation
}
```

## 📚 First-Time Setup

### 1. Clone and Review

```bash
# Clone the repository (if not already done)
git clone <repository-url>
cd best-portfolio-in-the-world-backend

# Review the documentation
cat README.md
```

### 2. Set Up Git Configuration (Optional but Recommended)

```bash
# Enable helpful git features
git config --global rerere.enabled true

# Set up git aliases for convenience
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.lg "log --oneline --graph --decorate"
```

### 3. Create Environment File

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env to set feature flags and other configs
nano .env
```

### 4. Make Scripts Accessible (Already done, but verify)

```bash
# Scripts should already be executable
ls -la scripts/

# If needed, make them executable
chmod +x scripts/*.sh
```

## 🎯 Your First Feature

Let's walk through creating your first feature with the new tools!

### Step 1: Create a Feature Branch

```bash
./scripts/create-branch.sh feature my-first-feature
```

This will:
- ✅ Create a branch from `develop` (or create `develop` from `main` if it doesn't exist)
- ✅ Follow the naming convention: `feature/my-first-feature`
- ✅ Push to remote
- ✅ Set up tracking

### Step 2: Make Your Changes

```bash
# Edit files...
echo "console.log('Hello World');" > index.js

# Commit your changes
git add .
git commit -m "feat: add hello world"
git push origin feature/my-first-feature
```

### Step 3: Keep Your Branch Updated

```bash
# Run this daily or before creating a PR
./scripts/update-branch.sh

# Choose merge or rebase when prompted
# Resolve any conflicts if they appear
```

### Step 4: Create a Pull Request

1. Go to GitHub
2. Click "Compare & pull request"
3. Fill in the PR template (it will auto-populate)
4. Request reviewers
5. Wait for approval

### Step 5: Merge Safely

```bash
# After approval, merge safely
./scripts/safe-merge.sh feature/my-first-feature develop

# Or use GitHub's "Squash and merge" button
```

## 🔧 Common Tasks

### Starting Your Day

```bash
# Update your local main branches
git fetch origin
git checkout develop
git pull origin develop

# Continue work on your feature
git checkout feature/your-feature
./scripts/update-branch.sh
```

### Creating Different Branch Types

```bash
# Feature branch (from develop)
./scripts/create-branch.sh feature user-authentication

# Bug fix branch (from develop)
./scripts/create-branch.sh bugfix login-error

# Hotfix branch (from main)
./scripts/create-branch.sh hotfix security-patch

# Release branch (from develop)
./scripts/create-branch.sh release v1.0.0
```

### When You Get Merge Conflicts

```bash
# Interactive conflict resolution
./scripts/conflict-helper.sh

# Options:
# 1 - View detailed conflicts
# 2 - Accept your changes
# 3 - Accept their changes
# 4 - Manual resolution
# 5 - Abort merge
# 6 - Continue after resolving
```

### Using Feature Flags

```bash
# In .env file
FEATURE_NEW_DASHBOARD=true

# In code
if (isFeatureEnabled('NEW_DASHBOARD')) {
  // New code
}

# Deploy to production with flag OFF
# Test in production
# Turn flag ON when ready
```

## 📖 Learning Path

### Beginner (Day 1-2)
1. Read [README.md](README.md)
2. Practice with [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
3. Create a test branch with helper scripts
4. Read [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) - "Starting a New Feature"

### Intermediate (Week 1)
1. Read [BRANCHING_STRATEGY.md](BRANCHING_STRATEGY.md)
2. Read [SAFE_MERGE_GUIDE.md](SAFE_MERGE_GUIDE.md)
3. Practice creating PRs
4. Learn about feature flags in [FEATURE_FLAGS.md](FEATURE_FLAGS.md)

### Advanced (Week 2+)
1. Master [CONFLICT_RESOLUTION.md](CONFLICT_RESOLUTION.md)
2. Implement advanced feature flags
3. Review the complete [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md)
4. Help team members with merges

## 🎓 Training Scenarios

### Scenario 1: Simple Feature
**Goal**: Add a new endpoint

```bash
# 1. Create branch
./scripts/create-branch.sh feature new-endpoint

# 2. Add code with feature flag
# (see examples/express-feature-flags.js)

# 3. Test both flag states
npm test

# 4. Create PR
# 5. Merge after approval
```

### Scenario 2: Bug Fix
**Goal**: Fix a validation bug

```bash
# 1. Create bugfix branch
./scripts/create-branch.sh bugfix validation-error

# 2. Fix the bug
# 3. Add regression test
# 4. PR and merge to develop
```

### Scenario 3: Handling Conflicts
**Goal**: Update branch with conflicts

```bash
# 1. Try to update
./scripts/update-branch.sh
# Conflicts detected!

# 2. Resolve with helper
./scripts/conflict-helper.sh

# 3. Test after resolution
npm test

# 4. Push resolved changes
```

## 🆘 Getting Help

### If Scripts Don't Work

```bash
# Make sure they're executable
chmod +x scripts/*.sh

# Run directly with bash
bash scripts/create-branch.sh feature test
```

### If You're Stuck

1. Check [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for commands
2. Read the relevant guide (see table above)
3. Look at examples in `examples/` directory
4. Ask your team

### Common Issues

**Issue**: "Branch already exists"
```bash
# Delete local branch
git branch -d feature/branch-name
# Try again
./scripts/create-branch.sh feature branch-name
```

**Issue**: "Uncommitted changes"
```bash
# Stash your changes
git stash
# Run the script
./scripts/update-branch.sh
# Restore changes
git stash pop
```

**Issue**: "Merge conflicts"
```bash
# Use the helper
./scripts/conflict-helper.sh
# Or read the conflict resolution guide
```

## 🎯 Success Checklist

After reading this guide, you should be able to:

- [ ] Create feature branches using the script
- [ ] Keep your branch updated with develop
- [ ] Resolve merge conflicts
- [ ] Create and merge pull requests
- [ ] Implement basic feature flags
- [ ] Navigate the documentation
- [ ] Use the helper scripts confidently

## 📞 Next Steps

1. **Read the README**: [README.md](README.md) for overview
2. **Try a script**: `./scripts/create-branch.sh feature test-branch`
3. **Explore examples**: Check `examples/express-feature-flags.js`
4. **Practice**: Create a test branch and make some commits
5. **Share**: Help your team members get started

## 🌟 Pro Tips

1. **Use the scripts daily** - They prevent mistakes
2. **Feature flags are your friend** - Deploy confidently
3. **Update often** - Sync with develop daily
4. **Small PRs** - Easier to review and merge
5. **Ask questions** - Better to ask than to break something

---

**Ready to start?** Begin with creating your first branch:

```bash
./scripts/create-branch.sh feature my-first-feature
```

Happy coding! 🚀
