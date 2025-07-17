import { injectable } from 'tsyringe';
import { Todo } from '@/core/domain/todo/entities/Todo';
import { type TodoPriorityLevel } from '@/core/domain/todo/value-objects/TodoPriority';
import { type Specification } from '@/core/domain/shared/specifications/Specification';
import type { ITodoRepository } from '@/core/domain/todo/repositories/ITodoRepository';

/**
 * API-based TodoRepository implementation
 * Communicates with the Express server's /api/todos endpoints
 */
@injectable()
export class ApiTodoRepository implements ITodoRepository {
  private readonly baseUrl: string;

  constructor() {
    // Get API base URL from environment variable or default to localhost
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
  }

  async getAll(): Promise<Todo[]> {
    const response = await this.fetchWithErrorHandling(`${this.baseUrl}/api/todos`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to fetch todos');
    }
    
    return data.data.map((dto: any) => this.mapDtoToTodo(dto));
  }

  async create(todo: Todo): Promise<string> {
    const todoData = {
      title: todo.titleValue,
      priority: todo.priority.level,
      dueDate: todo.dueDate?.toISOString()
    };

    const response = await this.fetchWithErrorHandling(`${this.baseUrl}/api/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });

    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to create todo');
    }
    
    return data.data.id;
  }

  async update(id: string, changes: Partial<Todo>): Promise<void> {
    const updateData: any = {};
    
    if (changes.title) {
      updateData.title = changes.title instanceof Object && 'value' in changes.title 
        ? changes.title.value 
        : changes.title;
    }
    if (changes.completed !== undefined) {
      updateData.completed = changes.completed;
    }
    if (changes.priority) {
      updateData.priority = changes.priority instanceof Object && 'level' in changes.priority
        ? changes.priority.level
        : changes.priority;
    }
    if ('dueDate' in changes) {
      updateData.dueDate = changes.dueDate?.toISOString();
    }

    const response = await this.fetchWithErrorHandling(`${this.baseUrl}/api/todos/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error('Failed to update todo');
    }
  }

  async delete(id: string): Promise<void> {
    const response = await this.fetchWithErrorHandling(`${this.baseUrl}/api/todos/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete todo');
    }
  }

  async getById(id: string): Promise<Todo | undefined> {
    try {
      const response = await this.fetchWithErrorHandling(`${this.baseUrl}/api/todos/${id}`);
      
      if (response.status === 404) {
        return undefined;
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Failed to fetch todo');
      }
      
      return this.mapDtoToTodo(data.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }
      throw error;
    }
  }

  async getActive(): Promise<Todo[]> {
    const response = await this.fetchWithErrorHandling(`${this.baseUrl}/api/todos/active`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to fetch active todos');
    }
    
    return data.data.map((dto: any) => this.mapDtoToTodo(dto));
  }

  async getCompleted(): Promise<Todo[]> {
    const response = await this.fetchWithErrorHandling(`${this.baseUrl}/api/todos/completed`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to fetch completed todos');
    }
    
    return data.data.map((dto: any) => this.mapDtoToTodo(dto));
  }

  async findBySpecification(specification: Specification<Todo>): Promise<Todo[]> {
    // For API-based repository, we'll fetch all todos and filter client-side
    // In a production app, you might want to send the specification to the server
    const allTodos = await this.getAll();
    return allTodos.filter(todo => specification.isSatisfiedBy(todo));
  }

  /**
   * Maps a DTO from the API to a Todo entity
   */
  private mapDtoToTodo(dto: any): Todo {
    return new Todo(
      dto.title,
      dto.completed,
      new Date(dto.createdAt),
      dto.id,
      (dto.priority || 'medium') as TodoPriorityLevel,
      dto.dueDate ? new Date(dto.dueDate) : undefined
    );
  }

  /**
   * Wrapper around fetch with error handling
   */
  private async fetchWithErrorHandling(url: string, options?: RequestInit): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      // Don't throw for 404 in GET requests - let caller handle it
      if (!response.ok && !(response.status === 404 && options?.method === undefined)) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return response;
    } catch (error) {
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to the API server');
      }
      throw error;
    }
  }
}