import { test } from '../../src/fixtures/api.fixture';
import { apiContext } from '../../src/helpers/api-context.helper';
import { ResponseValidator } from '../../src/validators/response.validator';

test.describe('Ping - HealthCheck', () => {
  test(
    'returns 201 Created with body "Created"',
    { tag: ['@regression', '@healthcheck'] },
    async ({ pingClient }) => {
      const context = apiContext('ping health check', 'GET', '/ping');

      const response = await test.step('Send GET /ping', async () => pingClient.ping());

      await test.step('Assert status and body', async () => {
        await ResponseValidator.assertExactStatus(response, context, 201);
        await ResponseValidator.assertBodyEquals(response, context, 'Created');
      });
    },
  );
});
