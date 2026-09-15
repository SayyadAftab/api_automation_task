import { test, expect } from '../../src/fixtures/api.fixture';
import { ResponseValidator } from '../../src/validators/response.validator';

test.describe('Ping - HealthCheck', () => {
  test('returns 201 Created with body "Created"', async ({ pingClient }) => {
    const context = { testName: 'ping health check', method: 'GET', endpoint: '/ping' };
    const response = await pingClient.ping();

    ResponseValidator.assertExactStatus(response, context, 201);
    await expect(response.text()).resolves.toBe('Created');
  });
});
