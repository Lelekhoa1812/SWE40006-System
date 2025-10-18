#!/bin/bash

# Medical Messenger - Deployment Debugging and Monitoring Script
# This script provides debugging tools and monitoring capabilities for Azure deployments

set -e

# Configuration
RESOURCE_GROUP="rg-swe40006"
BACKEND_BLUE="medmsg-blue"
BACKEND_GREEN="medmsg-green"
FRONTEND_APP="medmsg-frontend-static"

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

# Check Azure resources status
check_resources() {
    log_info "Checking Azure resources status..."

    echo "=== App Service Plan ==="
    az appservice plan show --resource-group "$RESOURCE_GROUP" --name "medmsg-plan" --query "{name:name,sku:sku.name,status:status}" -o table

    echo -e "\n=== Backend Apps ==="
    az webapp list --resource-group "$RESOURCE_GROUP" --query "[?contains(name, 'medmsg')].{name:name,state:state,defaultHostName:defaultHostName}" -o table

    echo -e "\n=== Resource Group Resources ==="
    az resource list --resource-group "$RESOURCE_GROUP" --query "[].{name:name,type:type,location:location}" -o table
}

# Check application health
check_health() {
    log_info "Checking application health..."

    echo "=== Backend Health Checks ==="

    # Blue environment
    echo -n "Blue Backend: "
    if curl -s "https://$BACKEND_BLUE.azurewebsites.net/health" | grep -q "ok"; then
        log_success "Healthy"
        curl -s "https://$BACKEND_BLUE.azurewebsites.net/health" | jq . 2>/dev/null || curl -s "https://$BACKEND_BLUE.azurewebsites.net/health"
    else
        log_error "Unhealthy"
    fi

    # Green environment
    echo -n "Green Backend: "
    if curl -s "https://$BACKEND_GREEN.azurewebsites.net/health" | grep -q "ok"; then
        log_success "Healthy"
        curl -s "https://$BACKEND_GREEN.azurewebsites.net/health" | jq . 2>/dev/null || curl -s "https://$BACKEND_GREEN.azurewebsites.net/health"
    else
        log_error "Unhealthy"
    fi

    echo -e "\n=== Frontend Health Check ==="
    echo -n "Frontend: "
    if curl -s "https://$FRONTEND_APP.azurewebsites.net/" | grep -q "html"; then
        log_success "Accessible"
    else
        log_warning "May have issues"
    fi
}

# Test API endpoints
test_apis() {
    log_info "Testing API endpoints..."

    echo "=== Blue Backend API Test ==="
    echo "GET /api/v1/doctors"
    curl -s "https://$BACKEND_BLUE.azurewebsites.net/api/v1/doctors" | jq . 2>/dev/null || curl -s "https://$BACKEND_BLUE.azurewebsites.net/api/v1/doctors"

    echo -e "\n=== Green Backend API Test ==="
    echo "GET /api/v1/doctors"
    curl -s "https://$BACKEND_GREEN.azurewebsites.net/api/v1/doctors" | jq . 2>/dev/null || curl -s "https://$BACKEND_GREEN.azurewebsites.net/api/v1/doctors"
}

# Download and analyze logs
analyze_logs() {
    local app_name=$1
    local log_file="${app_name}-logs.zip"

    log_info "Downloading logs for $app_name..."

    if az webapp log download --resource-group "$RESOURCE_GROUP" --name "$app_name" --log-file "$log_file"; then
        log_success "Logs downloaded: $log_file"

        # Extract and analyze logs
        if [ -f "$log_file" ]; then
            unzip -o "$log_file" -d "${app_name}-logs" 2>/dev/null || true

            echo "=== Recent Error Logs ==="
            find "${app_name}-logs" -name "*.log" -exec grep -l -i "error\|exception\|failed" {} \; 2>/dev/null | head -3 | while read logfile; do
                echo "--- $logfile ---"
                tail -20 "$logfile" 2>/dev/null || echo "Could not read log file"
                echo
            done

            echo "=== Recent Application Logs ==="
            find "${app_name}-logs" -name "*.log" -exec tail -10 {} \; 2>/dev/null | head -50

            # Cleanup
            rm -rf "${app_name}-logs"
        fi
    else
        log_error "Failed to download logs for $app_name"
    fi
}

# Monitor real-time logs
monitor_logs() {
    local app_name=$1

    log_info "Starting real-time log monitoring for $app_name..."
    log_info "Press Ctrl+C to stop monitoring"

    az webapp log tail --resource-group "$RESOURCE_GROUP" --name "$app_name"
}

# Check deployment history
check_deployments() {
    local app_name=$1

    log_info "Checking deployment history for $app_name..."

    az webapp deployment list --resource-group "$RESOURCE_GROUP" --name "$app_name" --query "[].{id:id,status:status,startTime:startTime,endTime:endTime,message:message}" -o table
}

# Performance test
performance_test() {
    local url=$1
    local name=$2

    log_info "Running performance test for $name..."

    if command -v autocannon &> /dev/null; then
        echo "Running autocannon test..."
        autocannon -c 5 -d 10 "$url/health"
    else
        echo "autocannon not installed, running basic curl test..."
        for i in {1..5}; do
            start_time=$(date +%s%N)
            curl -s "$url/health" > /dev/null
            end_time=$(date +%s%N)
            duration=$(( (end_time - start_time) / 1000000 ))
            echo "Request $i: ${duration}ms"
        done
    fi
}

# Show usage
show_usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  status              Check Azure resources status"
    echo "  health              Check application health"
    echo "  test-apis           Test API endpoints"
    echo "  logs [app-name]     Download and analyze logs for specific app"
    echo "  monitor [app-name]  Monitor real-time logs for specific app"
    echo "  deployments [app-name] Check deployment history for specific app"
    echo "  performance [url] [name] Run performance test"
    echo "  all                 Run all checks"
    echo ""
    echo "App names:"
    echo "  blue                Backend blue environment"
    echo "  green               Backend green environment"
    echo "  frontend            Frontend application"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 logs blue"
    echo "  $0 monitor green"
    echo "  $0 performance https://medmsg-blue.azurewebsites.net Blue-Backend"
}

# Main function
main() {
    case "${1:-all}" in
        "status")
            check_resources
            ;;
        "health")
            check_health
            ;;
        "test-apis")
            test_apis
            ;;
        "logs")
            case "$2" in
                "blue")
                    analyze_logs "$BACKEND_BLUE"
                    ;;
                "green")
                    analyze_logs "$BACKEND_GREEN"
                    ;;
                "frontend")
                    analyze_logs "$FRONTEND_APP"
                    ;;
                *)
                    log_error "Please specify app name: blue, green, or frontend"
                    exit 1
                    ;;
            esac
            ;;
        "monitor")
            case "$2" in
                "blue")
                    monitor_logs "$BACKEND_BLUE"
                    ;;
                "green")
                    monitor_logs "$BACKEND_GREEN"
                    ;;
                "frontend")
                    monitor_logs "$FRONTEND_APP"
                    ;;
                *)
                    log_error "Please specify app name: blue, green, or frontend"
                    exit 1
                    ;;
            esac
            ;;
        "deployments")
            case "$2" in
                "blue")
                    check_deployments "$BACKEND_BLUE"
                    ;;
                "green")
                    check_deployments "$BACKEND_GREEN"
                    ;;
                "frontend")
                    check_deployments "$FRONTEND_APP"
                    ;;
                *)
                    log_error "Please specify app name: blue, green, or frontend"
                    exit 1
                    ;;
            esac
            ;;
        "performance")
            if [ -z "$2" ] || [ -z "$3" ]; then
                log_error "Usage: $0 performance <url> <name>"
                exit 1
            fi
            performance_test "$2" "$3"
            ;;
        "all")
            check_resources
            echo -e "\n" && check_health
            echo -e "\n" && test_apis
            ;;
        "help"|"--help"|"-h")
            show_usage
            ;;
        *)
            log_error "Unknown command: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
