import { APIRequestContext } from '@playwright/test';
import { env } from '../config/env';
import { BaseClient } from './base.client';

export class AuthClient extends BaseClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async postAuth(data: Record<string, unknown>) {
    return this.send({
      method: 'POST',
      path: '/auth',
      data,
      contentType: 'application/json',
    });
  }

  async getToken(): Promise<string> {
    const response = await this.postAuth({
      username: env.username,
      password: env.password,
    });
    const body = await response.json() as { token?: string; reason?: string };

    if (!body.token) {
      throw new Error(`Auth failed: ${body.reason ?? 'unknown error'}`);
    }

    return body.token;
  }
}
