import { createAsyncThunk } from '@reduxjs/toolkit';
import { Todo } from '../../domain/entities/Todo';
import { TodoRepository } from '../../infrastructure/db/TodoRepository';

const todoRepository = new TodoRepository();

export const fetchTodosThunk = createAsyncThunk(
  'todos/fetchTodos',
  async () => {
    return await todoRepository.getAll();
  }
);

export const createTodoThunk = createAsyncThunk(
  'todos/createTodo',
  async (title: string) => {
    const todo = new Todo(title);
    const id = await todoRepository.create(todo);
    return new Todo(todo.title, todo.completed, todo.createdAt, id);
  }
);

export const updateTodoThunk = createAsyncThunk(
  'todos/updateTodo',
  async ({ id, changes }: { id: number; changes: Partial<Todo> }) => {
    await todoRepository.update(id, changes);
    const updatedTodo = await todoRepository.getById(id);
    if (!updatedTodo) {
      throw new Error('Todo not found after update');
    }
    return updatedTodo;
  }
);

export const deleteTodoThunk = createAsyncThunk(
  'todos/deleteTodo',
  async (id: number) => {
    await todoRepository.delete(id);
    return id;
  }
);

export const toggleTodoThunk = createAsyncThunk(
  'todos/toggleTodo',
  async (id: number) => {
    const todo = await todoRepository.getById(id);
    if (!todo) {
      throw new Error('Todo not found');
    }
    const toggledTodo = todo.toggle();
    await todoRepository.update(id, { completed: toggledTodo.completed });
    return new Todo(toggledTodo.title, toggledTodo.completed, toggledTodo.createdAt, id);
  }
);
