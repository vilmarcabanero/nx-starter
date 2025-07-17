import { Todo } from '../entities/Todo';

/**
 * Domain Service for Todo Business Logic
 * Contains business rules that don't naturally fit in a single entity
 */
export class TodoDomainService {
  /**
   * Determines if a todo should be considered overdue
   */
  static isOverdue(todo: Todo, currentDate: Date = new Date()): boolean {
    if (todo.completed) return false;

    const daysSinceCreation = Math.floor(
      (currentDate.getTime() - todo.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceCreation > 7;
  }

  /**
   * Calculates todo urgency score based on priority and age
   */
  static calculateUrgencyScore(
    todo: Todo,
    currentDate: Date = new Date()
  ): number {
    if (todo.completed) return 0;

    const daysSinceCreation = Math.floor(
      (currentDate.getTime() - todo.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const priorityWeight = todo.priority?.numericValue || 2;
    const ageWeight = Math.min(daysSinceCreation / 7, 3); // Max 3x multiplier for age

    return priorityWeight * (1 + ageWeight);
  }

  /**
   * Validates business rules for todo completion
   */
  static canComplete(todo: Todo): { canComplete: boolean; reason?: string } {
    if (todo.completed) {
      return { canComplete: false, reason: 'Todo is already completed' };
    }

    return { canComplete: true };
  }

  /**
   * Sorts todos by business priority (urgency score)
   */
  static sortByPriority(todos: Todo[], currentDate: Date = new Date()): Todo[] {
    return [...todos].sort((a, b) => {
      // Completed todos go to bottom
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1;
      }

      // Sort by urgency score (highest first)
      const scoreA = this.calculateUrgencyScore(a, currentDate);
      const scoreB = this.calculateUrgencyScore(b, currentDate);

      return scoreB - scoreA;
    });
  }
}
