import { describe, it, expect } from 'vitest';

describe('Todo Persistence Index Exports', () => {
  it('should export all persistence modules correctly', async () => {
    // Import the index file to trigger all export statements
    const persistenceIndex = await import('./index');
    
    // Verify that the exports are available
    expect(persistenceIndex).toBeDefined();
    
    // Check that key repository exports exist - main classes and functions
    expect(persistenceIndex.InMemoryTodoRepository).toBeDefined();
    expect(persistenceIndex.SqliteTodoRepository).toBeDefined();
    expect(persistenceIndex.MongooseTodoRepository).toBeDefined();
    expect(persistenceIndex.MongooseConnection).toBeDefined();
    expect(persistenceIndex.TodoModel).toBeDefined();
    expect(persistenceIndex.TypeOrmTodoRepository).toBeDefined();
    expect(persistenceIndex.createTypeOrmDataSource).toBeDefined();
    expect(persistenceIndex.TodoEntity).toBeDefined();
    expect(persistenceIndex.SequelizeTodoRepository).toBeDefined();
    expect(persistenceIndex.createSequelizeInstance).toBeDefined();
    expect(persistenceIndex.getSequelizeInstance).toBeDefined();
    expect(persistenceIndex.closeSequelizeConnection).toBeDefined();
    expect(persistenceIndex.initTodoModel).toBeDefined();
    expect(persistenceIndex.TodoSequelizeModel).toBeDefined();
    
    // Verify the total number of exports is reasonable
    expect(Object.keys(persistenceIndex).length).toBeGreaterThan(10);
  });
});