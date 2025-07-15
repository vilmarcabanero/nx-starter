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
- **Multiple ORM Support**: Choose between TypeORM, Mongoose, Sequelize, or native implementations
- **Multi-Database Support**: SQLite, MySQL, PostgreSQL, MongoDB support out of the box

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

## Database Configuration

The server supports multiple databases and ORMs through a flexible configuration system. Choose the combination that best fits your needs.

### Supported Combinations

| Database       | ORM/Driver | Description                               |
| -------------- | ---------- | ----------------------------------------- |
| **Memory**     | Native     | In-memory storage for development/testing |
| **SQLite**     | Native     | File-based SQLite using better-sqlite3    |
| **SQLite**     | TypeORM    | SQLite with TypeORM ORM                   |
| **SQLite**     | Sequelize  | SQLite with Sequelize ORM                 |
| **MySQL**      | TypeORM    | MySQL with TypeORM ORM                    |
| **MySQL**      | Sequelize  | MySQL with Sequelize ORM                  |
| **PostgreSQL** | TypeORM    | PostgreSQL with TypeORM ORM               |
| **PostgreSQL** | Sequelize  | PostgreSQL with Sequelize ORM             |
| **MongoDB**    | Mongoose   | MongoDB with Mongoose ODM                 |

### Configuration

Set the following environment variables in your `.env` file:

```bash
# Database type: memory | sqlite | mysql | postgresql | mongodb
DB_TYPE=memory

# ORM selection: native | typeorm | sequelize | mongoose
# - native: Uses better-sqlite3 for SQLite only
# - typeorm: Supports MySQL, PostgreSQL, SQLite
# - sequelize: Supports MySQL, PostgreSQL, SQLite
# - mongoose: Only for MongoDB (automatic when DB_TYPE=mongodb)
DB_ORM=native

# Connection URL (recommended)
DATABASE_URL=sqlite:./data/todos.db

# OR individual parameters
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=user
DB_PASSWORD=password
DB_NAME=task_app
```

### Example Configurations

#### **1. In-Memory (Default - Development)**

```bash
DB_TYPE=memory
DB_ORM=native
```

- Fast startup
- No persistence
- Perfect for testing

#### **2. SQLite + Native Driver**

```bash
DB_TYPE=sqlite
DB_ORM=native
DATABASE_URL=./data/todos.db
```

- Lightweight file database
- No external dependencies
- Good for small deployments

#### **3. SQLite + TypeORM**

```bash
DB_TYPE=sqlite
DB_ORM=typeorm
DATABASE_URL=sqlite:./data/todos.db
```

- Full ORM features
- Migration support
- Type-safe queries

#### **4. MySQL + TypeORM**

```bash
DB_TYPE=mysql
DB_ORM=typeorm
DATABASE_URL=mysql://user:password@localhost:3306/task_app
```

- Production-ready SQL database
- ACID transactions
- Excellent performance

#### **5. PostgreSQL + Sequelize**

```bash
DB_TYPE=postgresql
DB_ORM=sequelize
DATABASE_URL=postgresql://user:password@localhost:5432/task_app
```

- Advanced SQL features
- JSON support
- Mature ORM

#### **6. MongoDB + Mongoose**

```bash
DB_TYPE=mongodb
DATABASE_URL=mongodb://localhost:27017/task_app
```

- NoSQL flexibility
- Document-based storage
- Horizontal scaling

### Database Setup

#### **SQLite** (No setup required)

Files will be created automatically.

#### **MySQL**

```sql
CREATE DATABASE task_app;
CREATE USER 'task_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON task_app.* TO 'task_user'@'localhost';
```

#### **PostgreSQL**

```sql
CREATE DATABASE task_app;
CREATE USER task_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE task_app TO task_user;
```

#### **MongoDB**

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install locally
# Database and collections will be created automatically
```

### Migration and Schema

- **TypeORM**: Auto-syncs in development mode
- **Sequelize**: Auto-syncs in development mode
- **Mongoose**: Schema-less, indexes created automatically
- **Native SQLite**: Tables created on first use

### Performance Tips

1. **Development**: Use `memory` or `sqlite` for fast iteration
2. **Testing**: Use `memory` for unit tests, `sqlite` for integration tests
3. **Production**: Use `mysql` or `postgresql` for best performance
4. **NoSQL needs**: Use `mongodb` for document-heavy applications

### Switching Databases

To switch between databases:

1. Update your `.env` file with new configuration
2. Restart the server
3. The application will automatically use the new database

No code changes required - the repository pattern abstracts all database differences!

## Troubleshooting

### PostgreSQL Issues

#### **Common Error: ENUM Type Issues**

```
ERROR: type "todo_priority" already exists
```

**Solution**: This happens when the ENUM type already exists. The server will handle this automatically, but if you encounter issues:

1. Connect to your PostgreSQL database
2. Drop the existing type: `DROP TYPE IF EXISTS todo_priority CASCADE;`
3. Restart the server

#### **Common Error: UUID Extension**

```
ERROR: function uuid_generate_v4() does not exist
```

**Solution**: Enable the UUID extension (the server does this automatically):

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

#### **Common Error: Permission Issues**

```
ERROR: permission denied to create extension "uuid-ossp"
```

**Solution**: Ensure your PostgreSQL user has superuser privileges or ask your admin to enable the extension.

#### **Common Error: Connection Issues**

```
ERROR: password authentication failed
```

**Solution**: Check your connection string and credentials:

```bash
# Test connection manually
psql postgresql://username:password@localhost:5432/database_name
```

### Sequelize Issues

#### **Error: Data Type Not Supported**

This error indicates incompatible data types between different databases. The current implementation handles cross-database compatibility automatically.

#### **Error: Model Synchronization Issues**

```
ERROR: relation "todo" already exists
```

**Solution**: This is normal for existing databases. The server uses `{ alter: true }` which safely updates schema.

### TypeORM Issues

#### **Error: Entity Metadata Validation**

Ensure your entities are properly decorated and imported in the data source configuration.

### MongoDB/Mongoose Issues

#### **Error: ObjectId Validation**

```
Cast to ObjectId failed for value "string-id"
```

The system automatically handles ID generation. MongoDB uses ObjectId while other databases use UUID.

### General Database Issues

#### **Port Already in Use**

```
ERROR: Port 3001 is already in use
```

**Solution**: Change the port in your `.env` file:

```
PORT=3002
```

#### **Database Connection Timeout**

**Solution**: Check if your database server is running and accessible.

## API Documentation

### 📦 Postman Collection

A comprehensive Postman collection is available for testing all API endpoints with various scenarios:

- **Collection**: [`postman-collection.json`](postman-collection.json)
- **Environment**: [`postman-environment.json`](postman-environment.json)
- **Documentation**: [`POSTMAN.md`](POSTMAN.md)

**Quick Import:**

1. Open Postman
2. Import both `postman-collection.json` and `postman-environment.json`
3. Select "Task App Development Environment"
4. Start testing all endpoints with happy path and error scenarios

The collection includes 30+ requests organized by operation type with comprehensive test coverage.

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
  dueDate?: string; // ISO 8601
}
```

### Create Todo Request

```typescript
interface CreateTodoDto {
  title: string; // min: 2 chars, max: 255 chars
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO 8601 format
}
```

### Update Todo Request

```typescript
interface UpdateTodoDto {
  title?: string; // min: 2 chars, max: 255 chars
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string; // ISO 8601 format
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

## Practical Examples

### Docker Deployment with Different Databases

#### **Example 1: Production with PostgreSQL + TypeORM**

**docker-compose.yml:**

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: task_app
      POSTGRES_USER: task_user
      POSTGRES_PASSWORD: secure_password
    ports:
      - '5432:5432'
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: .
    environment:
      DB_TYPE: postgresql
      DB_ORM: typeorm
      DATABASE_URL: postgresql://task_user:secure_password@postgres:5432/task_app
      NODE_ENV: production
    ports:
      - '3001:3001'
    depends_on:
      - postgres

volumes:
  postgres_data:
```

#### **Example 2: Development with MongoDB + Mongoose**

**.env:**

```bash
DB_TYPE=mongodb
DATABASE_URL=mongodb://localhost:27017/task_app_dev
NODE_ENV=development
```

**Start MongoDB:**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
npm run dev
```

#### **Example 3: Testing with SQLite + Sequelize**

**.env.test:**

```bash
DB_TYPE=sqlite
DB_ORM=sequelize
DATABASE_URL=sqlite:./test/test.db
NODE_ENV=test
```

### Repository Pattern Benefits

The repository pattern allows you to switch between databases without changing your business logic:

```typescript
// This same code works with ANY database/ORM combination
const todoService = container.resolve(CreateTodoUseCase);
const todo = await todoService.execute({
  title: 'Learn Clean Architecture',
  priority: 'high',
});
```

Whether you're using:

- ✅ Memory + Native
- ✅ SQLite + TypeORM
- ✅ MySQL + Sequelize
- ✅ PostgreSQL + TypeORM
- ✅ MongoDB + Mongoose

The business logic remains identical!

### Performance Comparison

| Database   | ORM       | Setup Time | Query Performance | Memory Usage | Best For                      |
| ---------- | --------- | ---------- | ----------------- | ------------ | ----------------------------- |
| Memory     | Native    | Instant    | Fastest           | Lowest       | Testing, Development          |
| SQLite     | Native    | Fast       | Fast              | Low          | Small Apps, Prototypes        |
| SQLite     | TypeORM   | Fast       | Good              | Medium       | Development, Small Production |
| MySQL      | TypeORM   | Medium     | Excellent         | Medium       | Medium Production Apps        |
| PostgreSQL | Sequelize | Medium     | Excellent         | Medium       | Large Production Apps         |
| MongoDB    | Mongoose  | Fast       | Good              | Medium       | Document-heavy Apps           |

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
