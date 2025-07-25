import { describe, it, expect } from 'vitest';
import { ApiResponseBuilder } from './ApiResponse';

describe('ApiResponseBuilder', () => {
  describe('success', () => {
    it('should create a successful response with data', () => {
      const testData = { id: 1, name: 'Test' };
      const response = ApiResponseBuilder.success(testData);

      expect(response).toEqual({
        success: true,
        data: testData,
      });
    });

    it('should handle string data', () => {
      const testData = 'Hello World';
      const response = ApiResponseBuilder.success(testData);

      expect(response).toEqual({
        success: true,
        data: testData,
      });
    });

    it('should handle array data', () => {
      const testData = [1, 2, 3];
      const response = ApiResponseBuilder.success(testData);

      expect(response).toEqual({
        success: true,
        data: testData,
      });
    });

    it('should handle null data', () => {
      const response = ApiResponseBuilder.success(null);

      expect(response).toEqual({
        success: true,
        data: null,
      });
    });

    it('should handle undefined data', () => {
      const response = ApiResponseBuilder.success(undefined);

      expect(response).toEqual({
        success: true,
        data: undefined,
      });
    });

    it('should handle complex nested objects', () => {
      const testData = {
        user: {
          id: 1,
          profile: {
            name: 'John',
            settings: {
              theme: 'dark',
              notifications: true,
            },
          },
        },
        todos: [
          { id: 1, title: 'Task 1', completed: false },
          { id: 2, title: 'Task 2', completed: true },
        ],
      };
      
      const response = ApiResponseBuilder.success(testData);

      expect(response).toEqual({
        success: true,
        data: testData,
      });
      expect(response.success).toBe(true);
      expect(response.data.user.profile.name).toBe('John');
      expect(response.data.todos).toHaveLength(2);
    });
  });

  describe('successWithMessage', () => {
    it('should create a successful response with a message', () => {
      const message = 'Operation completed successfully';
      const response = ApiResponseBuilder.successWithMessage(message);

      expect(response).toEqual({
        success: true,
        message,
      });
    });

    it('should handle empty message', () => {
      const response = ApiResponseBuilder.successWithMessage('');

      expect(response).toEqual({
        success: true,
        message: '',
      });
    });

    it('should handle long messages', () => {
      const longMessage = 'This is a very long message that might be used for detailed success feedback to users about complex operations that have been completed successfully.';
      const response = ApiResponseBuilder.successWithMessage(longMessage);

      expect(response).toEqual({
        success: true,
        message: longMessage,
      });
    });
  });

  describe('error', () => {
    it('should create an error response with only error message', () => {
      const error = 'Something went wrong';
      const response = ApiResponseBuilder.error(error);

      expect(response).toEqual({
        success: false,
        error,
      });
    });

    it('should create an error response with error and message', () => {
      const error = 'Validation failed';
      const message = 'Please check your input data';
      const response = ApiResponseBuilder.error(error, message);

      expect(response).toEqual({
        success: false,
        error,
        message,
      });
    });

    it('should handle empty error string', () => {
      const response = ApiResponseBuilder.error('');

      expect(response).toEqual({
        success: false,
        error: '',
      });
    });

    it('should handle empty error with message', () => {
      const message = 'Additional details';
      const response = ApiResponseBuilder.error('', message);

      expect(response).toEqual({
        success: false,
        error: '',
        message,
      });
    });

    it('should not include message property when message is undefined', () => {
      const error = 'Error occurred';
      const response = ApiResponseBuilder.error(error, undefined);

      expect(response).toEqual({
        success: false,
        error,
      });
      expect(response).not.toHaveProperty('message');
    });

    it('should not include message property when message is empty string', () => {
      const error = 'Error occurred';
      const response = ApiResponseBuilder.error(error, '');

      expect(response).toEqual({
        success: false,
        error,
      });
      expect(response).not.toHaveProperty('message');
    });
  });

  describe('type safety', () => {
    it('should maintain proper typing for generic success responses', () => {
      interface User {
        id: number;
        name: string;
        email: string;
      }

      const user: User = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
      };

      const response = ApiResponseBuilder.success(user);
      
      // TypeScript should infer the correct type
      expect(response.success).toBe(true);
      expect(response.data.id).toBe(1);
      expect(response.data.name).toBe('John Doe');
      expect(response.data.email).toBe('john@example.com');
    });

    it('should work with arrays of typed objects', () => {
      interface Todo {
        id: number;
        title: string;
        completed: boolean;
      }

      const todos: Todo[] = [
        { id: 1, title: 'Task 1', completed: false },
        { id: 2, title: 'Task 2', completed: true },
      ];

      const response = ApiResponseBuilder.success(todos);
      
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data).toHaveLength(2);
      expect(response.data[0].title).toBe('Task 1');
    });
  });
});