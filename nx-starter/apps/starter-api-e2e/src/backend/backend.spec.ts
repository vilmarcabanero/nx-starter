import axios from 'axios';

describe('API Server', () => {
  describe('GET /', () => {
    it('should return server information', async () => {
      const res = await axios.get('/');

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        success: true,
        message: 'Task App API Server',
        version: '1.0.0',
        environment: expect.any(String),
        database: expect.any(String),
        endpoints: {
          health: '/api/health',
          todos: '/api/todos',
          documentation: 'See README.md for API documentation',
        },
      });
    });
  });

  describe('GET /api/health', () => {
    it('should return health check', async () => {
      const res = await axios.get('/api/health');

      expect(res.status).toBe(200);
      expect(res.data).toMatchObject({
        success: true,
        message: 'Server is running',
        timestamp: expect.any(String),
      });
    });
  });
});
