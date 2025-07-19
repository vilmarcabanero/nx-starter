#!/bin/bash

# Script to run coverage and show files without 100% coverage
# Usage: ./check-coverage.sh

echo "Running test coverage..."
npm run test:coverage > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "Coverage analysis complete!"
    echo ""
    node get-coverage-json.js
else
    echo "❌ Coverage run failed. Please check your tests."
    exit 1
fi