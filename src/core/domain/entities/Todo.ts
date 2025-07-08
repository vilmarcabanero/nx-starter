interface ITodo {
  id?: number;
  title: string;
  completed: boolean;
  createdAt: Date;
}

export class Todo implements ITodo {
  constructor(
    public title: string,
    public completed = false,
    public createdAt = new Date(),
    public id?: number
  ) {}

  // Domain business logic methods
  toggle(): Todo {
    return new Todo(this.title, !this.completed, this.createdAt, this.id);
  }

  updateTitle(newTitle: string): Todo {
    return new Todo(newTitle, this.completed, this.createdAt, this.id);
  }

  isOverdue(): boolean {
    // Example: todos are overdue after 7 days if not completed
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return !this.completed && this.createdAt < sevenDaysAgo;
  }
}

export type { ITodo };
