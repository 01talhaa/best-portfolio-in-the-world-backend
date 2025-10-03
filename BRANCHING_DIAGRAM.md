# Branching Strategy Diagram

## Visual Representation

```
                    Production Releases
                           ↓
main     ●─────●─────────●─────────────●───────────→
         │     ↑         ↑             ↑
         │     │         │             │
         │   [v1.0.0]  [v1.1.0]     [v1.2.0]
         │     │         │             │
         │     │         │      hotfix/security
         │     │         │         │
         │     │      release/v1.2.0
         │     │         ●
         │     │         │
staging  │     ●─────────●─────────────●───────────→
         │     ↑         ↑             ↑
         │     │         │             │
         │     │    Integration Testing
         │     │         │
develop  ●─────●─────●───●───●─────────●───────────→
               ↑     │   │   ↑         
               │     │   │   │         
        feature/auth │   │   bugfix/login
               │     │   │              
               ●─────●   │              
                         │              
                  feature/dashboard    
                         │              
                         ●─────●        
```

## Branch Types Explained

### Main Branches (Permanent)

```
main
  ├── Production-ready code
  ├── Tagged with version numbers (v1.0.0, v1.1.0, etc.)
  ├── Protected: Requires reviews and checks
  └── Deployed to production

develop
  ├── Integration branch for features
  ├── Latest development changes
  ├── Protected: Requires at least 1 review
  └── Deployed to development/staging

staging (optional)
  ├── Pre-production testing
  ├── Mirror of what will go to production
  └── Deployed to staging environment
```

### Supporting Branches (Temporary)

```
feature/*
  ├── Based on: develop
  ├── Merge to: develop
  ├── Naming: feature/description
  ├── Purpose: New features
  └── Lifecycle: Create → Develop → PR → Merge → Delete

bugfix/*
  ├── Based on: develop
  ├── Merge to: develop
  ├── Naming: bugfix/description
  ├── Purpose: Bug fixes
  └── Lifecycle: Create → Fix → Test → PR → Merge → Delete

hotfix/*
  ├── Based on: main
  ├── Merge to: main AND develop
  ├── Naming: hotfix/description
  ├── Purpose: Urgent production fixes
  └── Lifecycle: Create → Fix → Test → Merge → Tag → Delete

release/*
  ├── Based on: develop
  ├── Merge to: main AND develop
  ├── Naming: release/version
  ├── Purpose: Release preparation
  └── Lifecycle: Create → QA → Bug fixes → Merge → Tag → Delete
```

## Example Flow: Feature Development

```
Developer creates feature branch from develop:
──────────────────────────────────────────────

develop     ●───────────────────────────●
            │                           ↑
            ↓                           │
feature/x   ●───●───●───●───●───●───●───●
            create commits...      merge back
            
            
Developer keeps branch updated:
──────────────────────────────

develop     ●───●───●───────────────●───●
            │       ↓               │   ↑
            ↓      sync             │   │
feature/x   ●───●───●───●───●───●───●   │
                    ↑               │   │
                    └─── update ────┘   │
                                        │
                    PR approved ────────┘
```

## Example Flow: Hotfix

```
Critical bug found in production:
─────────────────────────────────

main        ●───────────●───────────●
                    ↓   ↑           ↑
                    │   │           │
hotfix/fix          ●───●           │
                    create,fix  merge back
                        
develop     ●───●───────────●───────●
                            ↑
                            │
                    also merge to develop
```

## Example Flow: Release

```
Preparing for release:
─────────────────────

                    ┌─── tag v1.0.0
                    │
main        ●───────●───────────●
                    ↑           ↑
                    │           │
                 merge         tag v1.1.0
                    │           │
release/v1.0.0      ●───●       │
                    ↑   ↓       │
                    │  fixes    │
                    │           │
develop     ●───●───●───────●───●
            │               ↑
            └─ create       └─ merge back
            
            
Timeline of a release:
─────────────────────

develop → release/v1.0.0 → testing → bug fixes → merge to main → tag → merge back to develop
  │            │              │          │            │           │         │
  │            │              │          │            │           │         └─ Continue development
  │            │              │          │            │           └─ Production deployment
  │            │              │          │            └─ Create release
  │            │              │          └─ Only critical fixes
  │            │              └─ QA testing
  │            └─ Feature freeze
  └─ All features ready
```

## Workflow Summary Table

| Action | Base Branch | Target Branch | Script Command |
|--------|-------------|---------------|----------------|
| New feature | develop | develop | `./scripts/create-branch.sh feature name` |
| Bug fix | develop | develop | `./scripts/create-branch.sh bugfix name` |
| Hotfix | main | main + develop | `./scripts/create-branch.sh hotfix name` |
| Release | develop | main + develop | `./scripts/create-branch.sh release vX.Y.Z` |
| Update branch | - | - | `./scripts/update-branch.sh` |
| Safe merge | - | - | `./scripts/safe-merge.sh source target` |

## Real-World Example Timeline

```
Week 1: Feature Development
────────────────────────────

develop     ●───────────────────────●───●
            │                       ↑   ↑
            ↓                       │   │
feature/A   ●───●───●───●───●───●───┘   │
            ↓                           │
feature/B   ●───●───●───●───●───●───────┘


Week 2: Integration & Bug Fixes
────────────────────────────────

develop     ●───●───●───────────●
            │       ↓           ↑
            ↓      sync         │
bugfix/C    ●───●───●───●───●───┘


Week 3: Release Preparation
───────────────────────────

main        ●─────────────────●────→
                              ↑
                             merge
                              │
release/v1  ────●───●───●─────┘
                ↑
               from
                │
develop     ────●───●───●───●───●────→


Week 4: Hotfix (if needed)
──────────────────────────

main        ●───●─────────────●
                ↓             ↑
hotfix/H        ●───●───●─────┘
                              │
                              ├─→ also to develop
```

## Branch Protection Rules

```
main (Production)
├── ✓ Require pull request reviews (2+)
├── ✓ Require status checks to pass
├── ✓ Require branches to be up to date
├── ✓ Require linear history
├── ✓ Restrict direct pushes
└── ✓ Include administrators

develop (Integration)
├── ✓ Require pull request reviews (1+)
├── ✓ Require status checks to pass
├── ✓ Allow squash merging
└── ✗ Include administrators (more flexible)

feature/* (Development)
├── ✗ No protection needed
├── ✓ Push frequently
└── ✓ Keep up to date with develop
```

## Decision Tree: Which Branch to Use?

```
Is it a bug in production?
│
├─ YES → Create hotfix/* from main
│        └─ Merge to main AND develop
│
└─ NO → Is it a new feature?
        │
        ├─ YES → Create feature/* from develop
        │        └─ Merge to develop
        │
        └─ NO → Is it a bug in develop?
                │
                ├─ YES → Create bugfix/* from develop
                │        └─ Merge to develop
                │
                └─ NO → Are you preparing a release?
                        │
                        ├─ YES → Create release/* from develop
                        │        └─ Merge to main AND develop
                        │
                        └─ NO → You're probably on the wrong branch!
```

## Color Legend (for visualization)

```
● Commit
─ Branch timeline
↑ Merge direction (merging into)
↓ Branch creation (branching from)
→ Continuing timeline
```

## Tips for Reading the Diagrams

1. **Time flows left to right** → Oldest commits on the left, newest on the right
2. **Arrows show direction** ↓ Creating a branch, ↑ Merging back
3. **Bullet points (●)** represent commits
4. **Branch names** are shown on the left
5. **Lifecycle** is shown from creation to deletion

## Common Patterns

### Pattern 1: Simple Feature

```
develop  ●───────────●
         │           ↑
feature  ●───●───●───┘
         create  merge
```

### Pattern 2: Long-Running Feature

```
develop  ●───●───●───●───●───●───●
         │   ↓   ↓   ↓       │   ↑
feature  ●───●───●───●───●───●───┘
         create  sync sync   merge
```

### Pattern 3: Multiple Features

```
develop     ●───────────●───●───●
            │           ↑   ↑   ↑
feature/A   ●───●───●───┘   │   │
feature/B   ●───●───●───────┘   │
feature/C   ●───●───●───────────┘
```

### Pattern 4: Emergency Hotfix

```
main     ●─────────●───●
             ↓     ↑   ↑
hotfix       ●─●─●─┘   │
                       │
develop  ●─────────────●
         also merge here
```

---

For more details, see:
- [BRANCHING_STRATEGY.md](BRANCHING_STRATEGY.md) - Complete strategy
- [WORKFLOW_GUIDE.md](WORKFLOW_GUIDE.md) - Step-by-step workflows
- [GETTING_STARTED.md](GETTING_STARTED.md) - Quick start guide
