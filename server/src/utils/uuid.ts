import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique identifier for entities
 * Returns UUID without dashes for consistency
 */
export const generateId = (): string => {
  return uuidv4().replace(/-/g, '');
};