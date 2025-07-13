import { describe, it, expect } from 'vitest';

describe('Todo Application Layer Index Exports', () => {
  it('should export services', async () => {
    const commandServiceExports = await import('./services/TodoCommandService');
    const queryServiceExports = await import('./services/TodoQueryService');
    
    expect(commandServiceExports).toBeDefined();
    expect(queryServiceExports).toBeDefined();
  });

  it('should export mappers', async () => {
    const exports = await import('./mappers/TodoMapper');
    expect(exports).toBeDefined();
  });

  it('should export use cases commands', async () => {
    const exports = await import('./use-cases/commands');
    expect(exports).toBeDefined();
  });

  it('should export use cases queries', async () => {
    const exports = await import('./use-cases/queries');
    expect(exports).toBeDefined();
  });

  it('should export DTOs', async () => {
    const commandsExports = await import('./dto/TodoCommands');
    const queriesExports = await import('./dto/TodoQueries');
    const dtoExports = await import('./dto/TodoDto');
    
    expect(commandsExports).toBeDefined();
    expect(queriesExports).toBeDefined();
    expect(dtoExports).toBeDefined();
  });

  it('should re-export from main todo index', async () => {
    const exports = await import('./index');
    expect(exports).toBeDefined();
  });
});
