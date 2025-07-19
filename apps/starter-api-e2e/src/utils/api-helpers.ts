import axios, { AxiosResponse } from 'axios';

export interface TodoData {
  title: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Todo extends TodoData {
  id: string;
  completed: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class ApiHelper {
  /**
   * Creates a new todo and returns the created todo data
   */
  static async createTodo(todoData: TodoData): Promise<Todo> {
    const response = await axios.post('/api/todos', todoData);
    return response.data.data;
  }

  /**
   * Gets a todo by ID
   */
  static async getTodo(id: string): Promise<Todo> {
    const response = await axios.get(`/api/todos/${id}`);
    return response.data.data;
  }

  /**
   * Updates a todo by ID
   */
  static async updateTodo(id: string, updateData: Partial<TodoData>): Promise<void> {
    await axios.put(`/api/todos/${id}`, updateData);
  }

  /**
   * Toggles todo completion status
   */
  static async toggleTodo(id: string): Promise<void> {
    await axios.patch(`/api/todos/${id}/toggle`);
  }

  /**
   * Deletes a todo by ID
   */
  static async deleteTodo(id: string): Promise<void> {
    await axios.delete(`/api/todos/${id}`);
  }

  /**
   * Gets all todos
   */
  static async getAllTodos(): Promise<Todo[]> {
    const response = await axios.get('/api/todos');
    return response.data.data;
  }

  /**
   * Gets todo statistics
   */
  static async getTodoStats(): Promise<{ total: number; active: number; completed: number }> {
    const response = await axios.get('/api/todos/stats');
    return response.data.data;
  }

  /**
   * Gets active todos
   */
  static async getActiveTodos(): Promise<Todo[]> {
    const response = await axios.get('/api/todos/active');
    return response.data.data;
  }

  /**
   * Gets completed todos
   */
  static async getCompletedTodos(): Promise<Todo[]> {
    const response = await axios.get('/api/todos/completed');
    return response.data.data;
  }

  /**
   * Safely makes a request and returns the response without throwing on error status
   */
  static async safeRequest<T = any>(
    requestFn: () => Promise<AxiosResponse<T>>
  ): Promise<AxiosResponse<T>> {
    try {
      return await requestFn();
    } catch (error: any) {
      if (error.response) {
        return error.response;
      }
      throw error;
    }
  }

  /**
   * Cleans up test data by deleting all todos
   */
  static async cleanupTodos(): Promise<void> {
    const todos = await this.getAllTodos();
    await Promise.all(todos.map(todo => this.deleteTodo(todo.id)));
  }
}

export const expectApiError = (response: AxiosResponse, expectedStatus: number, expectedError?: string) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.data).toMatchObject({
    success: false,
    error: expectedError || expect.any(String),
  });
};

export const expectApiSuccess = (response: AxiosResponse, expectedData?: any) => {
  expect(response.status).toBeLessThan(400);
  expect(response.data).toMatchObject({
    success: true,
    ...(expectedData && { data: expectedData }),
  });
};