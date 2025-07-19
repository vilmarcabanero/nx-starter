#!/bin/bash

# API Integration Validation Script
# This script demonstrates switching between local and API data sources

echo "🧪 Todo App API Integration Validation"
echo "=====================================\n"

# Test 1: Local Storage (Default)
echo "📝 Test 1: Using Local Dexie.js Storage"
echo "VITE_USE_API_BACKEND=false" > .env.local
npm test -- --run src/core/infrastructure/todo/persistence/TodoRepository.spec.ts --reporter=basic
rm .env.local

echo "\n"

# Test 2: API Repository Unit Tests
echo "📝 Test 2: API Repository Unit Tests (Mocked)"
npm test -- --run src/core/infrastructure/todo/persistence/ApiTodoRepository.spec.ts --reporter=basic

echo "\n"

# Test 3: Check if server is available for integration test
echo "📝 Test 3: Checking API Server Availability"
if curl -s http://localhost:4000/api/health > /dev/null 2>&1; then
    echo "✅ API Server is running on port 4000"
    echo "🔗 Running integration tests with real API..."
    echo "VITE_USE_API_BACKEND=true" > .env.local
    npm test -- --run src/core/infrastructure/todo/persistence/ApiTodoRepository.integration.spec.ts --reporter=basic
    rm .env.local
else
    echo "⚠️  API Server not running on port 4000"
    echo "💡 To test API integration, run: cd server && npm run dev"
fi

echo "\n"
echo "✅ API Integration validation complete!"
echo "📖 See API_INTEGRATION.md for detailed documentation"