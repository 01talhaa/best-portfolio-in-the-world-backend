#!/bin/bash
# Script to update current branch with latest changes from base branch

set -e

echo "🔄 Branch Update Helper"
echo "======================="
echo ""

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)

if [ -z "$CURRENT_BRANCH" ]; then
    echo "❌ Error: Not on any branch!"
    exit 1
fi

echo "Current branch: $CURRENT_BRANCH"

# Determine base branch based on branch type
case $CURRENT_BRANCH in
    feature/*|bugfix/*|release/*)
        BASE_BRANCH="develop"
        ;;
    hotfix/*)
        BASE_BRANCH="main"
        ;;
    develop|staging|main)
        echo "⚠️  You're on a main branch. This script is for feature branches."
        echo "To update this branch, use: git pull origin $CURRENT_BRANCH"
        exit 1
        ;;
    *)
        echo "⚠️  Branch doesn't follow naming convention."
        read -p "Enter base branch name (develop/main): " BASE_BRANCH
        ;;
esac

echo "Base branch: $BASE_BRANCH"
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  You have uncommitted changes:"
    git status --short
    echo ""
    read -p "Stash changes before updating? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git stash push -m "Auto-stash before update on $(date)"
        STASHED=true
        echo "✅ Changes stashed"
    else
        echo "❌ Please commit or stash changes before updating"
        exit 1
    fi
fi

# Fetch latest changes
echo "🔄 Fetching latest changes..."
git fetch origin

# Update base branch
echo "🔄 Updating $BASE_BRANCH..."
git fetch origin $BASE_BRANCH:$BASE_BRANCH 2>/dev/null || {
    git checkout $BASE_BRANCH
    git pull origin $BASE_BRANCH
    git checkout $CURRENT_BRANCH
}

# Choose merge strategy
echo ""
echo "Update strategy:"
echo "  1) Merge (preserves history, creates merge commit)"
echo "  2) Rebase (cleaner history, rewrites commits)"
echo ""
read -p "Choose strategy (1/2): " -n 1 -r
echo ""

if [[ $REPLY == "2" ]]; then
    echo "🔄 Rebasing on $BASE_BRANCH..."
    git rebase origin/$BASE_BRANCH || {
        echo ""
        echo "❌ Rebase failed due to conflicts!"
        echo ""
        echo "To resolve:"
        echo "  1. Fix conflicts in the listed files"
        echo "  2. git add <resolved-files>"
        echo "  3. git rebase --continue"
        echo ""
        echo "Or abort with: git rebase --abort"
        exit 1
    }
    echo "✅ Rebase successful"
    echo ""
    echo "⚠️  Your branch history has been rewritten."
    echo "To push, you'll need: git push --force-with-lease origin $CURRENT_BRANCH"
else
    echo "🔄 Merging $BASE_BRANCH..."
    git merge origin/$BASE_BRANCH || {
        echo ""
        echo "❌ Merge failed due to conflicts!"
        echo ""
        echo "To resolve:"
        echo "  1. Fix conflicts in the listed files"
        echo "  2. git add <resolved-files>"
        echo "  3. git commit"
        echo ""
        echo "Or abort with: git merge --abort"
        exit 1
    }
    echo "✅ Merge successful"
fi

# Restore stashed changes if any
if [ "$STASHED" = true ]; then
    echo ""
    echo "🔄 Restoring stashed changes..."
    git stash pop || {
        echo "⚠️  Conflict while restoring stash!"
        echo "Your changes are still in the stash."
        echo "Resolve conflicts and then: git stash pop"
    }
fi

# Run tests if available
if [ -f "package.json" ] && command -v npm &> /dev/null; then
    echo ""
    read -p "Run tests? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm test || echo "⚠️  Tests failed. Please fix before pushing."
    fi
fi

echo ""
echo "✅ Branch updated successfully!"
echo ""
echo "Next steps:"
echo "  1. Review changes: git log --oneline -5"
echo "  2. Run tests if you haven't: npm test"
if [[ $REPLY == "2" ]]; then
    echo "  3. Push with: git push --force-with-lease origin $CURRENT_BRANCH"
else
    echo "  3. Push with: git push origin $CURRENT_BRANCH"
fi
echo ""
