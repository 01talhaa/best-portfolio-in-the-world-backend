# Safe Merge Practices

## Pre-Merge Checklist

Before merging any branch, ensure:

- [ ] All tests pass locally
- [ ] Code has been reviewed and approved
- [ ] Branch is up to date with target branch
- [ ] CI/CD pipeline passes all checks
- [ ] No merge conflicts exist
- [ ] Documentation is updated
- [ ] Breaking changes are documented
- [ ] Rollback plan is in place

## Safe Merge Workflow

### Step 1: Update Your Branch

```bash
# Fetch latest changes
git fetch origin

# Switch to your feature branch
git checkout feature/your-branch

# Update from target branch (e.g., develop)
git merge origin/develop

# Or use rebase for cleaner history
git rebase origin/develop
```

### Step 2: Run Tests Locally

```bash
# Run all tests
npm test  # or yarn test, pytest, etc.

# Run linting
npm run lint

# Run build
npm run build

# Run any additional checks
npm run type-check
```

### Step 3: Push Changes

```bash
# Push your updated branch
git push origin feature/your-branch

# If you rebased, you may need force push (be careful!)
git push --force-with-lease origin feature/your-branch
```

### Step 4: Create Pull Request

1. Go to GitHub and create a PR
2. Fill in the PR template
3. Request reviews from team members
4. Link related issues
5. Add appropriate labels

### Step 5: Address Review Comments

```bash
# Make changes based on feedback
git add <modified-files>
git commit -m "Address review comments"
git push origin feature/your-branch
```

### Step 6: Final Pre-Merge Checks

```bash
# Ensure branch is still up to date
git fetch origin
git merge origin/develop

# Run tests again
npm test

# Check for any last-minute issues
git status
git log --oneline -5
```

### Step 7: Merge

**Option A: Squash and Merge (Recommended for feature branches)**
- Combines all commits into one
- Keeps history clean
- Use GitHub UI or:

```bash
git checkout develop
git merge --squash feature/your-branch
git commit -m "Add feature: description of feature"
git push origin develop
```

**Option B: Merge Commit (For release branches)**
- Preserves commit history
- Shows clear merge point

```bash
git checkout develop
git merge --no-ff feature/your-branch
git push origin develop
```

**Option C: Rebase and Merge (For linear history)**
- Creates linear history
- No merge commits

```bash
git checkout feature/your-branch
git rebase develop
git checkout develop
git merge feature/your-branch
git push origin develop
```

### Step 8: Post-Merge Actions

```bash
# Delete the feature branch locally
git branch -d feature/your-branch

# Delete the remote branch
git push origin --delete feature/your-branch

# Verify deployment (if auto-deployed)
# Check logs, metrics, etc.
```

## Merge Strategies by Branch Type

### Feature Branch → Develop
- **Strategy**: Squash and merge
- **Reason**: Clean history, single commit per feature
- **Review**: Required, 1+ approvals

### Develop → Staging
- **Strategy**: Merge commit
- **Reason**: Track what was deployed
- **Review**: Optional, automated tests must pass

### Staging → Main (Production)
- **Strategy**: Merge commit with tag
- **Reason**: Clear production releases
- **Review**: Required, 2+ approvals
- **Additional**: Create release notes

### Hotfix → Main
- **Strategy**: Fast-forward or merge commit
- **Reason**: Quick deployment needed
- **Review**: Required, 1+ approval
- **Additional**: Also merge to develop

## Protected Branch Settings

### Main Branch Protection

```yaml
Required status checks:
  - CI/CD pipeline
  - Code coverage (minimum 80%)
  - Security scanning
  - Linting

Required reviews:
  - Minimum: 2 approvals
  - Dismiss stale reviews: Yes
  - Require review from code owners: Yes

Additional restrictions:
  - Require signed commits
  - Require linear history
  - Include administrators: Yes
  - Restrict who can push: Yes
```

### Develop Branch Protection

```yaml
Required status checks:
  - CI/CD pipeline
  - Unit tests
  - Integration tests

Required reviews:
  - Minimum: 1 approval
  - Dismiss stale reviews: Yes

Additional restrictions:
  - Include administrators: No
```

## Dealing with Merge Problems

### Problem: Merge Conflicts

```bash
# Abort and start over
git merge --abort

# Update your branch first
git fetch origin
git rebase origin/develop

# Resolve conflicts
# Edit conflicted files
git add <resolved-files>
git rebase --continue
```

### Problem: Tests Fail After Merge

```bash
# Identify the issue
npm test -- --verbose

# If it's due to merge
git merge --abort

# Fix the issue
# Make necessary changes
git add .
git commit -m "Fix test failures after merge"
```

### Problem: Breaking Changes in Target Branch

```bash
# Review changes in target branch
git log develop --oneline -10

# Update your code to accommodate changes
# Run tests
npm test

# Commit fixes
git add .
git commit -m "Update for compatibility with develop"
```

## Merge Request Template

Create `.github/PULL_REQUEST_TEMPLATE.md`:

```markdown
## Description
<!-- Describe your changes in detail -->

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issues
<!-- Link to related issues: Fixes #123, Relates to #456 -->

## Testing
<!-- Describe the tests you ran and how to reproduce them -->
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published

## Screenshots (if applicable)
<!-- Add screenshots to demonstrate changes -->

## Additional Notes
<!-- Any additional information for reviewers -->
```

## Emergency Rollback Procedures

### If Merge Causes Production Issues

**Option 1: Revert the Merge Commit**
```bash
# Find the merge commit
git log --oneline -10

# Revert it
git revert -m 1 <merge-commit-hash>

# Push immediately
git push origin main

# Deploy
```

**Option 2: Deploy Previous Version**
```bash
# Create hotfix from previous commit
git checkout -b hotfix/rollback main~1

# Push and deploy
git push origin hotfix/rollback
```

**Option 3: Feature Flag (Preferred)**
```bash
# If feature flag is used, just disable it
# No code deployment needed
# Update environment variable or database flag
```

## Merge Automation

### GitHub Actions for Safe Merging

Create `.github/workflows/merge-checks.yml`:

```yaml
name: Merge Checks

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check for merge conflicts
        run: |
          git fetch origin ${{ github.base_ref }}
          git merge-base HEAD origin/${{ github.base_ref }} || exit 1
      
      - name: Run tests
        run: npm test
      
      - name: Run linting
        run: npm run lint
      
      - name: Check code coverage
        run: npm run test:coverage
      
      - name: Security scan
        run: npm audit --production
```

## Best Practices Summary

1. **Always update before merging**: Pull latest changes from target branch
2. **Run all checks locally**: Don't rely solely on CI
3. **Keep PRs small**: Easier to review and safer to merge
4. **Use descriptive commit messages**: Help future maintainers
5. **Squash WIP commits**: Clean up history before merging
6. **Test after merge**: Verify everything works together
7. **Monitor after deployment**: Watch for issues
8. **Have a rollback plan**: Know how to revert quickly
9. **Use feature flags**: Deploy safely with kill switches
10. **Delete merged branches**: Keep repository clean

## Common Mistakes to Avoid

❌ **Don't**:
- Merge without running tests
- Force push to shared branches (unless using --force-with-lease)
- Merge your own PRs without review
- Skip CI checks
- Merge when conflicts exist
- Leave feature branches open indefinitely
- Merge incomplete features without feature flags

✅ **Do**:
- Run full test suite before merging
- Get code reviews
- Keep branches up to date
- Use meaningful commit messages
- Clean up after merging
- Monitor deployments
- Use feature flags for incomplete features
