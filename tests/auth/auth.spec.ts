import { test, expect } from '../../src/fixtures/api.fixture';
import { ResponseValidator } from '../../src/validators/response.validator';

test.describe('Auth - CreateToken', () => {
  test('returns token for valid credentials', async ({ authClient }) => {
    const context = { testName: 'valid credentials', method: 'POST', endpoint: '/auth' };
    const response = await authClient.postAuth({
      username: 'admin',
      password: 'password123',
    });

    ResponseValidator.assertExactStatus(response, context, 200);
    await ResponseValidator.assertJsonContentType(response, context);

    const body = await response.json();
    expect(body.token).toEqual(expect.any(String));
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('returns Bad credentials for invalid login', async ({ authClient }) => {
    const context = { testName: 'invalid login', method: 'POST', endpoint: '/auth' };
    const response = await authClient.postAuth({ username: 'wrong', password: 'wrong' });

    ResponseValidator.assertExactStatus(response, context, 200);
    const body = await response.json();
    expect(body.token).toBeUndefined();
    expect(body.reason).toBe('Bad credentials');
  });

  test('does not return token when password is missing', async ({ authClient }) => {
    const context = { testName: 'missing password', method: 'POST', endpoint: '/auth' };
    const response = await authClient.postAuth({ username: 'admin' });

    ResponseValidator.assertExactStatus(response, context, 200);
    const body = await response.json();
    expect(body.token).toBeUndefined();
  });
});
