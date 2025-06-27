import { Todo } from '../../domain/entities/Todo';
import type { ITodoRepository } from '../../domain/repositories/ITodoRepository';

export class TodoService {
  constructor(private repository: ITodoRepository) {}

  async getAllTodos(): Promise<Todo[]> {
    return await this.repository.getAll();
  }

  async createTodo(title: string): Promise<Todo> {
    if (!title.trim()) {
      throw new Error('Todo title cannot be empty');
    }
    
    const todo = new Todo(title.trim());
    const id = await this.repository.create(todo);
    return new Todo(todo.title, todo.completed, todo.createdAt, id);
  }

  async updateTodo(id: number, changes: Partial<Todo>): Promise<Todo> {
    const existingTodo = await this.repository.getById(id);
    if (!existingTodo) {
      throw new Error('Todo not found');
    }

    if (changes.title !== undefined && !changes.title.trim()) {
      throw new Error('Todo title cannot be empty');
    }

    await this.repository.update(id, changes);
    const updatedTodo = await this.repository.getById(id);
    if (!updatedTodo) {
      throw new Error('Todo not found after update');
    }
    return updatedTodo;
  }

  async deleteTodo(id: number): Promise<void> {
    const existingTodo = await this.repository.getById(id);
    if (!existingTodo) {
      throw new Error('Todo not found');
    }
    await this.repository.delete(id);
  }

  async toggleTodo(id: number): Promise<Todo> {
    const todo = await this.repository.getById(id);
    if (!todo) {
      throw new Error('Todo not found');
    }
    
    const toggledTodo = todo.toggle();
    await this.repository.update(id, { completed: toggledTodo.completed });
    return new Todo(toggledTodo.title, toggledTodo.completed, toggledTodo.createdAt, id);
  }

  async getActiveTodos(): Promise<Todo[]> {
    return await this.repository.getActive();
  }

  async getCompletedTodos(): Promise<Todo[]> {
    return await this.repository.getCompleted();
  }

  async getTodoStats(): Promise<{ total: number; active: number; completed: number }> {
    const [all, active, completed] = await Promise.all([
      this.repository.getAll(),
      this.repository.getActive(),
      this.repository.getCompleted()
    ]);

    return {
      total: all.length,
      active: active.length,
      completed: completed.length
    };
  }
}
