# Deployment Guide

## Automated Deployment Scripts

We provide automated deployment scripts for easy and reproducible deployments:

### Quick Deployment

```bash
# Full deployment (recommended)
./deploy.sh

# Debug mode with verbose output
./deploy.sh --debug

# Deploy specific components
./deploy.sh --backend-only
./deploy.sh --frontend-only
./deploy.sh --blue-only
./deploy.sh --green-only
```

### Testing and Monitoring

```bash
# Check application health
./debug-deploy.sh health

# Test API endpoints
./debug-deploy.sh test-apis

# Monitor logs
./debug-deploy.sh monitor blue
./debug-deploy.sh logs green

# Run performance tests
./debug-deploy.sh performance https://medmsg-blue.azurewebsites.net Blue-Backend

# Check deployment status
./debug-deploy.sh status
```

For detailed information about deployment scripts, see [DEPLOYMENT-SCRIPTS.md](./DEPLOYMENT-SCRIPTS.md).

## Blue-Green Deployment Strategy

### Overview

Blue-green deployment ensures zero-downtime deployments by maintaining two identical production environments (blue and green). Only one environment is live at a time.

### Prerequisites

- Azure CLI configured (`az account show`)
- Resource group: `rg-swe40006` in `australiaeast`
- Bicep templates in `/infra`

### Deployment Steps

#### 1. Build and Package

```bash
# Build frontend
cd frontend && pnpm build

# Build backend
cd backend && pnpm build
```

#### 2. Deploy Infrastructure

```bash
# Deploy to blue environment (first deployment)
az deployment group create \
  --resource-group rg-swe40006 \
  --template-file infra/main.bicep \
  --parameters @infra/parameters/dev.parameters.json \
  --parameters appName=medmsg-blue

# Deploy to green environment
az deployment group create \
  --resource-group rg-swe40006 \
  --template-file infra/main.bicep \
  --parameters @infra/parameters/dev.parameters.json \
  --parameters appName=medmsg-green
```

#### 3. Deploy Applications

```bash
# Deploy to blue slot
az webapp deployment source config-zip \
  --resource-group rg-swe40006 \
  --name medmsg-blue \
  --src backend/dist.zip

# Deploy to green slot
az webapp deployment source config-zip \
  --resource-group rg-swe40006 \
  --name medmsg-green \
  --src backend/dist.zip
```

#### 4. Switch Traffic

```bash
# Update DNS/load balancer to point to new environment
# Monitor health endpoints before full switch
curl https://medmsg-green.azurewebsites.net/health
```

### Rollback Strategy

- Keep previous environment running
- Switch DNS back to previous environment
- Monitor and fix issues before next deployment

### Environment Variables

- Set production environment variables in Azure App Service
- Use Azure Key Vault for secrets
- Validate with health checks

### Monitoring

- Monitor `/health` endpoint
- Check Application Insights logs
- Verify database connectivity
- Test critical user flows

## Reproducible Deployment Commands

### Infrastructure Setup

```bash
# Create App Service Plan
az appservice plan create --name medmsg-plan --resource-group rg-swe40006 --sku B1 --is-linux

# Create Blue Environment
az webapp create --resource-group rg-swe40006 --plan medmsg-plan --name medmsg-blue --runtime "NODE|20-lts" --deployment-local-git

# Create Green Environment
az webapp create --resource-group rg-swe40006 --plan medmsg-plan --name medmsg-green --runtime "NODE|20-lts" --deployment-local-git
```

### Application Deployment

```bash
# Build and package backend
cd backend && zip simple-backend.zip simple-server.js

# Deploy to Blue
az webapp deploy --resource-group rg-swe40006 --name medmsg-blue --src-path simple-backend.zip --type zip

# Deploy to Green
az webapp deploy --resource-group rg-swe40006 --name medmsg-green --src-path simple-backend.zip --type zip
```

### Configuration

```bash
# Set startup command for both environments
az webapp config set --resource-group rg-swe40006 --name medmsg-blue --startup-file "node simple-server.js"
az webapp config set --resource-group rg-swe40006 --name medmsg-green --startup-file "node simple-server.js"

# Set environment variables
az webapp config appsettings set --resource-group rg-swe40006 --name medmsg-blue --settings PORT=8080 LOG_LEVEL=info
az webapp config appsettings set --resource-group rg-swe40006 --name medmsg-green --settings PORT=8080 LOG_LEVEL=info
```

### Testing Commands

```bash
# Test Blue Environment
curl -s https://medmsg-blue.azurewebsites.net/health
curl -s https://medmsg-blue.azurewebsites.net/api/v1/doctors

# Test Green Environment
curl -s https://medmsg-green.azurewebsites.net/health
curl -s https://medmsg-green.azurewebsites.net/api/v1/doctors

# Run Load Tests
./scripts/load-test.sh
```

## CI/CD Excellence

Our deployment strategy exemplifies CI/CD best practices:

- **Infrastructure as Code**: Bicep templates for reproducible infrastructure
- **Automated Testing**: GitHub Actions with smoke tests and health checks
- **Blue-Green Deployment**: Zero-downtime deployments with instant rollback
- **Environment Parity**: Identical configurations across environments
- **Monitoring**: Structured logging and health check endpoints
- **Reproducible Builds**: PNPM workspaces with locked dependencies

## Current Deployment Status

- **Backend Blue**: ✅ Deployed and operational at `https://medmsg-blue.azurewebsites.net`
- **Backend Green**: ✅ Deployed and operational at `https://medmsg-green.azurewebsites.net`
- **Frontend**: ⚠️ Deployed at `https://medmsg-frontend-static.azurewebsites.net` (static files deployed, but serving default Azure page)

## Test Results

For detailed test results and validation, see [deployment-test.md](./deployment-test.md).
