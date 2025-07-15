# Todo API Integration

This project implements a dual data source architecture that allows switching between local IndexedDB storage (via Dexie.js) and a remote API backend.

## Environment Configuration

The data source is controlled by environment variables:

### `.env` or `.env.local` file:
```bash
# Set to 'true' to use API backend, 'false' or omit to use local Dexie.js storage
VITE_USE_API_BACKEND=false

# API Base URL (when using API backend)
VITE_API_BASE_URL=http://localhost:3001
```

## Data Source Options

### 1. Local Storage (Default)
- **Technology**: Dexie.js (IndexedDB wrapper)
- **Configuration**: `VITE_USE_API_BACKEND=false` or omitted
- **Benefits**: Works offline, fast performance, no server dependency
- **Implementation**: `TodoRepository` class

### 2. API Backend
- **Technology**: REST API with Express.js server
- **Configuration**: `VITE_USE_API_BACKEND=true`
- **Benefits**: Centralized data, multi-user support, server-side validation
- **Implementation**: `ApiTodoRepository` class

## API Endpoints

When using the API backend, the following endpoints are available:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/todos` | Get all todos |
| GET | `/api/todos/active` | Get active todos only |
| GET | `/api/todos/completed` | Get completed todos only |
| GET | `/api/todos/stats` | Get todo statistics |
| GET | `/api/todos/:id` | Get specific todo by ID |
| POST | `/api/todos` | Create new todo |
| PUT | `/api/todos/:id` | Update existing todo |
| PATCH | `/api/todos/:id/toggle` | Toggle todo completion status |
| DELETE | `/api/todos/:id` | Delete todo |

## Architecture

Both implementations follow the same `ITodoRepository` interface, ensuring clean separation of concerns:

```typescript
interface ITodoRepository {
  getAll(): Promise<Todo[]>;
  create(todo: Todo): Promise<string>;
  update(id: string, changes: Partial<Todo>): Promise<void>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<Todo | undefined>;
  getActive(): Promise<Todo[]>;
  getCompleted(): Promise<Todo[]>;
  findBySpecification(specification: Specification<Todo>): Promise<Todo[]>;
}
```

## Switching Data Sources

### Runtime Switching
The data source is determined at application startup based on environment variables. The DI container automatically registers the appropriate repository implementation.

### Development Workflow
1. **Local Development**: Use Dexie.js for rapid prototyping and offline work
2. **API Testing**: Switch to API mode to test server integration
3. **Production**: Configure based on deployment requirements

## Testing

### Unit Tests
- `TodoRepository.spec.ts` - Tests local Dexie.js implementation
- `ApiTodoRepository.spec.ts` - Tests API implementation with mocked fetch
- `ApiTodoRepository.integration.spec.ts` - End-to-end tests with real API server

### Running Tests

```bash
# Run all tests with local storage
npm test

# Run API integration tests (requires server running)
cd server && npm run dev  # Start server in another terminal
npm test -- --run src/core/infrastructure/todo/persistence/ApiTodoRepository.integration.spec.ts
```

## Server Setup

To use the API backend:

1. Start the Express.js server:
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. The server will run on `http://localhost:3001`

3. Update client environment:
   ```bash
   echo "VITE_USE_API_BACKEND=true" > .env.local
   ```

4. Restart the client application

## Error Handling

Both implementations provide robust error handling:

- **Network Errors**: API implementation gracefully handles network failures
- **Validation Errors**: Client-side validation prevents invalid data submission
- **Server Errors**: Proper HTTP status code handling and error messages
- **Offline Support**: Local storage continues working when API is unavailable

## Performance Considerations

### Local Storage (Dexie.js)
- ✅ Instant response times
- ✅ Works offline
- ✅ No network overhead
- ❌ Limited to single device
- ❌ No server-side validation

### API Backend
- ✅ Multi-device synchronization
- ✅ Server-side business logic
- ✅ Centralized data management
- ❌ Network dependency
- ❌ Latency considerations
- ❌ Requires server infrastructure

## Clean Architecture Benefits

The implementation follows Clean Architecture principles:

1. **Domain Layer**: Business entities and rules remain unchanged
2. **Application Layer**: Use cases work with both data sources
3. **Infrastructure Layer**: Swappable repository implementations
4. **Presentation Layer**: UI components are unaware of data source

This ensures that switching between data sources requires no changes to business logic or UI components.