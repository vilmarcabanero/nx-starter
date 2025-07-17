/**
 * Test helper utilities for generating valid test data
 */

/**
 * Generates a valid 32-character hex UUID for testing
 * Uses predictable patterns for consistent test results
 */
export function generateTestUuid(seed: number = 1): string {
  // Ensure we get exactly 32 hex characters
  const hexSeed = seed.toString(16).padStart(8, '0');
  // Create a repeating pattern to fill 32 characters
  const pattern = hexSeed.repeat(4).slice(0, 32);
  return pattern;
}

/**
 * Creates a sequence of test UUIDs for bulk test data
 */
export function generateTestUuids(count: number, startSeed: number = 1): string[] {
  return Array.from({ length: count }, (_, index) => 
    generateTestUuid(startSeed + index)
  );
}

/**
 * Common test UUIDs for consistent testing
 */
export const TEST_UUIDS = {
  TODO_1: 'a1b2c3d4e5f6789012345678901234ab',
  TODO_2: 'b2c3d4e5f6789012345678901234abc1', 
  TODO_3: 'c3d4e5f6789012345678901234abcd12',
  TODO_4: 'd4e5f6789012345678901234abcde123',
  TODO_5: 'e5f6789012345678901234abcdef1234',
} as const;

/**
 * Validates that a string is a valid 32-character hex UUID
 */
export function isValidTestUuid(uuid: string): boolean {
  return /^[0-9a-f]{32}$/i.test(uuid);
}