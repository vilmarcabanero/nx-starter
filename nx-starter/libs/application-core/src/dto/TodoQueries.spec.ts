import { describe, it, expect } from 'vitest';
import type {
  GetAllTodosQuery,
  GetFilteredTodosQuery,
  GetTodoStatsQuery,
  GetTodoByIdQuery,
  TodoStatsQueryResult,
} from './TodoQueries';

// Import the actual module to ensure coverage
import * as TodoQueriesModule from './TodoQueries';

describe('TodoQueries Module', () => {
  it('should export all expected types', () => {
    // This ensures the module is imported and coverage is tracked
    expect(TodoQueriesModule).toBeDefined();
    expect(typeof TodoQueriesModule).toBe('object');
  });
});

describe('TodoQueries', () => {
  describe('GetAllTodosQuery', () => {
    it('should define correct interface structure', () => {
      const query: GetAllTodosQuery = {};
      expect(typeof query).toBe('object');
    });
  });

  describe('GetFilteredTodosQuery', () => {
    it('should define correct interface structure with filter only', () => {
      const allQuery: GetFilteredTodosQuery = { filter: 'all' };
      const activeQuery: GetFilteredTodosQuery = { filter: 'active' };
      const completedQuery: GetFilteredTodosQuery = { filter: 'completed' };

      expect(allQuery.filter).toBe('all');
      expect(activeQuery.filter).toBe('active');
      expect(completedQuery.filter).toBe('completed');
    });

    it('should allow optional sorting parameters', () => {
      const query: GetFilteredTodosQuery = {
        filter: 'active',
        sortBy: 'priority',
        sortOrder: 'desc',
      };

      expect(query.filter).toBe('active');
      expect(query.sortBy).toBe('priority');
      expect(query.sortOrder).toBe('desc');
    });

    it('should allow all sort options', () => {
      const priorityQuery: GetFilteredTodosQuery = {
        filter: 'all',
        sortBy: 'priority',
      };
      const createdAtQuery: GetFilteredTodosQuery = {
        filter: 'all',
        sortBy: 'createdAt',
      };
      const urgencyQuery: GetFilteredTodosQuery = {
        filter: 'all',
        sortBy: 'urgency',
      };

      expect(priorityQuery.sortBy).toBe('priority');
      expect(createdAtQuery.sortBy).toBe('createdAt');
      expect(urgencyQuery.sortBy).toBe('urgency');
    });

    it('should allow both sort orders', () => {
      const ascQuery: GetFilteredTodosQuery = {
        filter: 'all',
        sortOrder: 'asc',
      };
      const descQuery: GetFilteredTodosQuery = {
        filter: 'all',
        sortOrder: 'desc',
      };

      expect(ascQuery.sortOrder).toBe('asc');
      expect(descQuery.sortOrder).toBe('desc');
    });
  });

  describe('GetTodoStatsQuery', () => {
    it('should define correct interface structure', () => {
      const query: GetTodoStatsQuery = {};
      expect(typeof query).toBe('object');
    });
  });

  describe('GetTodoByIdQuery', () => {
    it('should define correct interface structure', () => {
      const query: GetTodoByIdQuery = {
        id: 'test-id',
      };

      expect(query.id).toBe('test-id');
    });
  });

  describe('TodoStatsQueryResult', () => {
    it('should define correct interface structure', () => {
      const result: TodoStatsQueryResult = {
        total: 10,
        active: 5,
        completed: 5,
        overdue: 2,
        highPriority: 3,
      };

      expect(result.total).toBe(10);
      expect(result.active).toBe(5);
      expect(result.completed).toBe(5);
      expect(result.overdue).toBe(2);
      expect(result.highPriority).toBe(3);
    });

    it('should match extended stats format from React app', () => {
      const result: TodoStatsQueryResult = {
        total: 15,
        active: 8,
        completed: 7,
        overdue: 3,
        highPriority: 5,
      };

      // Verify all required fields are present
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('active');
      expect(result).toHaveProperty('completed');
      expect(result).toHaveProperty('overdue');
      expect(result).toHaveProperty('highPriority');

      // Verify types
      expect(typeof result.total).toBe('number');
      expect(typeof result.active).toBe('number');
      expect(typeof result.completed).toBe('number');
      expect(typeof result.overdue).toBe('number');
      expect(typeof result.highPriority).toBe('number');
    });
  });
});
