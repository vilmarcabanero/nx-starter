import { describe, it, expect } from 'vitest';
import { Todo } from './Todo';
import { TodoTitle } from '@/core/domain/todo/value-objects/TodoTitle';
import { TodoId } from '@/core/domain/todo/value-objects/TodoId';
import { TodoAlreadyCompletedException } from '@/core/domain/todo/exceptions/DomainExceptions';

describe('Todo Entity', () => {
  describe('Constructor', () => {
    it('should create a todo with default values', () => {
      const todo = new Todo('Test todo');
      
      expect(todo.title.value).toBe('Test todo');
      expect(todo.completed).toBe(false);
      expect(todo.createdAt).toBeInstanceOf(Date);
      expect(todo.id).toBeUndefined();
      expect(todo.priority.level).toBe('medium');
      expect(todo.dueDate).toBeUndefined();
    });

    it('should create a todo with all parameters', () => {
      const createdAt = new Date('2023-01-01');
      const dueDate = new Date('2023-01-02');
      const todo = new Todo('Test todo', true, createdAt, 1, 'high', dueDate);
      
      expect(todo.title.value).toBe('Test todo');
      expect(todo.completed).toBe(true);
      expect(todo.createdAt).toBe(createdAt);
      expect(todo.id?.value).toBe(1);
      expect(todo.priority.level).toBe('high');
      expect(todo.dueDate).toBe(dueDate);
    });

    it('should accept TodoTitle instance as title', () => {
      const title = new TodoTitle('Test todo');
      const todo = new Todo(title);
      
      expect(todo.title).toBe(title);
    });

    it('should accept TodoId instance as id', () => {
      const id = new TodoId(42);
      const todo = new Todo('Test todo', false, new Date(), id);
      
      expect(todo.id).toBe(id);
    });
  });

  describe('Getters', () => {
    it('should return numeric id', () => {
      const todo = new Todo('Test todo', false, new Date(), 123);
      expect(todo.numericId).toBe(123);
    });

    it('should return undefined for numeric id when no id', () => {
      const todo = new Todo('Test todo');
      expect(todo.numericId).toBeUndefined();
    });

    it('should return title value', () => {
      const todo = new Todo('Test todo');
      expect(todo.titleValue).toBe('Test todo');
    });
  });

  describe('Domain Methods', () => {
    it('should toggle completion status', () => {
      const todo = new Todo('Test todo');
      const toggledTodo = todo.toggle();
      
      expect(toggledTodo.completed).toBe(true);
      expect(toggledTodo.title.value).toBe('Test todo');
    });

    it('should update title with string', () => {
      const todo = new Todo('Original title');
      const updatedTodo = todo.updateTitle('New title');
      
      expect(updatedTodo.title.value).toBe('New title');
      expect(updatedTodo.completed).toBe(false);
    });

    it('should update title with TodoTitle instance', () => {
      const todo = new Todo('Original title');
      const newTitle = new TodoTitle('New title');
      const updatedTodo = todo.updateTitle(newTitle);
      
      expect(updatedTodo.title).toBe(newTitle);
    });

    it('should update priority', () => {
      const todo = new Todo('Test todo');
      const updatedTodo = todo.updatePriority('high');
      
      expect(updatedTodo.priority.level).toBe('high');
      expect(updatedTodo.title.value).toBe('Test todo');
    });

    it('should update due date', () => {
      const todo = new Todo('Test todo');
      const dueDate = new Date('2023-12-31');
      const updatedTodo = todo.updateDueDate(dueDate);
      
      expect(updatedTodo.dueDate).toBe(dueDate);
      expect(updatedTodo.title.value).toBe('Test todo');
    });

    it('should handle due date updates correctly', () => {
      // Test setting a due date on todo without one
      const todoWithoutDueDate = new Todo('Test todo');
      const dueDate = new Date('2023-12-31');
      const withDueDate = todoWithoutDueDate.updateDueDate(dueDate);
      expect(withDueDate.dueDate).toBe(dueDate);
      
      // Test updating existing due date
      const newDueDate = new Date('2024-01-01');
      const updatedDueDate = withDueDate.updateDueDate(newDueDate);
      expect(updatedDueDate.dueDate).toBe(newDueDate);
    });
  });

  describe('Business Logic', () => {
    describe('canBeCompleted', () => {
      it('should return true for incomplete todo', () => {
        const todo = new Todo('Test todo', false);
        expect(todo.canBeCompleted()).toBe(true);
      });

      it('should return false for completed todo', () => {
        const todo = new Todo('Test todo', true);
        expect(todo.canBeCompleted()).toBe(false);
      });
    });

    describe('complete', () => {
      it('should complete an incomplete todo', () => {
        const todo = new Todo('Test todo', false);
        const completedTodo = todo.complete();
        
        expect(completedTodo.completed).toBe(true);
        expect(completedTodo.title.value).toBe('Test todo');
      });

      it('should throw error when trying to complete already completed todo', () => {
        const todo = new Todo('Test todo', true);
        
        expect(() => todo.complete()).toThrow(TodoAlreadyCompletedException);
      });
    });

    describe('equals', () => {
      it('should return true for todos with same id', () => {
        const todo1 = new Todo('Test todo 1', false, new Date(), 1);
        const todo2 = new Todo('Test todo 2', true, new Date(), 1);
        
        expect(todo1.equals(todo2)).toBe(true);
      });

      it('should return false for todos with different ids', () => {
        const todo1 = new Todo('Test todo', false, new Date(), 1);
        const todo2 = new Todo('Test todo', false, new Date(), 2);
        
        expect(todo1.equals(todo2)).toBe(false);
      });

      it('should return false when one todo has no id', () => {
        const todo1 = new Todo('Test todo', false, new Date(), 1);
        const todo2 = new Todo('Test todo', false, new Date());
        
        expect(todo1.equals(todo2)).toBe(false);
      });

      it('should return false when both todos have no id', () => {
        const todo1 = new Todo('Test todo 1');
        const todo2 = new Todo('Test todo 2');
        
        expect(todo1.equals(todo2)).toBe(false);
      });
    });

    describe('isOverdue', () => {
      it('should return false for completed todos regardless of dates', () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 8);
        
        const completedTodo = new Todo('Completed old todo', true, oldDate);
        expect(completedTodo.isOverdue()).toBe(false);
      });

      it('should return true for todos with past due dates', () => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() - 1); // Yesterday
        
        const todo = new Todo('Test todo', false, new Date(), undefined, 'medium', dueDate);
        expect(todo.isOverdue()).toBe(true);
      });

      it('should return false for todos with future due dates', () => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 1); // Tomorrow
        
        const todo = new Todo('Test todo', false, new Date(), undefined, 'medium', dueDate);
        expect(todo.isOverdue()).toBe(false);
      });

      it('should return true for old todos without due date (> 7 days)', () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 8); // 8 days ago
        
        const todo = new Todo('Old todo', false, oldDate);
        expect(todo.isOverdue()).toBe(true);
      });

      it('should return false for recent todos without due date (< 7 days)', () => {
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 6); // 6 days ago
        
        const todo = new Todo('Recent todo', false, recentDate);
        expect(todo.isOverdue()).toBe(false);
      });
    });
  });

  describe('validate method', () => {
    it('should throw error for empty title', () => {
      const todo = new Todo('Test');
      
      (todo as any)._title = { value: '' };
      
      expect(() => todo.validate()).toThrow('Todo must have a valid title');
    });

    it('should throw error for title with only whitespace', () => {
      const todo = new Todo('Test');
      
      (todo as any)._title = { value: '   ' };
      
      expect(() => todo.validate()).toThrow('Todo must have a valid title');
    });

    it('should throw error for undefined title', () => {
      const todo = new Todo('Test');
      
      (todo as any)._title = undefined;
      
      expect(() => todo.validate()).toThrow('Todo must have a valid title');
    });

    it('should throw error when due date is before creation date', () => {
      const createdAt = new Date();
      const dueDate = new Date(createdAt.getTime() - 1000); // 1 second before
      
      const todo = new Todo('Test');
      
      (todo as any)._createdAt = createdAt;
      
      (todo as any)._dueDate = dueDate;
      
      expect(() => todo.validate()).toThrow('Due date cannot be before creation date');
    });

    it('should pass validation for valid todo', () => {
      const todo = new Todo('Valid todo');
      expect(() => todo.validate()).not.toThrow();
    });

    it('should pass validation for todo with valid due date', () => {
      const createdAt = new Date();
      const dueDate = new Date(createdAt.getTime() + 1000); // 1 second after
      
      const todo = new Todo('Test');
      
      (todo as any)._createdAt = createdAt;
      
      (todo as any)._dueDate = dueDate;
      
      expect(() => todo.validate()).not.toThrow();
    });
  });
});