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

- Node.js (v20 or higher)
- pnpm (v10.13.1 or higher)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd nx-starter

# Install dependencies and set up the project
pnpm run setup

# This runs:
# 1. pnpm install (installs dependencies)
# 2. pnpm run build:libs (builds shared libraries)
# 3. pnpm run prepare (sets up git hooks for commit validation)
```

### Alternative Setup

```bash
# Manual setup if you prefer step-by-step
pnpm install
pnpm run build:libs

# Set up git hooks for commit message validation
pnpm run prepare

# Run tests to verify everything works
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
- **Commitlint** - Commit message linting
- **Husky** - Git hooks management

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
├── legacy/                   # Legacy code and migration documentation
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
6. Commit your changes using conventional commits: `git commit -m 'feat(scope): description'`
7. Push to the branch: `git push origin feature/your-feature`
8. Submit a pull request

### Commit Message Guidelines

This project enforces conventional commit messages. All commits must follow this format:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, missing semi-colons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system changes
- `ci` - CI configuration changes
- `chore` - Other maintenance changes
- `revert` - Reverts a previous commit

**Scopes (optional):**
- `starter-api` - API application changes
- `starter-pwa` - PWA application changes
- `domain-core` - Domain library changes
- `application-core` - Application library changes
- `utils-core` - Utils library changes

**Examples:**
```bash
# Valid commits (lowercase first letter, proper nouns/acronyms allowed, no period)
feat(starter-api): add OAuth integration with GitHub API
fix(starter-pwa): resolve JWT token validation issue
docs: update API documentation for v2
style(starter-api): format code with Prettier
refactor(domain-core): improve Todo entity structure
test(application-core): add unit tests for TodoService
perf(starter-api): optimize database queries for PostgreSQL
chore: update dependencies to latest versions

# Invalid commits (will be rejected)
feat(starter-api): Add OAuth integration  # ❌ First letter capitalized
fix(starter-pwa): resolve login issue.     # ❌ Ends with period
docs: Update API documentation            # ❌ First letter capitalized
FEAT(api): add new feature               # ❌ Type not lowercase
feat: add feature                        # ❌ Missing scope (optional but recommended)
```

**Validation Rules:**
- **First letter**: Must be lowercase or a number (allows proper nouns/acronyms after)
- **No periods**: Subject must not end with a period (.)
- **Length**: Header must be 72 characters or less
- **Type**: Must be one of the allowed types in lowercase
- **Scope**: Must be in kebab-case if provided

**Validation:**
- Use `pnpm run commit-lint:check` to validate your last commit
- Invalid commits will be rejected by the git hook
- If git hooks aren't working, run `pnpm run prepare` to set them up

**Troubleshooting:**
- If commit validation isn't working after cloning, run `pnpm run prepare`
- Make sure you're in the project root directory when committing
- The git hooks are automatically set up when you run `pnpm install` (via the `prepare` script)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For questions and support:

- Check the [Nx documentation](https://nx.dev)
- Open an issue in this repository
- Join the [Nx Community](https://go.nx.dev/community)
