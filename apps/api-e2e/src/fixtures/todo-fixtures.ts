export const todoFixtures = {
  validTodo: {
    title: 'Test Todo',
    priority: 'medium' as const,
  },
  
  highPriorityTodo: {
    title: 'High Priority Test Todo',
    priority: 'high' as const,
  },
  
  lowPriorityTodo: {
    title: 'Low Priority Test Todo',
    priority: 'low' as const,
  },
  
  longTitleTodo: {
    title: 'This is a very long todo title that should still be accepted by the API validation',
    priority: 'medium' as const,
  },
  
  invalidTodos: {
    emptyTitle: {
      title: '',
      priority: 'medium' as const,
    },
    
    shortTitle: {
      title: 'x',
      priority: 'medium' as const,
    },
    
    noTitle: {
      priority: 'medium' as const,
    },
    
    invalidPriority: {
      title: 'Valid Title',
      priority: 'invalid' as any,
    },
  },
  
  updateData: {
    titleOnly: {
      title: 'Updated Title',
    },
    
    priorityOnly: {
      priority: 'high' as const,
    },
    
    complete: {
      title: 'Completely Updated Todo',
      priority: 'low' as const,
    },
  },
};

export const generateTodoData = (overrides: Partial<typeof todoFixtures.validTodo> = {}) => ({
  ...todoFixtures.validTodo,
  ...overrides,
});

export const generateMultipleTodos = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    title: `Test Todo ${i + 1}`,
    priority: ['low', 'medium', 'high'][i % 3] as 'low' | 'medium' | 'high',
  }));
};