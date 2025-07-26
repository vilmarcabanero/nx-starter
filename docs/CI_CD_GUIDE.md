# CI/CD Documentation

This document provides comprehensive guidance on the CI/CD implementation for the nx-starter project.

## Overview

The CI/CD pipeline is designed around **GitHub Actions** and leverages **NX's affected analysis** to optimize build and test times. The pipeline follows modern DevOps practices with emphasis on security, reliability, and developer experience.

## Workflow Architecture

### 1. CI Pipeline (`ci.yml`)
**Triggers:** Push to main/master/develop, Pull Requests  
**Purpose:** Comprehensive continuous integration with affected-only optimization

**Jobs:**
- **Setup & Change Detection** - Analyzes affected projects using NX
- **Code Quality & Linting** - ESLint, Prettier, TypeScript checks (affected only)
- **Unit Tests** - Multi-Node.js version testing with coverage (affected only)
- **Build Applications** - Production builds (affected apps only)
- **End-to-End Tests** - Playwright tests (affected apps only)
- **Security Scan** - Dependency audit and secret scanning (main branch only)
- **Deployment Readiness** - Production build verification (main branch only)

**Key Features:**
- 🎯 **Affected Analysis** - Only runs tasks on changed code
- 🔄 **Matrix Testing** - Tests on Node.js 18, 20, 22
- 📦 **Intelligent Caching** - NX and pnpm cache optimization
- ⚡ **Parallel Execution** - Concurrent job execution
- 🔒 **Security First** - Built-in security scanning

### 2. Staging Deployment (`cd-staging.yml`)
**Triggers:** Push to main/develop, Manual dispatch  
**Purpose:** Automated deployment to staging environment

**Features:**
- ✅ Pre-deployment testing
- 🚀 Automated deployment (configurable)
- 🔍 Health checks and smoke tests
- 📊 Deployment reporting

### 3. Production Deployment (`cd-production.yml`)
**Triggers:** Version tags (v*), Manual dispatch with approval  
**Purpose:** Secure, controlled production deployments

**Features:**
- 🔐 Comprehensive security audit
- 👥 Manual approval required (GitHub Environment)
- 💾 Automatic backup procedures
- 🧪 Production smoke tests
- 📋 Release documentation
- 🔄 Rollback planning

### 4. Security Scanning (`security.yml`)
**Triggers:** Daily schedule, Push to main, Pull Requests  
**Purpose:** Continuous security monitoring

**Scans:**
- 🔍 **Dependency Audit** - npm audit for vulnerabilities
- 🕵️ **Secret Detection** - TruffleHog and GitLeaks
- 🛡️ **Code Analysis** - GitHub CodeQL
- 🐳 **Container Security** - Trivy image scanning
- ⚖️ **License Compliance** - License compatibility checks

### 5. Dependency Updates (`dependency-updates.yml`)
**Triggers:** Weekly schedule, Manual dispatch  
**Purpose:** Automated dependency maintenance

**Features:**
- 🔒 **Security Updates** - Automated security patches with PR creation
- 📦 **Minor Updates** - Optional minor/patch version updates
- 🔴 **Major Update Notifications** - Alerts for breaking changes
- 🧪 **Automated Testing** - Full CI before PR creation

### 6. E2E Tests (`e2e-tests.yml`)
**Triggers:** Push/PR to main branches  
**Purpose:** Comprehensive end-to-end testing

**Features:**
- 🌐 **Multi-browser Testing** - Chrome, Firefox, Safari
- 📱 **Mobile Testing** - Mobile Chrome and Safari
- 🔄 **Multi-Node Testing** - Node.js 18, 20, 22
- 📊 **Test Reporting** - Playwright reports and artifacts

## Best Practices Implemented

### 1. NX Optimization
```bash
# Only test affected projects
nx affected -t test --base=origin/main

# Only build affected applications  
nx affected -t build --base=origin/main --configuration=production
```

### 2. Intelligent Caching
- **NX Cache** - Distributed computation caching
- **pnpm Cache** - Dependency installation caching
- **Node.js Cache** - Node modules caching

### 3. Security-First Approach
- Dependency vulnerability scanning
- Secret detection in commits
- Code security analysis
- Container image scanning
- License compliance checking

### 4. Environment Strategy
- **Development** - Feature branches with PR checks
- **Staging** - Automated deployment from main/develop
- **Production** - Tag-based deployment with manual approval

## Configuration Guide

### 1. Repository Setup

#### Required Secrets
Configure these in GitHub Settings > Secrets:

```bash
# Optional: For notifications
SLACK_WEBHOOK_URL          # Slack notifications
DISCORD_WEBHOOK_URL        # Discord notifications

# Optional: For enhanced deployments
AWS_ACCESS_KEY_ID          # AWS deployments
AWS_SECRET_ACCESS_KEY      # AWS deployments
DOCKER_REGISTRY_TOKEN      # Container deployments
```

#### Environment Protection Rules
Set up environments in GitHub Settings > Environments:

- **staging** - Auto-deployment, optional reviewers
- **production** - Required reviewers, manual approval

### 2. Workflow Customization

#### Update pnpm Version
```yaml
env:
  PNPM_VERSION: '10.13.1'  # Update as needed
```

#### Modify Node.js Versions
```yaml
env:
  NODE_VERSIONS: '[18, 20, 22]'  # Add/remove versions
```

#### Configure Deployment Commands
Edit the deployment workflows to match your infrastructure:

```yaml
# Example: AWS S3 + CloudFront
- name: Deploy to AWS
  run: |
    aws s3 sync dist/apps/starter-pwa s3://your-bucket --delete
    aws cloudfront create-invalidation --distribution-id YOUR_ID --paths '/*'

# Example: Docker deployment
- name: Deploy containers
  run: |
    docker build -t your-app:${{ github.sha }} .
    docker push your-registry/your-app:${{ github.sha }}
    kubectl set image deployment/app app=your-registry/your-app:${{ github.sha }}
```

### 3. Branch Protection Rules

Configure in GitHub Settings > Branches > Add rule:

```yaml
Branch name pattern: main
Require status checks to pass before merging: ✓
  - Code Quality & Linting
  - Unit Tests (Node 20)
  - Build Applications
  - E2E Tests
Require branches to be up to date before merging: ✓
Restrict pushes that create files: ✓
```

## Commands Reference

### Development Commands
```bash
# Start development servers
pnpm dev                    # Start all services
pnpm dev:api               # Start API only
pnpm dev:web               # Start web app only

# Build commands
pnpm build                 # Build all applications
pnpm build:libs           # Build libraries only
pnpm build:prod           # Production build
```

### Testing Commands
```bash
# Unit tests
pnpm test                  # All tests
pnpm test:libs            # Library tests only
pnpm test:coverage        # With coverage

# E2E tests
pnpm e2e                  # All E2E tests
pnpm e2e:api             # API E2E tests
pnpm e2e:web             # Web E2E tests
```

### CI Commands
```bash
# Full CI pipeline
pnpm ci                   # lint + typecheck + test + build

# Affected only (for PRs)
pnpm ci:affected          # Run CI on affected projects only
```

### Quality Commands
```bash
# Code quality
pnpm lint                 # Run ESLint
pnpm lint:fix            # Fix linting issues
pnpm format              # Format code
pnpm typecheck           # TypeScript checks
```

## Monitoring and Observability

### 1. GitHub Actions Dashboard
Monitor workflow runs in the Actions tab:
- ✅ **Success rates** - Track pipeline reliability
- ⏱️ **Duration trends** - Monitor performance
- 🔄 **Failure patterns** - Identify problematic areas

### 2. Deployment Tracking
- **Tags** - Version-based deployment tracking
- **Environments** - Deployment history per environment
- **Artifacts** - Build artifact retention

### 3. Security Monitoring
- **Dependabot** - Automated dependency updates
- **Security Advisories** - Vulnerability notifications
- **Code Scanning** - Security issue detection

## Troubleshooting

### Common Issues

#### 1. NX Affected Not Working
```bash
# Ensure proper base branch
git checkout main
git pull origin main

# Check affected projects manually
nx show projects --affected --base=main
```

#### 2. Cache Issues
```bash
# Clear NX cache
nx reset

# Clear pnpm cache
pnpm store prune
```

#### 3. Test Failures
```bash
# Run tests locally with same conditions
NODE_ENV=test pnpm test

# Check for timing issues in E2E tests
pnpm e2e --headed --slow-mo=1000
```

#### 4. Build Failures
```bash
# Check TypeScript errors
pnpm typecheck

# Verify dependencies
pnpm install --frozen-lockfile
```

### Performance Optimization

#### 1. Reduce Workflow Duration
- Use affected analysis consistently
- Optimize Docker layer caching
- Parallelize independent jobs
- Use appropriate timeouts

#### 2. Reduce Resource Usage
- Cache dependencies aggressively
- Use matrix strategies judiciously
- Clean up artifacts regularly
- Monitor runner usage

## Security Considerations

### 1. Secret Management
- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate secrets regularly
- Audit secret access

### 2. Dependency Security
- Regular security audits
- Automated vulnerability patching
- License compliance monitoring
- Supply chain attack prevention

### 3. Access Control
- Environment protection rules
- Required reviewers for production
- Branch protection rules
- Audit logging

## Future Enhancements

### Potential Improvements
1. **Advanced Monitoring** - Application performance monitoring integration
2. **Progressive Deployment** - Canary and blue-green deployment strategies  
3. **Multi-Cloud** - Support for multiple cloud providers
4. **Advanced Testing** - Visual regression testing, load testing
5. **Compliance** - SOC2, ISO27001 compliance automation

### Integration Opportunities
- **Slack/Teams** - Enhanced notification systems
- **Jira/Linear** - Issue tracking integration
- **Datadog/New Relic** - Application monitoring
- **SonarCloud** - Advanced code quality analysis

## Support

For questions or issues with the CI/CD pipeline:

1. Check the workflow logs in GitHub Actions
2. Review this documentation
3. Check the troubleshooting section
4. Create an issue in the repository

---

**Last Updated:** $(date)  
**Version:** 1.0  
**Maintainer:** DevOps Team