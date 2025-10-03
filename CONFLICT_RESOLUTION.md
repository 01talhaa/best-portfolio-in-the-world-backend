# Git Conflict Resolution Guide

## Understanding Merge Conflicts

Conflicts occur when Git cannot automatically merge changes because the same lines have been modified in different branches.

## Prevention Strategies

1. **Pull frequently**: Keep your branch up to date
   ```bash
   git pull origin develop
   ```

2. **Communicate with team**: Coordinate on files being edited

3. **Small, frequent commits**: Easier to resolve conflicts

4. **Use feature flags**: Avoid long-lived branches

## Identifying Conflicts

```bash
# When merging
git merge feature/your-branch

# Git will show conflict markers
# <<<<<<< HEAD
# Your current branch changes
# =======
# Incoming branch changes
# >>>>>>> feature/your-branch
```

## Resolution Process

### Step 1: Check Conflict Status
```bash
git status
```

### Step 2: Open Conflicted Files
Look for conflict markers:
```
<<<<<<< HEAD
// Current branch code
=======
// Incoming branch code
>>>>>>> branch-name
```

### Step 3: Resolve Conflicts
- **Keep current**: Remove incoming changes and markers
- **Keep incoming**: Remove current changes and markers
- **Keep both**: Merge both changes logically
- **Write new**: Create a new solution

### Step 4: Mark as Resolved
```bash
# After editing the file
git add <conflicted-file>
```

### Step 5: Complete the Merge
```bash
git commit -m "Resolved merge conflicts between X and Y"
```

## Tools for Conflict Resolution

### Visual Diff Tools
```bash
# Set up a merge tool
git config --global merge.tool vimdiff
# or
git config --global merge.tool vscode

# Use the merge tool
git mergetool
```

### VS Code
- Built-in conflict resolution UI
- "Accept Current Change", "Accept Incoming Change", "Accept Both Changes"

### Command Line
```bash
# To abort a merge
git merge --abort

# To see differences
git diff

# To see what changed in the other branch
git log --merge -p <filename>
```

## Conflict Resolution Workflow

### For Feature Branches

1. **Update your feature branch**:
   ```bash
   git checkout feature/your-branch
   git fetch origin
   git merge origin/develop
   ```

2. **Resolve conflicts** in your editor

3. **Test thoroughly** after resolution

4. **Commit and push**:
   ```bash
   git add .
   git commit -m "Resolved conflicts with develop"
   git push origin feature/your-branch
   ```

### For Hotfix Merges

1. **Merge hotfix to main**:
   ```bash
   git checkout main
   git merge hotfix/your-fix
   ```

2. **Also merge to develop** to keep in sync:
   ```bash
   git checkout develop
   git merge hotfix/your-fix
   ```

## Best Practices

1. **Understand both changes**: Read the code before deciding
2. **Test after resolution**: Always run tests
3. **Preserve intent**: Maintain the purpose of both changes when possible
4. **Ask for help**: Consult the original author if unclear
5. **Document complex resolutions**: Add comments explaining why
6. **Use git rerere**: Cache conflict resolutions
   ```bash
   git config --global rerere.enabled true
   ```

## Common Conflict Scenarios

### Scenario 1: Same Line Modified
- Review both changes
- Combine if complementary
- Choose best implementation if competing

### Scenario 2: File Deleted in One Branch
- Determine if deletion was intentional
- Either keep the file with changes or confirm deletion

### Scenario 3: File Renamed
- Git usually handles this automatically
- If conflict, choose the appropriate name and apply changes

### Scenario 4: Package Dependencies
- For package.json conflicts, keep both dependencies
- Run package manager after resolution
- Update lock files

## Emergency Commands

```bash
# Abort merge and start over
git merge --abort

# Abort rebase
git rebase --abort

# Reset to before merge (DANGEROUS)
git reset --hard HEAD~1

# See merge conflict history
git log --merge --left-right -p
```

## Post-Resolution Checklist

- [ ] All conflict markers removed
- [ ] Code compiles/runs
- [ ] Tests pass
- [ ] Changes reviewed
- [ ] Committed with clear message
- [ ] Pushed to remote
