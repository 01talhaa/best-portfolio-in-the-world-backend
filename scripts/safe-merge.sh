#!/bin/bash
# Script to perform a safe merge with all checks

set -e

echo "🔒 Safe Merge Helper"
echo "===================="
echo ""

# Function to display usage
usage() {
    echo "Usage: ./scripts/safe-merge.sh <source-branch> <target-branch>"
    echo ""
    echo "Examples:"
    echo "  ./scripts/safe-merge.sh feature/user-auth develop"
    echo "  ./scripts/safe-merge.sh develop staging"
    echo "  ./scripts/safe-merge.sh hotfix/security-patch main"
    exit 1
}

# Check arguments
if [ $# -lt 2 ]; then
    usage
fi

SOURCE_BRANCH=$1
TARGET_BRANCH=$2

echo "📋 Merge Summary:"
echo "  From: $SOURCE_BRANCH"
echo "  To: $TARGET_BRANCH"
echo ""

# Verify branches exist
if ! git rev-parse --verify $SOURCE_BRANCH >/dev/null 2>&1; then
    echo "❌ Error: Source branch '$SOURCE_BRANCH' doesn't exist!"
    exit 1
fi

if ! git rev-parse --verify $TARGET_BRANCH >/dev/null 2>&1; then
    echo "❌ Error: Target branch '$TARGET_BRANCH' doesn't exist!"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: You have uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi

echo "✅ No uncommitted changes"

# Fetch latest changes
echo ""
echo "🔄 Fetching latest changes from remote..."
git fetch origin

# Switch to source branch and update
echo "🔄 Updating source branch: $SOURCE_BRANCH"
git checkout $SOURCE_BRANCH
git pull origin $SOURCE_BRANCH

# Switch to target branch and update
echo "🔄 Updating target branch: $TARGET_BRANCH"
git checkout $TARGET_BRANCH
git pull origin $TARGET_BRANCH

# Check for merge conflicts before attempting merge
echo ""
echo "🔍 Checking for potential conflicts..."
git merge --no-commit --no-ff $SOURCE_BRANCH > /dev/null 2>&1 || {
    echo "⚠️  Merge conflicts detected!"
    echo ""
    echo "Conflicted files:"
    git diff --name-only --diff-filter=U
    echo ""
    echo "Please resolve conflicts manually:"
    echo "  1. Edit conflicted files"
    echo "  2. git add <resolved-files>"
    echo "  3. git commit"
    echo "  4. git push origin $TARGET_BRANCH"
    echo ""
    echo "Or abort with: git merge --abort"
    exit 1
}

# Abort the test merge
git merge --abort

echo "✅ No merge conflicts detected"

# Run tests if package.json exists
if [ -f "package.json" ]; then
    echo ""
    echo "🧪 Running tests..."
    if command -v npm &> /dev/null; then
        npm test || {
            echo "❌ Tests failed! Please fix them before merging."
            exit 1
        }
        echo "✅ All tests passed"
    else
        echo "⚠️  npm not found, skipping tests"
    fi
fi

# Perform the actual merge
echo ""
echo "🔀 Performing merge..."
git merge --no-ff $SOURCE_BRANCH -m "Merge $SOURCE_BRANCH into $TARGET_BRANCH"

echo "✅ Merge completed successfully"

# Ask for confirmation before pushing
echo ""
read -p "Push to remote? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Pushing to origin/$TARGET_BRANCH..."
    git push origin $TARGET_BRANCH
    echo "✅ Successfully pushed to remote"
    
    # Ask about deleting source branch
    echo ""
    read -p "Delete source branch $SOURCE_BRANCH? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git branch -d $SOURCE_BRANCH 2>/dev/null || git branch -D $SOURCE_BRANCH
        git push origin --delete $SOURCE_BRANCH
        echo "✅ Source branch deleted"
    fi
else
    echo "⚠️  Changes not pushed. To push later, run:"
    echo "  git push origin $TARGET_BRANCH"
fi

echo ""
echo "🎉 Merge process completed!"
