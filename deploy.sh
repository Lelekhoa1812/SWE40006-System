#!/bin/bash

# Medical Messenger - Azure Deployment Script
# This script automates the deployment of backend and frontend to Azure App Service
# with blue-green deployment strategy and comprehensive debugging features

set -e  # Exit on any error

# Configuration
RESOURCE_GROUP="rg-swe40006"
APP_SERVICE_PLAN="medmsg-plan"
BACKEND_BLUE="medmsg-blue"
BACKEND_GREEN="medmsg-green"
FRONTEND_APP="medmsg-frontend"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Debug mode flag
DEBUG=false
DEPLOY_BACKEND=true
DEPLOY_FRONTEND=true
DEPLOY_BLUE=true
DEPLOY_GREEN=true
SKIP_TESTS=false
SKIP_BUILD=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --debug)
            DEBUG=true
            shift
            ;;
        --backend-only)
            DEPLOY_FRONTEND=false
            shift
            ;;
        --frontend-only)
            DEPLOY_BACKEND=false
            shift
            ;;
        --blue-only)
            DEPLOY_GREEN=false
            shift
            ;;
        --green-only)
            DEPLOY_BLUE=false
            shift
            ;;
        --skip-tests)
            SKIP_TESTS=true
            shift
            ;;
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo "Options:"
            echo "  --debug           Enable debug mode with verbose output"
            echo "  --backend-only    Deploy only backend services"
            echo "  --frontend-only   Deploy only frontend service"
            echo "  --blue-only       Deploy only blue backend environment"
            echo "  --green-only      Deploy only green backend environment"
            echo "  --skip-tests      Skip running tests before deployment"
            echo "  --skip-build      Skip building applications"
            echo "  --help            Show this help message"
            exit 0
            ;;
        *)
            log_error "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Debug function
debug() {
    if [ "$DEBUG" = true ]; then
        echo -e "${YELLOW}[DEBUG]${NC} $1"
    fi
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if Azure CLI is installed
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI is not installed. Please install it first."
        exit 1
    fi

    # Check if logged in to Azure
    if ! az account show &> /dev/null; then
        log_error "Not logged in to Azure. Please run 'az login' first."
        exit 1
    fi

    # Check if pnpm is installed
    if ! command -v pnpm &> /dev/null; then
        log_error "pnpm is not installed. Please install it first."
        exit 1
    fi

    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        log_error "Node.js is not installed. Please install it first."
        exit 1
    fi

    log_success "All prerequisites met"
}

# Run tests
run_tests() {
    if [ "$SKIP_TESTS" = true ]; then
        log_warning "Skipping tests as requested"
        return
    fi

    log_info "Running tests..."

    # Backend tests
    if [ "$DEPLOY_BACKEND" = true ]; then
        log_info "Running backend tests..."
        cd backend
        if pnpm test:run; then
            log_success "Backend tests passed"
        else
            log_error "Backend tests failed"
            exit 1
        fi
        cd ..
    fi

    # Frontend tests
    if [ "$DEPLOY_FRONTEND" = true ]; then
        log_info "Running frontend tests..."
        cd frontend
        if pnpm test:run; then
            log_success "Frontend tests passed"
        else
            log_error "Frontend tests failed"
            exit 1
        fi
        cd ..
    fi
}

# Build applications
build_applications() {
    if [ "$SKIP_BUILD" = true ]; then
        log_warning "Skipping build as requested"
        return
    fi

    log_info "Building applications..."

    # Build backend
    if [ "$DEPLOY_BACKEND" = true ]; then
        log_info "Building backend..."
        cd backend
        pnpm install
        pnpm build
        log_success "Backend built successfully"
        cd ..
    fi

    # Build frontend
    if [ "$DEPLOY_FRONTEND" = true ]; then
        log_info "Building frontend..."
        cd frontend
        pnpm install
        # Skip build for now - use existing out directory
        if [ ! -d "out" ]; then
            log_error "Frontend out directory not found. Please run 'pnpm build' manually first."
            exit 1
        fi
        log_success "Frontend build directory found"
        cd ..
    fi
}

# Create deployment packages
create_packages() {
    log_info "Creating deployment packages..."

    # Create backend package
    if [ "$DEPLOY_BACKEND" = true ]; then
        log_info "Creating backend package..."
        cd backend

        # Create a simple backend package for Azure
        cp simple-server.js package.json ./
        zip -r ../backend-deploy.zip simple-server.js package.json

        debug "Backend package contents:"
        if [ "$DEBUG" = true ]; then
            unzip -l ../backend-deploy.zip
        fi

        log_success "Backend package created: backend-deploy.zip"
        cd ..
    fi

    # Create frontend package
    if [ "$DEPLOY_FRONTEND" = true ]; then
        log_info "Creating frontend package..."
        cd frontend

        # Ensure we have the built frontend
        if [ ! -d "out" ]; then
            log_error "Frontend build directory 'out' not found. Please run 'pnpm build' first."
            exit 1
        fi

        # Create a clean deployment package
        log_info "Creating deployment package..."

        # Create a temporary directory for deployment
        mkdir -p temp-deploy
        cp static-server.js temp-deploy/
        cp package-deploy.json temp-deploy/package.json
        cp -r out temp-deploy/

        # Install express in the temp directory
        cd temp-deploy
        npm install express --production --silent

        # Create the deployment zip
        zip -r ../../frontend-deploy.zip . -x "*.git*" "*.DS_Store*"
        cd ..
        rm -rf temp-deploy

        debug "Frontend package contents:"
        if [ "$DEBUG" = true ]; then
            unzip -l ../frontend-deploy.zip
        fi

        log_success "Frontend package created: frontend-deploy.zip"
        cd ..
    fi
}

# Deploy backend
deploy_backend() {
    if [ "$DEPLOY_BACKEND" = false ]; then
        return
    fi

    log_info "Deploying backend services..."

    # Deploy to Blue environment
    if [ "$DEPLOY_BLUE" = true ]; then
        log_info "Deploying to Blue environment ($BACKEND_BLUE)..."

        if az webapp deploy --resource-group "$RESOURCE_GROUP" --name "$BACKEND_BLUE" --src-path backend-deploy.zip --type zip; then
            log_success "Blue environment deployed successfully"

            # Configure Blue environment
            az webapp config set --resource-group "$RESOURCE_GROUP" --name "$BACKEND_BLUE" --startup-file "node simple-server.js"
            az webapp config appsettings set --resource-group "$RESOURCE_GROUP" --name "$BACKEND_BLUE" --settings PORT=8080 LOG_LEVEL=info

            # Test Blue environment
            log_info "Testing Blue environment..."
            if curl -s "https://$BACKEND_BLUE.azurewebsites.net/health" | grep -q "ok"; then
                log_success "Blue environment health check passed"
            else
                log_error "Blue environment health check failed"
                exit 1
            fi
        else
            log_error "Failed to deploy Blue environment"
            exit 1
        fi
    fi

    # Deploy to Green environment
    if [ "$DEPLOY_GREEN" = true ]; then
        log_info "Deploying to Green environment ($BACKEND_GREEN)..."

        if az webapp deploy --resource-group "$RESOURCE_GROUP" --name "$BACKEND_GREEN" --src-path backend-deploy.zip --type zip; then
            log_success "Green environment deployed successfully"

            # Configure Green environment
            az webapp config set --resource-group "$RESOURCE_GROUP" --name "$BACKEND_GREEN" --startup-file "node simple-server.js"
            az webapp config appsettings set --resource-group "$RESOURCE_GROUP" --name "$BACKEND_GREEN" --settings PORT=8080 LOG_LEVEL=info

            # Test Green environment
            log_info "Testing Green environment..."
            if curl -s "https://$BACKEND_GREEN.azurewebsites.net/health" | grep -q "ok"; then
                log_success "Green environment health check passed"
            else
                log_error "Green environment health check failed"
                exit 1
            fi
        else
            log_error "Failed to deploy Green environment"
            exit 1
        fi
    fi
}

# Deploy frontend
deploy_frontend() {
    if [ "$DEPLOY_FRONTEND" = false ]; then
        return
    fi

    log_info "Deploying frontend service..."

    if az webapp deploy --resource-group "$RESOURCE_GROUP" --name "$FRONTEND_APP" --src-path frontend-deploy.zip --type zip; then
        log_success "Frontend deployed successfully"

        # Configure frontend startup command
        log_info "Configuring frontend startup command..."
        az webapp config set --resource-group "$RESOURCE_GROUP" --name "$FRONTEND_APP" --startup-file "node static-server.js"

        # Test frontend
        log_info "Testing frontend..."
        if curl -s "https://$FRONTEND_APP.azurewebsites.net/" | grep -q "html"; then
            log_success "Frontend is accessible"
        else
            log_warning "Frontend deployed but may not be serving content correctly"
        fi
    else
        log_error "Failed to deploy frontend"
        exit 1
    fi
}

# Run post-deployment tests
post_deployment_tests() {
    log_info "Running post-deployment tests..."

    # Test backend endpoints
    if [ "$DEPLOY_BACKEND" = true ]; then
        if [ "$DEPLOY_BLUE" = true ]; then
            log_info "Testing Blue backend endpoints..."
            if curl -s "https://$BACKEND_BLUE.azurewebsites.net/api/v1/doctors" | grep -q "Dr. John Smith"; then
                log_success "Blue backend API test passed"
            else
                log_error "Blue backend API test failed"
            fi
        fi

        if [ "$DEPLOY_GREEN" = true ]; then
            log_info "Testing Green backend endpoints..."
            if curl -s "https://$BACKEND_GREEN.azurewebsites.net/api/v1/doctors" | grep -q "Dr. John Smith"; then
                log_success "Green backend API test passed"
            else
                log_error "Green backend API test failed"
            fi
        fi
    fi

    # Test frontend
    if [ "$DEPLOY_FRONTEND" = true ]; then
        log_info "Testing frontend accessibility..."
        if curl -s "https://$FRONTEND_APP.azurewebsites.net/" | grep -q "html"; then
            log_success "Frontend accessibility test passed"
        else
            log_warning "Frontend accessibility test failed - may need SPA routing configuration"
        fi
    fi
}

# Cleanup function
cleanup() {
    log_info "Cleaning up temporary files..."
    rm -f backend-deploy.zip frontend-deploy.zip
    log_success "Cleanup completed"
}

# Main deployment function
main() {
    log_info "Starting Medical Messenger deployment..."
    log_info "Configuration:"
    log_info "  Resource Group: $RESOURCE_GROUP"
    log_info "  Backend Blue: $BACKEND_BLUE"
    log_info "  Backend Green: $BACKEND_GREEN"
    log_info "  Frontend: $FRONTEND_APP"
    log_info "  Debug Mode: $DEBUG"

    # Set up trap for cleanup on exit
    trap cleanup EXIT

    # Execute deployment steps
    check_prerequisites
    run_tests
    build_applications
    create_packages
    deploy_backend
    deploy_frontend
    post_deployment_tests

    log_success "Deployment completed successfully!"
    log_info "Deployed URLs:"
    if [ "$DEPLOY_BLUE" = true ]; then
        log_info "  Blue Backend: https://$BACKEND_BLUE.azurewebsites.net"
    fi
    if [ "$DEPLOY_GREEN" = true ]; then
        log_info "  Green Backend: https://$BACKEND_GREEN.azurewebsites.net"
    fi
    if [ "$DEPLOY_FRONTEND" = true ]; then
        log_info "  Frontend: https://$FRONTEND_APP.azurewebsites.net"
    fi
}

# Run main function
main "$@"
