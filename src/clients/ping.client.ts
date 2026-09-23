import { APIRequestContext } from '@playwright/test';
import { BaseClient } from './base.client';

export class PingClient extends BaseClient {
  constructor(request: APIRequestContext) {
    super(request);
  }

  ping() {
    return this.send({
      method: 'GET',
      path: '/ping',
    });
  }
}
