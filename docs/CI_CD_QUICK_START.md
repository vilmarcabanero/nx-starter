# CI/CD Quick Start Guide

This guide helps developers understand and work with the CI/CD pipeline in the nx-starter project.

## 🚀 Quick Overview

The project uses **GitHub Actions** with **NX** for intelligent CI/CD that only tests and builds what you've changed.

### Key Benefits
- ⚡ **Fast Feedback** - Only runs tests/builds for affected code
- 🔒 **Security First** - Automated vulnerability scanning
- 🎯 **Smart Deployment** - Staging auto-deploys, production requires approval
- 📊 **Great Reporting** - Detailed test results and coverage

## 🏃‍♂️ Getting Started

### 1. Development Workflow
```bash
# Create feature branch
git checkout -b feature/my-awesome-feature

# Make your changes
# ... code, code, code ...

# Test locally before committing
pnpm run ci                    # Full CI check
pnpm run test:affected         # Only test what changed

# Commit and push
git add .
git commit -m "feat(starter-api): add awesome feature"
git push origin feature/my-awesome-feature
```

### 2. Create Pull Request
- GitHub Actions will automatically run CI checks
- Only affected projects are tested (much faster!)
- All checks must pass before merge

### 3. After Merge to Main
- Staging deployment triggers automatically
- Security scans run
- Production deployment is available via tags

## 📋 CI Pipeline Overview

### For Pull Requests
```
┌─────────────────────────────────────────────────────────────┐
│                     PR CI Pipeline                          │
├─────────────────────────────────────────────────────────────┤
│ 1. 🔍 Detect Changes    → Only affected projects           │
│ 2. 🧹 Code Quality      → ESLint, Prettier, TypeScript    │
│ 3. 🧪 Unit Tests        → Node 18, 20, 22 (affected only) │
│ 4. 🏗️  Build Apps       → Production builds (affected)     │
│ 5. 🌐 E2E Tests         → Playwright (affected apps)      │
└─────────────────────────────────────────────────────────────┘
```

### For Main Branch
```
┌─────────────────────────────────────────────────────────────┐
│                   Main Branch Pipeline                      │
├─────────────────────────────────────────────────────────────┤
│ 1-5. Same as PR Pipeline                                   │
│ 6. 🔒 Security Scan     → Vulnerabilities, secrets        │
│ 7. 🚀 Staging Deploy    → Auto-deploy to staging          │
│ 8. 📦 Prod Ready        → Build production artifacts      │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Essential Commands

### Development
```bash
pnpm dev                       # Start all services
pnpm dev:api                   # API server only
pnpm dev:web                   # Web app only
```

### Testing (what CI runs)
```bash
pnpm ci                        # Full CI pipeline
pnpm test                      # All unit tests
pnpm e2e                       # All E2E tests
pnpm lint                      # Code quality checks
```

### Building
```bash
pnpm build                     # Build all apps
pnpm build:prod                # Production build
pnpm build:libs                # Libraries only
```

### Affected Analysis (NX superpower!)
```bash
# See what's affected by your changes
nx affected:graph              # Visual graph
nx show projects --affected    # List affected projects

# Run commands only on affected projects
nx affected -t test            # Test only affected
nx affected -t build           # Build only affected
```

## 🎯 Workflow Files Explained

| File | Purpose | When it Runs |
|------|---------|--------------|
| `ci.yml` | Main CI pipeline | Every PR + main branch |
| `cd-staging.yml` | Deploy to staging | Push to main/develop |
| `cd-production.yml` | Deploy to production | Version tags + manual |
| `security.yml` | Security scanning | Daily + main branch |
| `dependency-updates.yml` | Auto-update deps | Weekly + manual |
| `e2e-tests.yml` | Extended E2E testing | Push/PR to main |

## 🚦 Understanding CI Status Checks

### ✅ Required Checks (must pass)
- **Code Quality & Linting** - Your code follows standards
- **Unit Tests (Node 20)** - Core functionality works
- **Build Applications** - Apps can be built
- **E2E Tests** - User workflows work

### ℹ️ Optional Checks
- **Security Scan** - No vulnerabilities found
- **Node 18/22 Tests** - Compatibility testing
- **Mobile E2E** - Mobile browser testing

## 🔍 Debugging Failed Checks

### 1. Linting Failures
```bash
# Fix locally
pnpm lint:fix
pnpm format

# Check what failed
pnpm lint
```

### 2. Test Failures
```bash
# Run the same tests locally
pnpm test

# Run only affected tests
nx affected -t test

# Check coverage
pnpm test:coverage
```

### 3. Build Failures
```bash
# Check TypeScript errors
pnpm typecheck

# Try building locally
pnpm build

# Build only what's affected
nx affected -t build
```

### 4. E2E Test Failures
```bash
# Run E2E tests with UI (helpful for debugging)
pnpm e2e --headed

# Run specific test file
pnpm nx e2e starter-pwa-e2e --spec="**/todo.spec.ts"
```

## 🚀 Deployment Process

### Staging (Automatic)
```
main branch push → Staging Deploy → Health Checks → ✅ Live
```

### Production (Manual)
```
Tag v1.0.0 → Security Audit → Manual Approval → Deploy → Smoke Tests → ✅ Live
```

#### Creating Production Release
```bash
# Create and push a version tag
git tag -a v1.2.3 -m "Release version 1.2.3"
git push origin v1.2.3

# Or trigger manual deployment in GitHub Actions
```

## 🔒 Security Features

### Automatic Scans
- **Daily** vulnerability scans
- **Secret detection** in commits
- **License compliance** checking
- **Container security** scanning

### What to Do If Security Fails
1. Check the security scan results
2. Update vulnerable dependencies: `pnpm update`
3. Remove any accidentally committed secrets
4. Review license compatibility issues

## 📊 Monitoring Your Changes

### GitHub Actions Dashboard
- Go to **Actions** tab in GitHub
- See all workflow runs
- Click on any run for detailed logs

### Key Metrics to Watch
- ✅ **Success Rate** - Are your changes passing CI?
- ⏱️ **Duration** - How long do builds take?
- 🔄 **Frequency** - How often are you breaking things?

## 💡 Pro Tips

### 1. Faster Feedback
```bash
# Test only what you changed before pushing
nx affected -t test,lint,build

# Use watch mode during development
pnpm test:watch
```

### 2. Better Commit Messages
Follow the conventional commit format for better automation:
```bash
feat(starter-api): add user authentication
fix(starter-pwa): resolve login button styling
docs(readme): update installation instructions
```

### 3. Leverage NX Affected
```bash
# See what your changes affect
nx affected:graph

# Run full affected pipeline
nx affected -t lint,test,build
```

### 4. Working with E2E Tests
```bash
# Debug E2E tests visually
pnpm e2e --headed --debug

# Run tests against different browsers
pnpm exec playwright test --project=firefox
```

## 🆘 Getting Help

### When CI Fails
1. **Check the logs** - Click on the failed job in GitHub Actions
2. **Run locally** - Try reproducing the issue on your machine
3. **Check recent changes** - Did something change in main?
4. **Ask for help** - Create an issue or ask the team

### Common Issues
- **Cache problems** - Clear NX cache: `nx reset`
- **Dependency issues** - Fresh install: `rm -rf node_modules && pnpm install`
- **Test flakiness** - Run tests multiple times to confirm
- **Build timeouts** - Check for infinite loops or heavy operations

## 🎓 Learning Resources

### NX Documentation
- [NX Affected Commands](https://nx.dev/packages/nx/documents/affected)
- [NX Caching](https://nx.dev/concepts/how-caching-works)

### GitHub Actions
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Context and Expressions](https://docs.github.com/en/actions/learn-github-actions/contexts)

### Playwright E2E Testing
- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)

---

**Need more help?** Check the full [CI/CD Guide](./CI_CD_GUIDE.md) or create an issue!