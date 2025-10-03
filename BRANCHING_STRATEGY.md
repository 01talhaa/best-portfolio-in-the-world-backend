# Branching Strategy

## Branch Types

### Main Branches
- **`main`**: Production-ready code. Protected branch with required reviews.
- **`develop`**: Integration branch for features. Merge features here first.
- **`staging`**: Pre-production testing branch.

### Supporting Branches
- **`feature/*`**: New features or enhancements
  - Format: `feature/short-description`
  - Example: `feature/user-authentication`
  
- **`bugfix/*`**: Bug fixes for develop branch
  - Format: `bugfix/issue-number-description`
  - Example: `bugfix/123-fix-login-error`
  
- **`hotfix/*`**: Urgent fixes for production
  - Format: `hotfix/issue-number-description`
  - Example: `hotfix/456-critical-security-patch`
  
- **`release/*`**: Release preparation
  - Format: `release/version`
  - Example: `release/v1.2.0`

## Branch Creation Workflow

### Creating a Feature Branch
```bash
# Start from develop branch
git checkout develop
git pull origin develop

# Create and switch to feature branch
git checkout -b feature/your-feature-name

# Push the branch to remote
git push -u origin feature/your-feature-name
```

### Creating a Hotfix Branch
```bash
# Start from main branch
git checkout main
git pull origin main

# Create and switch to hotfix branch
git checkout -b hotfix/issue-description

# Push the branch to remote
git push -u origin hotfix/issue-description
```

### Creating a Release Branch
```bash
# Start from develop branch
git checkout develop
git pull origin develop

# Create and switch to release branch
git checkout -b release/v1.x.x

# Push the branch to remote
git push -u origin release/v1.x.x
```

## Branch Protection Rules

### For `main` branch:
- Require pull request reviews (at least 1)
- Require status checks to pass
- Require branches to be up to date before merging
- Restrict direct pushes
- Require linear history (no merge commits)

### For `develop` branch:
- Require pull request reviews
- Require status checks to pass
- Allow squash merging

## Branch Lifecycle

1. **Create**: Branch from the appropriate base (develop, main)
2. **Develop**: Make commits with clear messages
3. **Push**: Regularly push to remote
4. **Review**: Create PR when ready
5. **Merge**: After approval and passing checks
6. **Delete**: Remove branch after merging

## Best Practices

1. **Keep branches short-lived**: Aim to merge within a few days
2. **Sync regularly**: Pull changes from base branch frequently
3. **Use descriptive names**: Make branch purpose clear
4. **One concern per branch**: Don't mix features/fixes
5. **Clean up**: Delete branches after merging
6. **Never force push**: Especially on shared branches
7. **Use feature flags**: For incomplete features in develop/main
