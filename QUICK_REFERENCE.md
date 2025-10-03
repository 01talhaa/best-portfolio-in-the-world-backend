# Quick Reference Guide

## Common Git Commands

### Branch Management
```bash
# View all branches
git branch -a

# Create and switch to new branch
git checkout -b feature/branch-name

# Switch branches
git checkout branch-name

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name

# Rename current branch
git branch -m new-name
```

### Syncing Changes
```bash
# Fetch all remote changes
git fetch origin

# Pull changes from remote
git pull origin branch-name

# Push changes to remote
git push origin branch-name

# Force push (be careful!)
git push --force-with-lease origin branch-name
```

### Committing
```bash
# Stage all changes
git add .

# Stage specific file
git add filename

# Commit with message
git commit -m "Your message"

# Amend last commit
git commit --amend

# Amend without changing message
git commit --amend --no-edit
```

### Viewing History
```bash
# View commit history
git log --oneline -10

# View changes
git diff

# View changes for specific file
git diff filename

# View changes in staged files
git diff --staged

# View file at specific commit
git show commit-hash:filename
```

### Conflict Resolution
```bash
# View conflicted files
git status

# Accept current changes
git checkout --ours filename

# Accept incoming changes
git checkout --theirs filename

# Abort merge
git merge --abort

# Abort rebase
git rebase --abort
```

### Stashing
```bash
# Stash current changes
git stash

# Stash with message
git stash push -m "Work in progress"

# List stashes
git stash list

# Apply last stash
git stash pop

# Apply specific stash
git stash apply stash@{0}

# Drop stash
git stash drop stash@{0}
```

## Helper Scripts Quick Reference

### Create Branch
```bash
./scripts/create-branch.sh feature user-login
./scripts/create-branch.sh bugfix payment-error
./scripts/create-branch.sh hotfix security-patch
./scripts/create-branch.sh release v1.0.0
```

### Update Branch
```bash
# Updates current branch with base branch changes
./scripts/update-branch.sh
```

### Safe Merge
```bash
./scripts/safe-merge.sh source-branch target-branch
./scripts/safe-merge.sh feature/auth develop
```

### Conflict Helper
```bash
# Run when in conflict state
./scripts/conflict-helper.sh
```

## Common Workflows

### Starting a New Feature
```bash
# 1. Create feature branch
./scripts/create-branch.sh feature my-feature

# 2. Make changes
# ... edit files ...

# 3. Commit changes
git add .
git commit -m "feat: add my feature"

# 4. Push to remote
git push origin feature/my-feature

# 5. Create PR on GitHub
```

### Updating Feature Branch with Develop
```bash
# Method 1: Using helper script
./scripts/update-branch.sh

# Method 2: Manual merge
git checkout feature/my-feature
git fetch origin
git merge origin/develop

# Method 3: Manual rebase
git checkout feature/my-feature
git fetch origin
git rebase origin/develop
```

### Merging Feature to Develop
```bash
# Method 1: Using helper script
./scripts/safe-merge.sh feature/my-feature develop

# Method 2: GitHub PR (recommended)
# - Create PR on GitHub
# - Get approval
# - Use "Squash and merge"

# Method 3: Manual
git checkout develop
git pull origin develop
git merge --squash feature/my-feature
git commit -m "feat: add my feature"
git push origin develop
```

### Resolving Conflicts
```bash
# 1. During merge/rebase, conflicts appear
git status  # See conflicted files

# 2. Option A: Use helper script
./scripts/conflict-helper.sh

# 2. Option B: Manual resolution
# Edit files, remove conflict markers
git add resolved-file
git commit  # (for merge)
# or
git rebase --continue  # (for rebase)

# 3. Test and push
npm test
git push origin branch-name
```

### Hotfix Workflow
```bash
# 1. Create hotfix from main
./scripts/create-branch.sh hotfix critical-fix

# 2. Make fix
git add .
git commit -m "fix: critical issue"
git push origin hotfix/critical-fix

# 3. Merge to main
./scripts/safe-merge.sh hotfix/critical-fix main

# 4. Also merge to develop
./scripts/safe-merge.sh hotfix/critical-fix develop

# 5. Tag release
git tag -a v1.0.1 -m "Hotfix release"
git push origin v1.0.1
```

### Cleaning Up
```bash
# Delete merged local branches
git branch --merged | grep -v "\*" | xargs -n 1 git branch -d

# Prune deleted remote branches
git fetch --prune

# Clean up stale branches
git remote prune origin
```

## Emergency Commands

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Undo Last Commit (Discard Changes)
```bash
git reset --hard HEAD~1
```

### Revert Pushed Commit
```bash
git revert commit-hash
git push origin branch-name
```

### Recover Deleted Branch
```bash
# Find the commit hash
git reflog

# Recreate branch
git checkout -b branch-name commit-hash
```

### Fix Wrong Branch
```bash
# If you committed to wrong branch
git checkout correct-branch
git cherry-pick commit-hash

# Then remove from wrong branch
git checkout wrong-branch
git reset --hard HEAD~1
```

## Feature Flags Quick Reference

### Environment-Based
```javascript
// .env
FEATURE_NEW_API=true

// config/featureFlags.js
const flags = {
  NEW_API: process.env.FEATURE_NEW_API === 'true'
};

// Usage
if (flags.NEW_API) {
  // new code
}
```

### User-Based
```javascript
const featureFlags = require('./config/featureFlags');

if (featureFlags.isEnabled('PREMIUM_FEATURE', user)) {
  // premium feature code
}
```

## Git Configuration Tips

### Set Up Git Aliases
```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --oneline --graph --decorate --all'
```

### Enable Rerere (Reuse Recorded Resolution)
```bash
git config --global rerere.enabled true
```

### Set Default Editor
```bash
git config --global core.editor "nano"
# or
git config --global core.editor "code --wait"
```

### Configure Pull Strategy
```bash
git config --global pull.rebase false  # merge (default)
# or
git config --global pull.rebase true   # rebase
```

## Troubleshooting

### Problem: "fatal: refusing to merge unrelated histories"
```bash
git pull origin branch-name --allow-unrelated-histories
```

### Problem: "Updates were rejected because the tip of your current branch is behind"
```bash
# If safe to force push
git push --force-with-lease origin branch-name

# Otherwise, pull first
git pull origin branch-name
```

### Problem: "error: Your local changes would be overwritten"
```bash
# Stash changes first
git stash
git pull origin branch-name
git stash pop
```

### Problem: Detached HEAD state
```bash
# Create a new branch from current position
git checkout -b new-branch-name

# Or go back to a branch
git checkout branch-name
```

## Best Practices Checklist

- [ ] Pull before starting work
- [ ] Create feature branches for all changes
- [ ] Commit frequently with clear messages
- [ ] Keep commits focused and atomic
- [ ] Run tests before pushing
- [ ] Update branch regularly from base
- [ ] Use PR for code review
- [ ] Squash commits when merging
- [ ] Delete branches after merging
- [ ] Tag releases
- [ ] Document breaking changes
- [ ] Use feature flags for incomplete features

## Resources

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Branching Strategy](BRANCHING_STRATEGY.md)
- [Conflict Resolution Guide](CONFLICT_RESOLUTION.md)
- [Safe Merge Guide](SAFE_MERGE_GUIDE.md)
- [Feature Flags Guide](FEATURE_FLAGS.md)
