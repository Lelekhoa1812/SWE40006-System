#!/bin/bash

# Load test script for backend API
# Requires: npm install -g autocannon

set -e

BACKEND_URL=${BACKEND_URL:-"https://medmsg-blue.azurewebsites.net"}
ENDPOINT="/api/v1/doctors"

echo "🚀 Starting load test against $BACKEND_URL$ENDPOINT"
echo "Press Ctrl+C to stop"

# Check if autocannon is installed
if ! command -v autocannon &> /dev/null; then
    echo "❌ autocannon not found. Install with: npm install -g autocannon"
    exit 1
fi

# Run load test
autocannon \
  --connections 10 \
  --pipelining 1 \
  --duration 30 \
  --method GET \
  "$BACKEND_URL$ENDPOINT"

echo "✅ Load test completed"
