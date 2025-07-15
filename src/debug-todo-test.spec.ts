import { describe, it, expect } from 'vitest';
import { Todo } from '@/core/domain/todo/entities/Todo';
import { TEST_UUIDS } from '@/test/test-helpers';

describe('Debug Test', () => {
  it('should create todo with TEST_UUIDS', () => {
    console.log('TEST_UUIDS.TODO_1:', TEST_UUIDS.TODO_1);
    console.log('Type:', typeof TEST_UUIDS.TODO_1);
    console.log('Length:', TEST_UUIDS.TODO_1.length);
    
    const todo = new Todo('Test Todo', false, new Date(), TEST_UUIDS.TODO_1);
    expect(todo.stringId).toBe(TEST_UUIDS.TODO_1);
  });
  
  it('should create todo with hardcoded UUID', () => {
    const hardcodedUuid = 'a1b2c3d4e5f6789012345678901234ab';
    const todo = new Todo('Test Todo', false, new Date(), hardcodedUuid);
    expect(todo.stringId).toBe(hardcodedUuid);
  });
});