# Task App API Server

Express.js API server for the Task App, built with Clean Architecture principles and TypeScript.

## Features

- **Clean Architecture**: Clear separation of concerns with Domain, Application, Infrastructure, and Presentation layers
- **CQRS Pattern**: Command Query Responsibility Segregation for better code organization
- **Dependency Injection**: Using TSyringe for IoC container
- **Type Safety**: Full TypeScript implementation with strict type checking
- **Domain-Driven Design**: Rich domain models with value objects and entities
- **Validation**: Request validation using Zod schemas
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Security**: Helmet, CORS, and rate limiting included
- **Multiple Database Support**: Ready for Prisma, Mongoose, TypeORM, and Sequelize (currently using in-memory storage)

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
cd server
npm install
```

### Development

```bash
npm run dev
```

The server will start on http://localhost:3001

### Production

```bash
npm run build
npm start
```

## API Documentation

### Base URL
```
http://localhost:3001/api
```

### Endpoints

#### Health Check
```
GET /api/health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-07-14T18:45:13.914Z"
}
```

#### Get All Todos
```
GET /api/todos
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "b0fa12a6e05e4283934e3aef9f469c76",
      "title": "Test Todo",
      "completed": false,
      "priority": "high",
      "createdAt": "2025-07-14T18:45:28.687Z",
      "dueDate": "2025-07-20T10:00:00.000Z"
    }
  ]
}
```

#### Get Active Todos
```
GET /api/todos/active
```

#### Get Completed Todos
```
GET /api/todos/completed
```

#### Get Todo Statistics
```
GET /api/todos/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "active": 3,
    "completed": 2
  }
}
```

#### Get Todo by ID
```
GET /api/todos/:id
```

#### Create Todo
```
POST /api/todos
```

**Request Body:**
```json
{
  "title": "New Todo",
  "priority": "medium",
  "dueDate": "2025-07-20T10:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "title": "New Todo",
    "completed": false,
    "priority": "medium",
    "createdAt": "2025-07-14T18:45:28.687Z",
    "dueDate": "2025-07-20T10:00:00.000Z"
  }
}
```

#### Update Todo
```
PUT /api/todos/:id
```

**Request Body:**
```json
{
  "title": "Updated Todo",
  "completed": true,
  "priority": "high",
  "dueDate": "2025-07-21T10:00:00.000Z"
}
```

#### Toggle Todo Completion
```
PATCH /api/todos/:id/toggle
```

#### Delete Todo
```
DELETE /api/todos/:id
```

## Data Models

### Todo DTO
```typescript
interface TodoDto {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string; // ISO 8601
  dueDate?: string;  // ISO 8601
}
```

### Create Todo Request
```typescript
interface CreateTodoDto {
  title: string;           // min: 2 chars, max: 255 chars
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;        // ISO 8601 format
}
```

### Update Todo Request
```typescript
interface UpdateTodoDto {
  title?: string;          // min: 2 chars, max: 255 chars
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;        // ISO 8601 format
}
```

## Architecture

### Directory Structure
```
src/
├── core/
│   ├── domain/           # Domain entities, value objects, repository interfaces
│   ├── application/      # Use cases, DTOs, application services
│   └── infrastructure/   # Repository implementations, DI container
├── presentation/         # Controllers, routes, middleware
├── config/              # App configuration
└── utils/               # Utility functions
```

### Clean Architecture Layers

1. **Domain Layer** (`core/domain/`): Business entities, value objects, domain services
2. **Application Layer** (`core/application/`): Use cases, DTOs, application logic
3. **Infrastructure Layer** (`core/infrastructure/`): Database repositories, external services
4. **Presentation Layer** (`presentation/`): REST controllers, routes, middleware

### CQRS Implementation

- **Commands**: Create, Update, Delete, Toggle operations
- **Queries**: Get, Filter, Statistics operations
- **Use Cases**: Each operation is handled by a dedicated use case class
- **Validation**: Zod schemas validate all incoming requests

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
DB_TYPE=memory
```

## Local-First Approach

This API is designed to work with the local-first pattern where:

1. UI operations update local storage (Dexie.js) first
2. UI immediately re-renders with optimistic updates
3. API calls are made asynchronously
4. Any conflicts are resolved through the API responses

## Future Enhancements

### Database Support
The architecture is ready for multiple ORMs:

- **Prisma** for PostgreSQL/MySQL
- **Mongoose** for MongoDB  
- **TypeORM** for PostgreSQL/MySQL/SQLite
- **Sequelize** for PostgreSQL/MySQL/MariaDB/SQLite

### Authentication
JWT-based authentication can be easily added to the middleware layer.

### Real-time Updates
WebSocket support for real-time todo synchronization.

### Caching
Redis integration for improved performance.

## Testing

```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

## Contributing

1. Follow the Clean Architecture patterns
2. Write tests for new features
3. Use TypeScript strictly
4. Follow the existing code style
5. Document new API endpoints

## License

MIT