/**
 * Test helper utilities for generating valid test data
 * Provides centralized, consistent test UUID management for the entire monorepo
 */

/**
 * Generates a valid 32-character hex UUID for testing
 * Uses predictable patterns for consistent test results
 */
export function generateTestUuid(seed = 1): string {
  // Ensure we get exactly 32 hex characters
  const hexSeed = seed.toString(16).padStart(8, '0');
  // Create a repeating pattern to fill 32 characters
  const pattern = hexSeed.repeat(4).slice(0, 32);
  return pattern;
}

/**
 * Creates a sequence of test UUIDs for bulk test data
 */
export function generateTestUuids(count: number, startSeed = 1): string[] {
  return Array.from({ length: count }, (_, index) => 
    generateTestUuid(startSeed + index)
  );
}

/**
 * Common test UUIDs for consistent testing across the application
 * These provide predictable, collision-free UUIDs for different test scenarios
 */
export const TEST_UUIDS = {
  // Service layer test UUIDs
  TODO_1: generateTestUuid(1),   // '00000001000000010000000100000001'
  TODO_2: generateTestUuid(2),   // '00000002000000020000000200000002'
  TODO_3: generateTestUuid(3),   // '00000003000000030000000300000003'
  TODO_4: generateTestUuid(4),   // '00000004000000040000000400000004'
  TODO_5: generateTestUuid(5),   // '00000005000000050000000500000005'
  
  // Use case test UUIDs
  CREATE_TODO: generateTestUuid(10),
  UPDATE_TODO: generateTestUuid(11),
  DELETE_TODO: generateTestUuid(12),
  TOGGLE_TODO: generateTestUuid(13),
  
  // Query handler test UUIDs
  QUERY_TODO_1: generateTestUuid(20),
  QUERY_TODO_2: generateTestUuid(21),
  QUERY_TODO_3: generateTestUuid(22),
  
  // Mapper test UUIDs
  MAPPER_TODO_1: generateTestUuid(30),
  MAPPER_TODO_2: generateTestUuid(31),
  MAPPER_TODO_3: generateTestUuid(32),
  
  // Repository test UUIDs
  REPO_TODO_1: generateTestUuid(40),
  REPO_TODO_2: generateTestUuid(41),
  REPO_TODO_3: generateTestUuid(42),
  
  // Edge case test UUIDs
  NONEXISTENT_TODO: generateTestUuid(99),
  INVALID_TODO: generateTestUuid(100),
} as const;

/**
 * Validates that a string is a valid 32-character hex UUID
 */
export function isValidTestUuid(uuid: string): boolean {
  return /^[0-9a-f]{32}$/i.test(uuid);
}

/**
 * Creates test UUIDs with specific prefixes for categorization
 * Useful for organizing test data by functionality
 */
export function createCategorizedTestUuid(category: string, id: number): string {
  const categoryCode = category.substring(0, 2).toLowerCase();
  const paddedId = id.toString().padStart(6, '0');
  const pattern = `${categoryCode}${paddedId}`;
  return pattern.repeat(4).slice(0, 32);
}