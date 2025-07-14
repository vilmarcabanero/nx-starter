import { describe, it, expect } from 'vitest';

describe('Core Index Exports', () => {
  it('should export domain layer', async () => {
    const domainExports = await import('./domain');
    expect(domainExports).toBeDefined();
  });

  it('should export application layer', async () => {
    const applicationExports = await import('./application');
    expect(applicationExports).toBeDefined();
  });

  it('should export infrastructure layer', async () => {
    const infrastructureExports = await import('./infrastructure');
    expect(infrastructureExports).toBeDefined();
  });

  it('should re-export all layers from main index', async () => {
    const coreExports = await import('./index');
    expect(coreExports).toBeDefined();
  });
});
