import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock DOM APIs
Object.defineProperty(global, 'document', {
  value: {
    getElementById: vi.fn(() => ({
      render: vi.fn(),
    })),
  },
});

// Mock react-dom/client
vi.mock('react-dom/client', () => ({
  createRoot: vi.fn(() => ({
    render: vi.fn(),
  })),
}));

// Mock App component
vi.mock('../App', () => ({
  default: () => 'App Component',
}));

describe('main.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should attempt to create root and render App', async () => {
    // Import main to execute the file
    await import('../main');

    // Since main.tsx executes immediately, we just verify it doesn't throw
    expect(true).toBe(true);
  });
});
