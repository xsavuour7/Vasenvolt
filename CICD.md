# CI/CD Pipeline Documentation

## Overview

The Vasenvolt project implements a comprehensive CI/CD pipeline using GitHub Actions that automates testing, linting, security scanning, and deployment to staging environments. The pipeline is designed to ensure code quality and provide safe deployment practices.

## Pipeline Structure

### 1. Automatic Triggers
- **Push to main/develop**: Triggers linting and testing
- **Pull Requests**: Ensures code quality before merging

### 2. Manual Triggers
- **Staging Deployment**: Manual deployment to staging environment
- **Production Deployment**: Manual deployment with additional security measures

## Workflow Jobs

### Linting and Code Quality

#### Backend Linting (`lint-backend`)
- **Python Version**: 3.11
- **Tools**:
  - **Black**: Code formatting check
  - **Flake8**: Linting with strict error checking
  - **isort**: Import sorting validation
- **Dependencies**: Installed from `backend/requirements.txt`

#### Frontend Linting (`lint-frontend`)
- **Node.js Version**: 18
- **Tools**:
  - **ESLint**: JavaScript/TypeScript linting
  - **Prettier**: Code formatting check
- **Dependencies**: Installed from `frontend/package-lock.json`

### Testing

#### Backend Testing (`test-backend`)
- **Dependencies**: `lint-backend`
- **Services**:
  - **PostgreSQL 15**: Test database
  - **Redis 7**: Cache service
- **Test Environment**: Creates `.env.test` with test configuration
- **Coverage**: Generates XML and terminal reports
- **Upload**: Sends coverage to Codecov

#### Frontend Testing (`test-frontend`)
- **Dependencies**: `lint-frontend`
- **Tests**: Runs Jest tests with coverage
- **Build**: Ensures application builds successfully
- **Coverage**: Uploads to Codecov

### Security

#### Security Audit (`security-audit`)
- **npm audit**: Checks for known vulnerabilities
- **Snyk**: Advanced security scanning
- **Threshold**: High severity vulnerabilities only

### Deployment

#### Backend Staging (`deploy-backend-staging`)
- **Trigger**: Manual workflow dispatch
- **Environment**: Staging
- **Prerequisites**: All tests must pass
- **Process**:
  1. Creates staging environment file
  2. Runs database migrations
  3. Deploys via SSH to staging server
  4. Restarts backend service

#### Frontend Staging (`deploy-frontend-staging`)
- **Trigger**: Manual workflow dispatch
- **Environment**: Staging
- **Prerequisites**: All tests must pass
- **Process**:
  1. Builds production bundle
  2. Deploys to Vercel
  3. Configures staging domain aliases

#### Production Deployment (`deploy-production`)
- **Trigger**: Manual workflow dispatch
- **Environment**: Production
- **Status**: Placeholder for future implementation
- **Security**: Requires additional approval measures

## Environment Configuration

### Required Secrets

#### Staging Deployment
```bash
STAGING_HOST=your-staging-server.com
STAGING_USER=deploy-user
STAGING_SSH_KEY=private-ssh-key
BACKEND_STAGING_URL=https://api-staging.vasenvolt.com
FRONTEND_STAGING_URL=https://staging.vasenvolt.com
```

#### Vercel Deployment
```bash
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
```

#### Security Scanning
```bash
SNYK_TOKEN=your-snyk-token
```

### Environment Files

The pipeline automatically creates environment-specific files:
- **Test**: `.env.test` with local database and mock services
- **Staging**: `.env.staging` based on production configuration
- **Production**: Uses existing `.env.production`

## Usage

### Automatic Pipeline

The pipeline runs automatically on:
- Every push to `main` or `develop` branches
- Every pull request to `main` or `develop` branches

### Manual Deployment

#### Deploy to Staging
1. Go to **Actions** tab in GitHub
2. Select **CI/CD Pipeline** workflow
3. Click **Run workflow**
4. Choose **staging** environment
5. Select components to deploy (backend/frontend)
6. Click **Run workflow**

#### Deploy to Production
1. Follow staging deployment steps
2. Choose **production** environment
3. Additional security measures will be enforced

## Monitoring and Notifications

### Coverage Reports
- **Backend**: Uploaded to Codecov with `backend` flag
- **Frontend**: Uploaded to Codecov with `frontend` flag
- **Reports**: Available in GitHub Actions artifacts

### Deployment Status
- **Success**: All jobs complete successfully
- **Failure**: Individual job failures are reported
- **Notifications**: Final status reported in `notify-deployment` job

## Best Practices

### Code Quality
- All code must pass linting before testing
- Tests must pass before deployment
- Coverage reports are generated for quality metrics

### Security
- Security scans run on every pipeline execution
- Vulnerabilities block deployment
- Staging deployment validates production readiness

### Deployment Safety
- Staging deployment requires manual approval
- Production deployment has additional security measures
- Database migrations run automatically
- Service restarts are handled gracefully

## Troubleshooting

### Common Issues

#### Linting Failures
- Run `black .` locally to fix formatting
- Run `isort .` to fix import sorting
- Check Flake8 output for specific issues

#### Test Failures
- Ensure local environment matches CI
- Check database connection settings
- Verify Redis service availability

#### Deployment Failures
- Check SSH key permissions
- Verify staging server access
- Ensure environment variables are set

### Local Testing

#### Backend
```bash
cd backend
# Install dependencies
pip install -r requirements.txt

# Run linting
black --check .
flake8 .
isort --check-only .

# Run tests
python -m pytest --cov=app
```

#### Frontend
```bash
cd frontend
# Install dependencies
npm ci

# Run linting
npm run lint
npx prettier --check .

# Run tests
npm test -- --coverage --watchAll=false

# Build
npm run build
```

## Future Enhancements

### Planned Features
- **Slack/Discord Notifications**: Deployment status updates
- **Performance Testing**: Load testing before deployment
- **Rollback Capability**: Automatic rollback on failure
- **Blue-Green Deployment**: Zero-downtime deployments
- **Infrastructure as Code**: Terraform/CloudFormation integration

### Production Deployment
- **Approval Workflow**: Required reviewer approval
- **Canary Deployments**: Gradual rollout
- **Health Checks**: Post-deployment validation
- **Monitoring Integration**: Prometheus/Grafana alerts

## Support

For issues with the CI/CD pipeline:
1. Check GitHub Actions logs for detailed error messages
2. Verify environment variables and secrets
3. Test locally to reproduce issues
4. Create GitHub issue with relevant logs and context
