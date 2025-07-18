# NX Starter Workspace

A modern, scalable monorepo starter built with [Nx](https://nx.dev) that demonstrates clean architecture principles and best practices for full-stack TypeScript development.

## 🏗️ Architecture Overview

This workspace follows clean architecture principles with clear separation of concerns:

### Applications

- **starter-api** - Express.js REST API backend
- **starter-pwa** - React Progressive Web App frontend
- **starter-api-e2e** - End-to-end tests for API
- **starter-pwa-e2e** - End-to-end tests for PWA

### Libraries

- **domain-core** - Domain entities, business logic, and rules
- **application-core** - Application services, use cases, and orchestration
- **utils-core** - Shared utilities and helper functions

```
┌─────────────────────────────────────────────────────────────┐
│                    Applications                             │
├─────────────────────────────────────────────────────────────┤
│    starter-api          │         starter-pwa              │
│   (Express API)         │      (React PWA)                 │
└─────────────────────────┴─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                application-core                             │
│          (Use Cases & Application Services)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  domain-core                                │
│            (Business Logic & Entities)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  utils-core                                 │
│              (Shared Utilities)                             │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nx-starter

# Install dependencies
pnpm install

# Build all projects
pnpm nx run-many --target=build --all

# Run tests
pnpm nx run-many --target=test --all
```

### Development

```bash
# Start API development server
pnpm nx serve starter-api

# Start PWA development server
pnpm nx serve starter-pwa

# Run both in parallel
pnpm nx run-many --target=serve --projects=starter-api,starter-pwa --parallel
```

## 📋 Common Nx Commands

### Project Management

```bash
# List all projects
pnpm nx show projects

# Show project details
pnpm nx show project <project-name>

# View dependency graph
pnpm nx graph

# View project graph in browser
pnpm nx graph --view file
```

### Development Workflow

```bash
# Build a specific project
pnpm nx build <project-name>

# Build all projects
pnpm nx run-many --target=build --all

# Test a specific project
pnpm nx test <project-name>

# Test all projects
pnpm nx run-many --target=test --all

# Lint a specific project
pnpm nx lint <project-name>

# Lint all projects
pnpm nx run-many --target=lint --all
```

### Development Servers

```bash
# Serve API (development)
pnpm nx serve starter-api

# Serve PWA (development)
pnpm nx serve starter-pwa

# Serve with specific configuration
pnpm nx serve starter-api --configuration=production
```

### Testing

```bash
# Run unit tests
pnpm nx test <project-name>

# Run e2e tests
pnpm nx e2e starter-api-e2e
pnpm nx e2e starter-pwa-e2e

# Run tests with coverage
pnpm nx test <project-name> --coverage

# Run tests in watch mode
pnpm nx test <project-name> --watch
```

### Code Quality

```bash
# Lint code
pnpm nx lint <project-name>

# Format code
pnpm nx format

# Check formatting
pnpm nx format --check
```

### Dependency Management

```bash
# Show project dependencies
pnpm nx graph

# Check for circular dependencies
pnpm nx graph --focus=<project-name>

# Show what's affected by changes
pnpm nx affected --target=build

# Test only affected projects
pnpm nx affected --target=test
```

## 🛠️ Technology Stack

### Frontend (starter-pwa)

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **Radix UI** - Accessible component primitives
- **React Hook Form** - Form management
- **Zustand** - State management
- **Vitest** - Testing framework

### Backend (starter-api)

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma** - Database ORM (optional)
- **TypeORM** - Alternative ORM
- **Webpack** - Module bundler
- **Vitest** - Testing framework

### Development Tools

- **Nx** - Monorepo tool and build system
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Additional testing support
- **Playwright** - E2E testing
- **TSyringe** - Dependency injection

## 📁 Project Structure

```
nx-starter/
├── apps/
│   ├── starter-api/          # Express API application
│   ├── starter-api-e2e/      # API end-to-end tests
│   ├── starter-pwa/          # React PWA application
│   └── starter-pwa-e2e/      # PWA end-to-end tests
├── libs/
│   ├── application-core/     # Application services & use cases
│   ├── domain-core/          # Domain entities & business logic
│   └── utils-core/           # Shared utilities
├── docs/                     # Documentation
├── nx.json                   # Nx workspace configuration
├── package.json              # Dependencies and scripts
└── tsconfig.base.json        # TypeScript configuration
```

## 🔧 Configuration

### Environment Variables

Each application has its own `.env.example` file:

- `apps/starter-api/.env.example` - API configuration
- `apps/starter-pwa/.env.example` - PWA configuration

Copy these to `.env` and customize for your environment.

### Nx Configuration

- `nx.json` - Workspace configuration
- `project.json` - Project-specific configuration in each app/lib
- `tsconfig.base.json` - Shared TypeScript paths

## 🧪 Testing Strategy

### Unit Tests

- **Location**: `src/**/*.spec.ts` files
- **Framework**: Vitest
- **Command**: `npx nx test <project-name>`

### Integration Tests

- **Location**: `src/**/*.integration.spec.ts` files
- **Framework**: Vitest
- **Command**: `npx nx test <project-name>`

### E2E Tests

- **API E2E**: `apps/starter-api-e2e/`
- **PWA E2E**: `apps/starter-pwa-e2e/`
- **Framework**: Playwright
- **Command**: `npx nx e2e <project-name>-e2e`

## 📚 Learning Resources

### Nx Documentation

- [Nx Official Docs](https://nx.dev)
- [Nx Tutorials](https://nx.dev/tutorials)
- [Nx Blog](https://nx.dev/blog)

### Architecture Patterns

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Hexagonal Architecture](https://alistair.cockburn.us/hexagonal-architecture/)
- [Domain-Driven Design](https://domainlanguage.com/ddd/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Run tests: `pnpm nx run-many --target=test --all`
5. Run linting: `pnpm nx run-many --target=lint --all`
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to the branch: `git push origin feature/your-feature`
8. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions and support:

- Check the [Nx documentation](https://nx.dev)
- Open an issue in this repository
- Join the [Nx Community](https://go.nx.dev/community)
