import { injectable, inject } from 'tsyringe';
import {
  Todo,
  TodoPriorityLevel,
  Specification,
  ITodoRepository,
} from '@nx-starter/domain';
import {
  CreateTodoRequestDto,
  UpdateTodoRequestDto,
  TodoDto,
  TOKENS,
} from '@nx-starter/application-shared';
import { ITodoApiService } from './ITodoApiService';

/**
 * API-based TodoRepository implementation
 * Uses ITodoApiService for HTTP communication following Clean Architecture principles
 */
@injectable()
export class ApiTodoRepository implements ITodoRepository {
  constructor(
    @inject(TOKENS.TodoApiService) private readonly apiService: ITodoApiService
  ) {}

  async getAll(): Promise<Todo[]> {
    const data = await this.apiService.getAllTodos();
    return data.data.map((dto) => this.mapDtoToTodo(dto));
  }

  async create(todo: Todo): Promise<string> {
    const todoData: CreateTodoRequestDto = {
      title: todo.titleValue,
      priority: todo.priority.level,
      dueDate: todo.dueDate?.toISOString(),
    };

    const data = await this.apiService.createTodo(todoData);
    return data.data.id;
  }

  async update(id: string, changes: Partial<Todo>): Promise<void> {
    const updateData: UpdateTodoRequestDto = {};

    if (changes.title) {
      updateData.title =
        changes.title instanceof Object && 'value' in changes.title
          ? changes.title.value
          : changes.title;
    }
    if (changes.completed !== undefined) {
      updateData.completed = changes.completed;
    }
    if (changes.priority) {
      updateData.priority =
        changes.priority instanceof Object && 'level' in changes.priority
          ? changes.priority.level
          : changes.priority;
    }
    if ('dueDate' in changes) {
      updateData.dueDate = changes.dueDate?.toISOString();
    }

    await this.apiService.updateTodo(id, updateData);
  }

  async delete(id: string): Promise<void> {
    await this.apiService.deleteTodo(id);
  }

  async getById(id: string): Promise<Todo | undefined> {
    try {
      const data = await this.apiService.getTodoById(id);
      return this.mapDtoToTodo(data.data);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Todo not found')) {
        return undefined;
      }
      throw error;
    }
  }

  async getActive(): Promise<Todo[]> {
    const data = await this.apiService.getActiveTodos();
    return data.data.map((dto) => this.mapDtoToTodo(dto));
  }

  async getCompleted(): Promise<Todo[]> {
    const data = await this.apiService.getCompletedTodos();
    return data.data.map((dto) => this.mapDtoToTodo(dto));
  }

  async findBySpecification(
    specification: Specification<Todo>
  ): Promise<Todo[]> {
    // For API-based repository, we'll fetch all todos and filter client-side
    // In a production app, you might want to send the specification to the server
    const allTodos = await this.getAll();
    return allTodos.filter((todo) => specification.isSatisfiedBy(todo));
  }

  /**
   * Maps a DTO from the API to a Todo entity
   */
  private mapDtoToTodo(dto: TodoDto): Todo {
    return new Todo(
      dto.title,
      dto.completed,
      new Date(dto.createdAt),
      dto.id,
      (dto.priority || 'medium') as TodoPriorityLevel,
      dto.dueDate ? new Date(dto.dueDate) : undefined
    );
  }

}
