# best-portfolio-in-the-world-backend

This repository includes comprehensive tools and documentation for managing branches, resolving conflicts, implementing feature flags, and performing safe merges.

> 🚀 **New here?** Start with the [Getting Started Guide](GETTING_STARTED.md) for a 5-minute introduction!

## 📚 Documentation

- **[Branching Strategy](BRANCHING_STRATEGY.md)** - Complete guide on creating and managing branches
- **[Conflict Resolution](CONFLICT_RESOLUTION.md)** - Step-by-step guide for resolving merge conflicts
- **[Feature Flags](FEATURE_FLAGS.md)** - Implementation guide for feature flag system
- **[Safe Merge Guide](SAFE_MERGE_GUIDE.md)** - Best practices for safe merging

## 🛠️ Helper Scripts

All scripts are located in the `scripts/` directory and are executable:

### Create Branch
Creates a new branch following the branching strategy:
```bash
./scripts/create-branch.sh <type> <name>

# Examples:
./scripts/create-branch.sh feature user-authentication
./scripts/create-branch.sh bugfix login-error
./scripts/create-branch.sh hotfix critical-security-patch
./scripts/create-branch.sh release v1.2.0
```

### Update Branch
Updates your current branch with latest changes from base branch:
```bash
./scripts/update-branch.sh

# Automatically detects base branch and offers merge or rebase
```

### Safe Merge
Performs a safe merge with all necessary checks:
```bash
./scripts/safe-merge.sh <source-branch> <target-branch>

# Examples:
./scripts/safe-merge.sh feature/user-auth develop
./scripts/safe-merge.sh develop staging
```

### Conflict Helper
Interactive tool for resolving merge conflicts:
```bash
./scripts/conflict-helper.sh

# Provides options to:
# - View conflicts
# - Accept current/incoming changes
# - Open files for manual resolution
# - Abort or continue merge
```

## 🚀 Quick Start

### Setting Up a New Feature

1. Create a feature branch:
   ```bash
   ./scripts/create-branch.sh feature my-new-feature
   ```

2. Make your changes and commit:
   ```bash
   git add .
   git commit -m "Add new feature"
   git push origin feature/my-new-feature
   ```

3. Keep your branch updated:
   ```bash
   ./scripts/update-branch.sh
   ```

4. Create a Pull Request on GitHub

5. After approval, merge safely:
   ```bash
   ./scripts/safe-merge.sh feature/my-new-feature develop
   ```

## 🔀 Branching Model

```
main (production)
  ↑
  |-- hotfix/fix-name
  |
staging (pre-production)
  ↑
develop (integration)
  ↑
  |-- feature/feature-name
  |-- bugfix/bug-name
  |-- release/v1.0.0
```

## 🎯 Feature Flags

Feature flags allow you to deploy code without immediately releasing features:

```javascript
const { isFeatureEnabled } = require('./config/featureFlags');

if (isFeatureEnabled('NEW_FEATURE')) {
  // New implementation
} else {
  // Old implementation
}
```

See [FEATURE_FLAGS.md](FEATURE_FLAGS.md) for complete implementation details.

## ⚠️ Conflict Resolution

When you encounter merge conflicts:

1. Run the conflict helper:
   ```bash
   ./scripts/conflict-helper.sh
   ```

2. Or resolve manually:
   ```bash
   # View conflicts
   git status
   
   # Edit conflicted files
   nano <file>
   
   # Mark as resolved
   git add <file>
   
   # Complete merge
   git commit
   ```

See [CONFLICT_RESOLUTION.md](CONFLICT_RESOLUTION.md) for detailed guidance.

## ✅ Pre-Merge Checklist

Before merging any branch:

- [ ] All tests pass locally
- [ ] Code has been reviewed and approved
- [ ] Branch is up to date with target branch
- [ ] No merge conflicts exist
- [ ] Documentation is updated
- [ ] CI/CD pipeline passes

## 🔒 Protected Branches

- **main**: Production code (requires 2 approvals)
- **develop**: Integration branch (requires 1 approval)
- **staging**: Pre-production testing

## 📝 Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Example:
```
feat: add user authentication

Implemented JWT-based authentication system with refresh tokens.

Closes #123
```

## 🤝 Contributing

1. Follow the branching strategy
2. Write clear commit messages
3. Add tests for new features
4. Update documentation
5. Get code review before merging

## 📞 Getting Help

- Check the documentation guides in this repository
- Use the helper scripts for common tasks
- Review the conflict resolution guide for merge issues
- Consult the team before force-pushing or making risky changes