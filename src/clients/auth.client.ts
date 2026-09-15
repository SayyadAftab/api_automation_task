import { APIRequestContext } from '@playwright/test';
import { env } from '../config/env';
import { BaseClient } from './base.client';

export class AuthClient extends BaseClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  async createToken(
    username = env.username,
    password = env.password,
  ): Promise<{ token?: string; reason?: string }> {
    const response = await this.postAuth({ username, password });
    return response.json();
  }

  async postAuth(data: Record<string, unknown>) {
    return this.request.post(this.url('/auth'), {
      data,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  async getToken(): Promise<string> {
    const body = await this.createToken();
    if (!body.token) {
      throw new Error(`Auth failed: ${body.reason ?? 'unknown error'}`);
    }
    return body.token;
  }
}
