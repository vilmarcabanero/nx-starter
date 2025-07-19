/**
 * Common TypeScript types
 * TODO: Define common types for the application
 */

// TODO: Add common TypeScript types here
export type ID = string;

export type Status = 'pending' | 'completed' | 'in_progress';

export interface BaseEntity {
  id: ID;
  createdAt: Date;
  updatedAt: Date;
}
