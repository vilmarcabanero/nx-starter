import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a UUID string without dashes
 * @returns A 32-character hexadecimal string
 */
export function generateId(): string {
  return uuidv4().replace(/-/g, '');
}