import 'reflect-metadata';
import { container } from 'tsyringe';
import { InMemoryTodoRepository } from '../todo/persistence/in-memory/InMemoryTodoRepository';
import { SqliteTodoRepository } from '../todo/persistence/sqlite/SqliteTodoRepository';
import { TypeOrmTodoRepository } from '../todo/persistence/typeorm/TypeOrmTodoRepository';
import { MongooseTodoRepository } from '../todo/persistence/mongoose/MongooseTodoRepository';
import { InMemoryUserRepository, SqliteUserRepository, TypeOrmUserRepository, MongooseUserRepository } from '../user/persistence';
import {
  CreateTodoUseCase,
  UpdateTodoUseCase,
  DeleteTodoUseCase,
  ToggleTodoUseCase,
  GetAllTodosQueryHandler,
  GetActiveTodosQueryHandler,
  GetCompletedTodosQueryHandler,
  GetTodoByIdQueryHandler,
  GetTodoStatsQueryHandler,
  TOKENS,
  TodoValidationService,
  CreateTodoValidationService,
  UpdateTodoValidationService,
  DeleteTodoValidationService,
  ToggleTodoValidationService,
  UserValidationService,
  RegisterUserValidationService,
  LoginUserValidationService,
} from '@nx-starter/application-shared';
import {
  RegisterUserUseCase,
  LoginUserUseCase,
  BcryptPasswordHashingService,
  JwtService,
  JwtConfig,
} from '@nx-starter/application-api';
import type { ITodoRepository, IUserRepository } from '@nx-starter/domain';
import { UserDomainService } from '@nx-starter/domain';
import { getTypeOrmDataSource } from '../database/connections/TypeOrmConnection';
import { connectMongoDB } from '../database/connections/MongooseConnection';
import { getDatabaseConfig, getSecurityConfig } from '../../config';

// Register dependencies following Clean Architecture layers
export const configureDI = async () => {
  // Infrastructure Layer - Repository (choose based on config)
  const todoRepositoryImplementation = await getTodoRepositoryImplementation();
  container.registerInstance<ITodoRepository>(
    TOKENS.TodoRepository,
    todoRepositoryImplementation
  );

  const userRepositoryImplementation = await getUserRepositoryImplementation();
  container.registerInstance<IUserRepository>(
    TOKENS.UserRepository,
    userRepositoryImplementation
  );

  // Infrastructure Layer - Services  
  container.registerSingleton(
    TOKENS.PasswordHashingService,
    BcryptPasswordHashingService
  );
  
  // Register JWT service with configuration
  const securityConfig = getSecurityConfig();
  const jwtConfig: JwtConfig = {
    secret: securityConfig.jwt.secret,
    expiresIn: securityConfig.jwt.expiresIn,
    issuer: securityConfig.jwt.issuer,
    audience: securityConfig.jwt.audience,
  };
  
  container.registerInstance(
    TOKENS.JwtService,
    new JwtService(jwtConfig)
  );

  // Application Layer - Use Cases (Commands)
  container.registerSingleton(TOKENS.CreateTodoUseCase, CreateTodoUseCase);
  container.registerSingleton(TOKENS.UpdateTodoUseCase, UpdateTodoUseCase);
  container.registerSingleton(TOKENS.DeleteTodoUseCase, DeleteTodoUseCase);
  container.registerSingleton(TOKENS.ToggleTodoUseCase, ToggleTodoUseCase);
  container.registerSingleton(TOKENS.RegisterUserUseCase, RegisterUserUseCase);
  container.registerSingleton(TOKENS.LoginUserUseCase, LoginUserUseCase);

  // Application Layer - Use Cases (Queries)
  container.registerSingleton(
    TOKENS.GetAllTodosQueryHandler,
    GetAllTodosQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetActiveTodosQueryHandler,
    GetActiveTodosQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetCompletedTodosQueryHandler,
    GetCompletedTodosQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetTodoByIdQueryHandler,
    GetTodoByIdQueryHandler
  );
  container.registerSingleton(
    TOKENS.GetTodoStatsQueryHandler,
    GetTodoStatsQueryHandler
  );

  // Application Layer - Validation Services
  container.registerSingleton(
    TOKENS.CreateTodoValidationService,
    CreateTodoValidationService
  );
  container.registerSingleton(
    TOKENS.UpdateTodoValidationService,
    UpdateTodoValidationService
  );
  container.registerSingleton(
    TOKENS.DeleteTodoValidationService,
    DeleteTodoValidationService
  );
  container.registerSingleton(
    TOKENS.ToggleTodoValidationService,
    ToggleTodoValidationService
  );
  container.registerSingleton(
    TOKENS.TodoValidationService,
    TodoValidationService
  );
  container.registerSingleton(
    TOKENS.RegisterUserValidationService,
    RegisterUserValidationService
  );
  container.registerSingleton(
    TOKENS.LoginUserValidationService,
    LoginUserValidationService
  );
  container.registerSingleton(
    TOKENS.UserValidationService,
    UserValidationService
  );

  // Domain Layer - Domain Services
  // UserDomainService is instantiated manually in use cases (Clean Architecture best practice)
};

async function getTodoRepositoryImplementation(): Promise<ITodoRepository> {
  const dbConfig = getDatabaseConfig();
  const dbType = dbConfig.type;
  const ormType = dbConfig.orm || 'native';

  console.log(`📦 Using ${ormType} ORM with ${dbType} database`);

  // Handle memory database (always uses in-memory repository)
  if (dbType === 'memory') {
    console.log('📦 Using in-memory repository');
    return new InMemoryTodoRepository();
  }

  // Handle MongoDB (always uses Mongoose)
  if (dbType === 'mongodb') {
    await connectMongoDB();
    console.log('📦 Using Mongoose repository with MongoDB');
    return new MongooseTodoRepository();
  }

  // Handle SQL databases with different ORMs
  switch (ormType) {
    case 'typeorm': {
      const dataSource = await getTypeOrmDataSource();
      console.log(`📦 Using TypeORM repository with ${dbType}`);
      return new TypeOrmTodoRepository(dataSource);
    }


    case 'native':
    default: {
      if (dbType === 'sqlite') {
        console.log('📦 Using native SQLite repository');
        return new SqliteTodoRepository();
      }

      // For other databases without native support, default to TypeORM
      console.log(
        `📦 No native support for ${dbType}, falling back to TypeORM`
      );
      const dataSource = await getTypeOrmDataSource();
      return new TypeOrmTodoRepository(dataSource);
    }
  }
}

async function getUserRepositoryImplementation(): Promise<IUserRepository> {
  const dbConfig = getDatabaseConfig();
  const dbType = dbConfig.type;
  const ormType = dbConfig.orm || 'native';

  console.log(`📦 Using ${ormType} ORM with ${dbType} database for User repository`);

  // Handle memory database (always uses in-memory repository)
  if (dbType === 'memory') {
    console.log('📦 Using in-memory user repository');
    return new InMemoryUserRepository();
  }

  // Handle MongoDB (always uses Mongoose)
  if (dbType === 'mongodb') {
    await connectMongoDB();
    console.log('📦 Using Mongoose user repository with MongoDB');
    return new MongooseUserRepository();
  }

  // Handle SQL databases with different ORMs
  switch (ormType) {
    case 'typeorm': {
      const dataSource = await getTypeOrmDataSource();
      console.log(`📦 Using TypeORM user repository with ${dbType}`);
      return new TypeOrmUserRepository(dataSource);
    }

    case 'native':
    default: {
      if (dbType === 'sqlite') {
        console.log('📦 Using native SQLite user repository');
        return new SqliteUserRepository();
      }

      // For other databases without native support, default to TypeORM
      console.log(
        `📦 No native support for ${dbType}, falling back to TypeORM for user repository`
      );
      const dataSource = await getTypeOrmDataSource();
      return new TypeOrmUserRepository(dataSource);
    }
  }
}

// Export container and tokens for use in controllers
export { container, TOKENS };
