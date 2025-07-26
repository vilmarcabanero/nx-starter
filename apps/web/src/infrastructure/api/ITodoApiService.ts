import {
  TodoListResponse,
  TodoResponse,
  CreateTodoRequestDto,
  UpdateTodoRequestDto,
} from '@nx-starter/application-shared';

export interface ITodoApiService {
  getAllTodos(): Promise<TodoListResponse>;
  createTodo(todoData: CreateTodoRequestDto): Promise<TodoResponse>;
  updateTodo(id: string, updateData: UpdateTodoRequestDto): Promise<void>;
  deleteTodo(id: string): Promise<void>;
  getTodoById(id: string): Promise<TodoResponse>;
  getActiveTodos(): Promise<TodoListResponse>;
  getCompletedTodos(): Promise<TodoListResponse>;
}