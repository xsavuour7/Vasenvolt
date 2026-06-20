#!/bin/bash

# Check API health
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" https://staging.vasenvoltai.com/health)

if [ $HEALTH -eq 200 ]; then
    echo "API is healthy"
else
    echo "API health check failed: $HEALTH"
    # Send notification or restart service
    sudo systemctl restart vasenvolt-backend
fi
