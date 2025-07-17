// Test UUIDs for consistent testing
export const TEST_UUIDS = {
  TODO_1: 'test-uuid-1',
  TODO_2: 'test-uuid-2', 
  TODO_3: 'test-uuid-3',
  TODO_4: 'test-uuid-4',
  TODO_5: 'test-uuid-5',
} as const;

export const generateTestUuid = (suffix: number) => `test-uuid-${suffix}`;

// Additional test utilities
export const createTestTodo = (overrides: Partial<{
  id: string;
  title: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}> = {}) => ({
  id: TEST_UUIDS.TODO_1,
  title: 'Test Todo',
  completed: false,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  ...overrides,
});

export const createTestTodos = (count: number) => {
  return Array.from({ length: count }, (_, index) => 
    createTestTodo({
      id: generateTestUuid(index + 1),
      title: `Test Todo ${index + 1}`,
    })
  );
};