#!/bin/bash
# Script to create branches following the branching strategy

set -e

echo "🌿 Branch Creation Helper"
echo "========================="
echo ""

# Function to display usage
usage() {
    echo "Usage: ./scripts/create-branch.sh <type> <name>"
    echo ""
    echo "Branch Types:"
    echo "  feature  - New feature or enhancement"
    echo "  bugfix   - Bug fix for develop branch"
    echo "  hotfix   - Urgent fix for production"
    echo "  release  - Release preparation"
    echo ""
    echo "Examples:"
    echo "  ./scripts/create-branch.sh feature user-authentication"
    echo "  ./scripts/create-branch.sh bugfix login-error"
    echo "  ./scripts/create-branch.sh hotfix critical-security-patch"
    echo "  ./scripts/create-branch.sh release v1.2.0"
    exit 1
}

# Check arguments
if [ $# -lt 2 ]; then
    usage
fi

BRANCH_TYPE=$1
BRANCH_NAME=$2

# Validate branch type
case $BRANCH_TYPE in
    feature|bugfix|hotfix|release)
        ;;
    *)
        echo "❌ Error: Invalid branch type '$BRANCH_TYPE'"
        usage
        ;;
esac

# Determine base branch
case $BRANCH_TYPE in
    feature|bugfix|release)
        BASE_BRANCH="develop"
        ;;
    hotfix)
        BASE_BRANCH="main"
        ;;
esac

# Check if base branch exists
if ! git rev-parse --verify $BASE_BRANCH >/dev/null 2>&1; then
    echo "⚠️  Warning: Base branch '$BASE_BRANCH' doesn't exist locally."
    echo "Creating it from origin/$BASE_BRANCH..."
    git fetch origin
    git checkout -b $BASE_BRANCH origin/$BASE_BRANCH
fi

FULL_BRANCH_NAME="${BRANCH_TYPE}/${BRANCH_NAME}"

echo "📋 Summary:"
echo "  Type: $BRANCH_TYPE"
echo "  Name: $BRANCH_NAME"
echo "  Full Branch: $FULL_BRANCH_NAME"
echo "  Base Branch: $BASE_BRANCH"
echo ""

# Check if branch already exists
if git rev-parse --verify $FULL_BRANCH_NAME >/dev/null 2>&1; then
    echo "❌ Error: Branch '$FULL_BRANCH_NAME' already exists!"
    exit 1
fi

# Create branch
echo "🔄 Checking out base branch: $BASE_BRANCH"
git checkout $BASE_BRANCH

echo "🔄 Pulling latest changes from origin/$BASE_BRANCH"
git pull origin $BASE_BRANCH

echo "🌟 Creating new branch: $FULL_BRANCH_NAME"
git checkout -b $FULL_BRANCH_NAME

echo "📤 Pushing branch to remote"
git push -u origin $FULL_BRANCH_NAME

echo ""
echo "✅ Success! Branch '$FULL_BRANCH_NAME' created and pushed to remote."
echo ""
echo "Next steps:"
echo "  1. Make your changes"
echo "  2. Commit with: git commit -m 'Your message'"
echo "  3. Push with: git push origin $FULL_BRANCH_NAME"
echo "  4. Create a Pull Request when ready"
echo ""
