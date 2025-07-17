// Test UUIDs for consistent testing - using valid 32-character hex format
export const TEST_UUIDS = {
  TODO_1: '123456789abcdef0123456789abcdef1',
  TODO_2: '123456789abcdef0123456789abcdef2',
  TODO_3: '123456789abcdef0123456789abcdef3',
  TODO_4: '123456789abcdef0123456789abcdef4',
  TODO_5: '123456789abcdef0123456789abcdef5',
} as const;

export const generateTestUuid = (suffix: number) => {
  const suffixHex = suffix.toString(16);
  return `123456789abcdef0123456789abcdef${suffixHex}`;
};

// Additional test utilities
export const createTestTodo = (
  overrides: Partial<{
    id: string;
    title: string;
    completed: boolean;
    createdAt: Date;
    updatedAt: Date;
  }> = {}
) => ({
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
