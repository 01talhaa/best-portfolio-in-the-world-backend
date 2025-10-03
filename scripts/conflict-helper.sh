#!/bin/bash
# Script to help resolve merge conflicts

set -e

echo "🔧 Conflict Resolution Helper"
echo "=============================="
echo ""

# Check if we're in a merge/rebase
if [ ! -f .git/MERGE_HEAD ] && [ ! -d .git/rebase-merge ] && [ ! -d .git/rebase-apply ]; then
    echo "❌ Not currently in a merge or rebase conflict state."
    exit 1
fi

# Show conflicted files
echo "📋 Conflicted files:"
git diff --name-only --diff-filter=U | while read -r file; do
    echo "  - $file"
done

echo ""
echo "Options:"
echo "  1) View conflicts in detail"
echo "  2) Accept current changes (ours)"
echo "  3) Accept incoming changes (theirs)"
echo "  4) Open files for manual resolution"
echo "  5) Abort merge/rebase"
echo "  6) Continue after resolving"
echo "  7) Exit"
echo ""
read -p "Choose an option (1-7): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo "📝 Detailed conflict view:"
        echo ""
        git diff --name-only --diff-filter=U | while read -r file; do
            echo "=== $file ==="
            git diff "$file" | head -n 50
            echo ""
        done
        ;;
    2)
        echo "⚠️  Accepting current changes (ours) for all conflicts..."
        git diff --name-only --diff-filter=U | while read -r file; do
            git checkout --ours "$file"
            git add "$file"
            echo "✅ Resolved: $file (kept current changes)"
        done
        ;;
    3)
        echo "⚠️  Accepting incoming changes (theirs) for all conflicts..."
        git diff --name-only --diff-filter=U | while read -r file; do
            git checkout --theirs "$file"
            git add "$file"
            echo "✅ Resolved: $file (kept incoming changes)"
        done
        ;;
    4)
        echo "📝 Opening conflicted files..."
        git diff --name-only --diff-filter=U | while read -r file; do
            echo "Edit: $file"
            ${EDITOR:-nano} "$file"
            read -p "Mark as resolved? (y/N): " -n 1 -r
            echo ""
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git add "$file"
                echo "✅ Marked as resolved: $file"
            fi
        done
        ;;
    5)
        echo "⚠️  Aborting merge/rebase..."
        if [ -f .git/MERGE_HEAD ]; then
            git merge --abort
        elif [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
            git rebase --abort
        fi
        echo "✅ Aborted"
        ;;
    6)
        # Check if all conflicts are resolved
        if [ -n "$(git diff --name-only --diff-filter=U)" ]; then
            echo "❌ Error: Not all conflicts are resolved!"
            echo "Remaining conflicts:"
            git diff --name-only --diff-filter=U
            exit 1
        fi
        
        echo "✅ All conflicts resolved"
        echo "🔄 Continuing..."
        
        if [ -f .git/MERGE_HEAD ]; then
            git commit --no-edit || git commit
        elif [ -d .git/rebase-merge ] || [ -d .git/rebase-apply ]; then
            git rebase --continue
        fi
        echo "✅ Completed"
        ;;
    7)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

echo ""
echo "💡 Tips:"
echo "  - Review your changes: git diff"
echo "  - Check status: git status"
echo "  - Run tests before continuing"
echo ""
