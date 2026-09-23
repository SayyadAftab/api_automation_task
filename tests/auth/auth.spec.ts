import { test } from '../../src/fixtures/api.fixture';
import { env } from '../../src/config/env';
import { apiContext } from '../../src/helpers/api-context.helper';
import { AuthValidator } from '../../src/validators/auth.validator';
import { ResponseValidator } from '../../src/validators/response.validator';

test.describe('Auth - CreateToken', () => {
  test(
    'returns token for valid credentials',
    { tag: ['@regression', '@auth'] },
    async ({ authClient }) => {
      const context = apiContext('valid credentials', 'POST', '/auth');

      const response = await test.step('Send POST /auth with valid credentials', async () =>
        authClient.postAuth({
          username: env.username,
          password: env.password,
        }),
      );

      await test.step('Assert status and token response', async () => {
        await ResponseValidator.assertExactStatus(response, context, 200);
        await ResponseValidator.assertJsonContentType(response, context);

        const body = await response.json();
        const responseBody = JSON.stringify(body);
        AuthValidator.assertSuccessToken(body, context, responseBody);
      });
    },
  );

  test(
    'returns Bad credentials for invalid login',
    { tag: ['@regression', '@auth'] },
    async ({ authClient }) => {
      const context = apiContext('invalid login', 'POST', '/auth');

      const response = await test.step('Send POST /auth with invalid credentials', async () =>
        authClient.postAuth({
          username: env.invalidUsername,
          password: env.invalidPassword,
        }),
      );

      await test.step('Assert status and failure reason', async () => {
        await ResponseValidator.assertExactStatus(response, context, 200);
        const body = await response.json();
        const responseBody = JSON.stringify(body);
        AuthValidator.assertNoToken(body as Record<string, unknown>, context, responseBody);
        AuthValidator.assertFailureReason(body, context, 'Bad credentials', responseBody);
      });
    },
  );

  test(
    'does not return token when password is missing',
    { tag: ['@regression', '@auth'] },
    async ({ authClient }) => {
      const context = apiContext('missing password', 'POST', '/auth');

      const response = await test.step('Send POST /auth without password', async () =>
        authClient.postAuth({ username: env.username }),
      );

      await test.step('Assert status and missing token', async () => {
        await ResponseValidator.assertExactStatus(response, context, 200);
        const body = await response.json();
        AuthValidator.assertNoToken(
          body as Record<string, unknown>,
          context,
          JSON.stringify(body),
        );
      });
    },
  );
});
