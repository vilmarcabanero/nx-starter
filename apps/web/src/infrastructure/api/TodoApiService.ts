import { injectable, inject } from 'tsyringe';
import { IHttpClient } from '../http/IHttpClient';
import { ITodoApiService } from './ITodoApiService';
import { getApiConfig } from './config/ApiConfig';
import {
  TodoListResponse,
  TodoResponse,
  CreateTodoRequestDto,
  UpdateTodoRequestDto,
  TOKENS,
} from '@nx-starter/application-shared';

@injectable()
export class TodoApiService implements ITodoApiService {
  private readonly apiConfig = getApiConfig();

  constructor(
    @inject(TOKENS.HttpClient) private readonly httpClient: IHttpClient
  ) {}

  async getAllTodos(): Promise<TodoListResponse> {
    const response = await this.httpClient.get<TodoListResponse>(
      this.apiConfig.endpoints.todos.all
    );
    
    if (!response.data.success) {
      throw new Error('Failed to fetch todos');
    }
    
    return response.data;
  }

  async createTodo(todoData: CreateTodoRequestDto): Promise<TodoResponse> {
    const response = await this.httpClient.post<TodoResponse>(
      this.apiConfig.endpoints.todos.base,
      todoData
    );
    
    if (!response.data.success) {
      throw new Error('Failed to create todo');
    }
    
    return response.data;
  }

  async updateTodo(id: string, updateData: UpdateTodoRequestDto): Promise<void> {
    const response = await this.httpClient.put(
      this.apiConfig.endpoints.todos.byId(id),
      updateData
    );
    
    if (response.status >= 400) {
      throw new Error('Failed to update todo');
    }
  }

  async deleteTodo(id: string): Promise<void> {
    const response = await this.httpClient.delete(
      this.apiConfig.endpoints.todos.byId(id)
    );
    
    if (response.status >= 400) {
      throw new Error('Failed to delete todo');
    }
  }

  async getTodoById(id: string): Promise<TodoResponse> {
    try {
      const response = await this.httpClient.get<TodoResponse>(
        this.apiConfig.endpoints.todos.byId(id)
      );
      
      if (response.status === 404) {
        throw new Error('Todo not found');
      }
      
      if (!response.data.success) {
        throw new Error('Failed to fetch todo');
      }
      
      return response.data;
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Todo not found');
      }
      throw error;
    }
  }

  async getActiveTodos(): Promise<TodoListResponse> {
    const response = await this.httpClient.get<TodoListResponse>(
      this.apiConfig.endpoints.todos.active
    );
    
    if (!response.data.success) {
      throw new Error('Failed to fetch active todos');
    }
    
    return response.data;
  }

  async getCompletedTodos(): Promise<TodoListResponse> {
    const response = await this.httpClient.get<TodoListResponse>(
      this.apiConfig.endpoints.todos.completed
    );
    
    if (!response.data.success) {
      throw new Error('Failed to fetch completed todos');
    }
    
    return response.data;
  }
}