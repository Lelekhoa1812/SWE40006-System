# Deployment Guide

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
