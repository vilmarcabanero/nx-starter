import { describe, it, expect } from 'vitest';

describe('Todo Persistence Index Exports', () => {
  it('should export all persistence modules correctly', async () => {
    // Import the index file to trigger all export statements
    const persistenceIndex = await import('./index');
    
    // Verify that the exports are available
    expect(persistenceIndex).toBeDefined();
    
    // Check that key repository exports exist
    expect(persistenceIndex.InMemoryTodoRepository).toBeDefined();
    expect(persistenceIndex.SqliteTodoRepository).toBeDefined();
    expect(persistenceIndex.MongooseTodoRepository).toBeDefined();
    expect(persistenceIndex.MongooseConnection).toBeDefined();
    expect(persistenceIndex.TodoSchema).toBeDefined();
    expect(persistenceIndex.TypeOrmTodoRepository).toBeDefined();
    expect(persistenceIndex.TypeOrmConnection).toBeDefined();
    expect(persistenceIndex.TodoEntity).toBeDefined();
    expect(persistenceIndex.SequelizeTodoRepository).toBeDefined();
    expect(persistenceIndex.SequelizeConnection).toBeDefined();
    expect(persistenceIndex.TodoModel).toBeDefined();
  });
});