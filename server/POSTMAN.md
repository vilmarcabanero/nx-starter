# Task App API - Postman Collection

This Postman collection provides comprehensive testing for the Task App Express.js API server with Clean Architecture implementation.

## 📦 Collection Contents

### Folders Structure

1. **Server Info** - Basic server endpoints
   - GET / (Server information)
   - GET /api/health (Health check)

2. **Todos - Read Operations** - GET endpoints for retrieving todos
   - Get All Todos (Happy Path)
   - Get Active Todos (Happy Path)
   - Get Completed Todos (Happy Path)
   - Get Todo Statistics (Happy Path)
   - Get Todo by ID (Happy Path)
   - Get Todo by ID (Not Found Error)

3. **Todos - Create Operations** - POST endpoints for creating todos
   - Create Todo (Minimal Fields - Happy Path)
   - Create Todo (All Fields - Happy Path)
   - Create Todo (Missing Title - Validation Error)
   - Create Todo (Title Too Short - Validation Error)
   - Create Todo (Invalid Priority - Validation Error)

4. **Todos - Update Operations** - PUT and PATCH endpoints for updating todos
   - Update Todo (Full Update - Happy Path)
   - Update Todo (Partial Update - Happy Path)
   - Update Todo (Not Found Error)
   - Update Todo (Validation Error)
   - Toggle Todo Completion (Happy Path)
   - Toggle Todo Completion (Not Found Error)

5. **Todos - Delete Operations** - DELETE endpoints for removing todos
   - Delete Todo (Happy Path)
   - Delete Todo (Not Found Error)

6. **Error Scenarios** - Additional error handling tests
   - 404 Unknown Route
   - Rate Limit Test
   - Invalid JSON Body

## 🚀 Quick Setup

### 1. Import Collection and Environment

**Option A: Import from Files**
1. Open Postman
2. Click "Import" button
3. Select `postman-collection.json` and `postman-environment.json`
4. Select the "Task App Development Environment" from the environment dropdown

**Option B: Import from URL (if hosted)**
1. Copy the raw URL of the collection file
2. In Postman, click "Import" → "Link" 
3. Paste the URL and import

### 2. Start the API Server

```bash
cd server
npm install
npm run dev
```

The server will start on `http://localhost:3001` by default.

### 3. Configure Environment Variables

The collection uses environment variables for flexibility:

- `baseUrl`: API server base URL (default: `http://localhost:3001`)
- `sampleTodoId`: Sample todo ID for testing (default: `todo-123`)

**To update these:**
1. Click the environment dropdown → "Task App Development Environment"
2. Click the eye icon to view/edit variables
3. Update `baseUrl` if your server runs on a different port
4. Update `sampleTodoId` with actual IDs from your create requests

## 📋 Usage Instructions

### Testing Workflow

1. **Start with Server Info**
   - Run "Get Server Info" to verify the server is running
   - Run "Health Check" to confirm API availability

2. **Test CRUD Operations**
   - **Create**: Use "Create Todo" requests to add new todos
   - **Read**: Use various GET requests to retrieve todos
   - **Update**: Use PUT/PATCH requests to modify todos
   - **Delete**: Use DELETE requests to remove todos

3. **Test Error Scenarios**
   - Run validation error tests to verify input validation
   - Test not found scenarios with non-existent IDs
   - Test edge cases and error handling

### Working with Dynamic Data

**Getting Real Todo IDs:**
1. Run "Create Todo - Happy Path (Minimal)" request
2. Copy the `id` from the response
3. Update the `sampleTodoId` environment variable
4. Now all requests using `{{sampleTodoId}}` will use the real ID

**Chaining Requests:**
- Use Postman's "Tests" tab to extract values from responses
- Set environment variables dynamically for use in subsequent requests

Example test script:
```javascript
// Extract todo ID from create response
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("sampleTodoId", response.data.id);
}
```

## 🔍 API Endpoint Reference

### Base URL
```
http://localhost:3001
```

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Server information |
| GET | `/api/health` | Health check |
| GET | `/api/todos` | Get all todos |
| GET | `/api/todos/active` | Get active todos |
| GET | `/api/todos/completed` | Get completed todos |
| GET | `/api/todos/stats` | Get todo statistics |
| GET | `/api/todos/:id` | Get todo by ID |
| POST | `/api/todos` | Create new todo |
| PUT | `/api/todos/:id` | Update todo |
| PATCH | `/api/todos/:id/toggle` | Toggle todo completion |
| DELETE | `/api/todos/:id` | Delete todo |

### Request/Response Formats

**Create Todo Request:**
```json
{
  "title": "Todo title (required, 2-255 chars)",
  "priority": "low|medium|high (optional)",
  "dueDate": "2024-01-25T18:00:00.000Z (optional, ISO datetime)"
}
```

**Update Todo Request:**
```json
{
  "title": "Updated title (optional)",
  "completed": true, // optional boolean
  "priority": "high", // optional: low|medium|high
  "dueDate": "2024-01-30T12:00:00.000Z" // optional ISO datetime
}
```

**Todo Response:**
```json
{
  "success": true,
  "data": {
    "id": "todo-123",
    "title": "Todo title",
    "completed": false,
    "priority": "medium",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "dueDate": "2024-01-25T18:00:00.000Z" // optional
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": [] // Optional validation details for Zod errors
}
```

## 🧪 Testing Scenarios

### Happy Path Tests
- ✅ All CRUD operations with valid data
- ✅ Different todo priorities (low, medium, high)
- ✅ Optional fields (dueDate)
- ✅ Partial updates
- ✅ Toggle completion status

### Error Handling Tests
- ❌ Missing required fields
- ❌ Invalid data types
- ❌ Invalid enum values
- ❌ String length validation
- ❌ Non-existent resource access
- ❌ Malformed JSON requests
- ❌ Unknown API endpoints

### Security & Performance Tests
- 🔒 Rate limiting (100 requests per 15 minutes)
- 🔒 CORS headers
- 🔒 Input validation
- 🔒 Error message consistency

## 🔧 Environment Configuration

### Development Environment
```json
{
  "baseUrl": "http://localhost:3001",
  "sampleTodoId": "todo-123"
}
```

### Production Environment (Example)
```json
{
  "baseUrl": "https://api.taskapp.com",
  "sampleTodoId": "production-todo-id"
}
```

### Testing Environment (Example)
```json
{
  "baseUrl": "http://localhost:3002",
  "sampleTodoId": "test-todo-id"
}
```

## 📝 Collection Features

### Comprehensive Test Coverage
- **30+ requests** covering all API endpoints
- **Multiple scenarios** per endpoint (happy path + error cases)
- **Realistic sample data** for testing
- **Detailed descriptions** for each request

### Production-Ready Testing
- **Environment variables** for different deployment stages
- **Error scenario coverage** for robust testing
- **Request/response examples** for documentation
- **Rate limiting tests** for performance validation

### Developer Experience
- **Clear folder organization** by operation type
- **Descriptive request names** indicating test scenarios
- **Sample responses** for expected output
- **Comprehensive documentation** for usage

## 🎯 Benefits

1. **Complete API Coverage**: Every endpoint and scenario is covered
2. **Error Testing**: Comprehensive validation and error handling tests
3. **Environment Flexibility**: Easy switching between dev/staging/prod
4. **Documentation**: Self-documenting API with examples
5. **Team Collaboration**: Shareable collection for consistent testing
6. **CI/CD Integration**: Can be used with Newman for automated testing

## 🔗 Related Documentation

- [Server README](README.md) - Complete API server documentation
- [API Architecture](src/README.md) - Clean Architecture implementation details
- [Local Development Setup](../README.md) - Full project setup instructions

## 🤝 Contributing

When adding new API endpoints:

1. Add requests to appropriate folder (or create new folder)
2. Include both happy path and error scenarios
3. Add realistic sample data
4. Update this documentation
5. Test with actual API server

---

**Happy Testing! 🚀**