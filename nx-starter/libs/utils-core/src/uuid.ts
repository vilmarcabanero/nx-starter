import { v4 as uuidv4 } from 'uuid';

/**
 * Generates a unique identifier for entities
 * Returns UUID without dashes
 */
export const generateId = (): string => {
  return uuidv4().replace(/-/g, '');
};

export const generateUUID = (): string => {
  return generateId();
};

export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{32}$/i;
  return uuidRegex.test(uuid);
};
