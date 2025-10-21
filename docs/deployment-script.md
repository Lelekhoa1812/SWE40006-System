# Deployment Scripts Documentation

This document describes the automated deployment scripts for the Medical Messenger application.

## Overview

We provide two main scripts for deployment and debugging:

1. **`deploy.sh`** - Main deployment script with blue-green strategy
2. **`debug-deploy.sh`** - Debugging and monitoring utilities

## Main Deployment Script (`deploy.sh`)

### Features

- **Blue-Green Deployment**: Deploy to both blue and green backend environments
- **Automated Testing**: Run tests before deployment
- **Package Creation**: Automatically create deployment packages
- **Health Checks**: Verify deployments with health checks
- **Debug Mode**: Verbose output for troubleshooting
- **Flexible Options**: Deploy specific components or environments

### Usage

```bash
# Full deployment (recommended)
./deploy.sh

# Debug mode with verbose output
./deploy.sh --debug

# Deploy only backend services
./deploy.sh --backend-only

# Deploy only frontend
./deploy.sh --frontend-only

# Deploy only blue environment
./deploy.sh --blue-only

# Deploy only green environment
./deploy.sh --green-only

# Skip tests (not recommended)
./deploy.sh --skip-tests

# Skip build step
./deploy.sh --skip-build

# Show help
./deploy.sh --help
```

### Deployment Process

1. **Prerequisites Check**: Verify Azure CLI, pnpm, Node.js
2. **Testing**: Run backend and frontend tests
3. **Building**: Build applications and create packages
4. **Backend Deployment**: Deploy to blue and/or green environments
5. **Frontend Deployment**: Deploy static frontend files
6. **Post-Deployment Testing**: Verify all endpoints work
7. **Cleanup**: Remove temporary files

### Configuration

The script uses these default configurations:

```bash
RESOURCE_GROUP="rg-swe40006"
APP_SERVICE_PLAN="medmsg-plan"
BACKEND_BLUE="medmsg-blue"
BACKEND_GREEN="medmsg-green"
FRONTEND_APP="medmsg-frontend"
```

## Debug Script (`debug-deploy.sh`)

### Features

- **Resource Status**: Check Azure resources and app status
- **Health Monitoring**: Verify application health
- **Log Analysis**: Download and analyze application logs
- **Real-time Monitoring**: Monitor live application logs
- **Performance Testing**: Run performance tests
- **Deployment History**: Check deployment history

### Usage

```bash
# Check all resources and health
./debug-deploy.sh all

# Check Azure resources status
./debug-deploy.sh status

# Check application health
./debug-deploy.sh health

# Test API endpoints
./debug-deploy.sh test-apis

# Download and analyze logs
./debug-deploy.sh logs blue
./debug-deploy.sh logs green
./debug-deploy.sh logs frontend

# Monitor real-time logs
./debug-deploy.sh monitor blue
./debug-deploy.sh monitor green
./debug-deploy.sh monitor frontend

# Check deployment history
./debug-deploy.sh deployments blue
./debug-deploy.sh deployments green
./debug-deploy.sh deployments frontend

# Run performance test
./debug-deploy.sh performance https://medmsg-blue.azurewebsites.net Blue-Backend

# Show help
./debug-deploy.sh help
```

## Deployment Architecture

### Backend Deployment

The backend uses a simple Node.js server (`simple-server.js`) that provides:

- **Health Endpoint**: `/health` - Returns server status and uptime
- **Doctors API**: `/api/v1/doctors` - Returns mock doctor data
- **Error Handling**: 404 responses for unknown routes

### Frontend Deployment

The frontend is built as a static Next.js application:

- **Static Export**: Configured with `output: 'export'`
- **Static Files**: Served from the `out` directory
- **SPA Routing**: Requires proper configuration for client-side routing

## Troubleshooting

### Common Issues

1. **Frontend not serving content**:
   - Static files are deployed but may need SPA routing configuration
   - Check if `web.config` is properly configured

2. **Backend deployment fails**:
   - Check Azure App Service logs
   - Verify startup command is set correctly
   - Ensure environment variables are configured

3. **Health checks fail**:
   - Check if the application is starting correctly
   - Verify port configuration (should be 8080)
   - Check application logs for errors

### Debug Commands

```bash
# Check deployment status
./debug-deploy.sh status

# Monitor logs in real-time
./debug-deploy.sh monitor blue

# Analyze recent logs
./debug-deploy.sh logs blue

# Test API endpoints
./debug-deploy.sh test-apis
```

## CI/CD Integration

These scripts can be integrated into CI/CD pipelines:

```yaml
# Example GitHub Actions step
- name: Deploy to Azure
  run: |
    ./deploy.sh --debug
    ./debug-deploy.sh health
```

## Security Considerations

- Scripts use Azure CLI authentication
- No secrets are hardcoded in scripts
- Environment variables are managed through Azure App Service settings
- CORS is configured for specific domains

## Monitoring and Maintenance

### Regular Tasks

1. **Health Monitoring**: Use `./debug-deploy.sh health` regularly
2. **Log Analysis**: Check logs for errors and performance issues
3. **Performance Testing**: Run performance tests after deployments
4. **Resource Monitoring**: Monitor Azure resource usage

### Maintenance Commands

```bash
# Full health check
./debug-deploy.sh all

# Performance test all environments
./debug-deploy.sh performance https://medmsg-blue.azurewebsites.net Blue
./debug-deploy.sh performance https://medmsg-green.azurewebsites.net Green

# Check deployment history
./debug-deploy.sh deployments blue
./debug-deploy.sh deployments green
```

## Best Practices

1. **Always run tests**: Use `./deploy.sh` (includes tests) rather than `--skip-tests`
2. **Monitor after deployment**: Run `./debug-deploy.sh health` after each deployment
3. **Use debug mode**: Use `--debug` flag when troubleshooting
4. **Check logs**: Analyze logs when issues occur
5. **Blue-green strategy**: Deploy to green first, test, then swap to blue
6. **Rollback capability**: Keep previous deployments available for quick rollback
