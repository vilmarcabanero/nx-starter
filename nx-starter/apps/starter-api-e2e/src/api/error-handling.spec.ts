import axios from 'axios';
import { ApiHelper, expectApiError } from '../utils/api-helpers';

describe('Error Handling', () => {
  it('should handle 404 for unknown routes', async () => {
    const res = await ApiHelper.safeRequest(() => axios.get('/api/unknown'));

    expectApiError(res, 404, 'Not found');
  });

  it('should handle invalid JSON in request body', async () => {
    try {
      await axios.post('/api/todos', 'invalid json', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error: any) {
      expect(error.response.status).toBe(400);
    }
  });

  it('should handle malformed todo ID', async () => {
    const res = await ApiHelper.safeRequest(() => axios.get('/api/todos/invalid-id'));

    expectApiError(res, 404, 'Todo with ID invalid-id not found');
  });

  it('should handle PUT request with invalid data', async () => {
    const res = await ApiHelper.safeRequest(() => axios.put('/api/todos/nonexistent-id', {
      title: 'x', // Too short
    }));

    expectApiError(res, 400);
  });

  it('should handle PATCH request on non-existent todo', async () => {
    const res = await ApiHelper.safeRequest(() => axios.patch('/api/todos/nonexistent-id/toggle'));

    expectApiError(res, 404, 'Todo with ID nonexistent-id not found');
  });

  it('should handle DELETE request on non-existent todo', async () => {
    const res = await ApiHelper.safeRequest(() => axios.delete('/api/todos/nonexistent-id'));

    expectApiError(res, 404, 'Todo with ID nonexistent-id not found');
  });
});