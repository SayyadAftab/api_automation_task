import { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';
import { AuthTokenRetry } from '../helpers/auth-token.retry';
import {
  AcceptContentType,
  RequestContentType,
  requestContentTypeHeaders,
} from '../types/content-type.types';

function basicAuthHeader(): string {
  return `Basic ${Buffer.from(`${env.username}:${env.password}`).toString('base64')}`;
}

export interface SendOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, string>;
  body?: string;
  data?: Record<string, unknown>;
  contentType?: string;
  accept?: AcceptContentType | string;
  cookieToken?: string;
  basicAuth?: boolean;
}

export class BaseClient {
  constructor(
    protected readonly request: APIRequestContext,
    protected readonly authTokenRetry?: AuthTokenRetry,
  ) {}

  protected url(path: string, query?: Record<string, string>): string {
    const base = `${env.baseUrl}${path}`;
    if (!query || Object.keys(query).length === 0) {
      return base;
    }
    const params = new URLSearchParams(query).toString();
    return `${base}?${params}`;
  }

  protected buildHeaders(options: SendOptions): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: options.accept ?? AcceptContentType.JSON,
    };

    if (options.contentType) {
      headers['Content-Type'] = options.contentType;
    }

    if (options.cookieToken) {
      headers.Cookie = `token=${options.cookieToken}`;
    }

    if (options.basicAuth) {
      headers.Authorization = basicAuthHeader();
    }

    return headers;
  }

  private toCachedResponse(response: APIResponse, responseBody: string): APIResponse {
    return {
      status: () => response.status(),
      headers: () => response.headers(),
      ok: () => response.ok(),
      url: () => response.url(),
      text: async () => responseBody,
      json: async () => JSON.parse(responseBody) as unknown,
      body: async () => Buffer.from(responseBody),
    } as APIResponse;
  }

  protected async send(options: SendOptions, retried = false): Promise<APIResponse> {
    const headers = this.buildHeaders(options);
    const url = this.url(options.path, options.query);
    const requestOptions: Parameters<APIRequestContext['fetch']>[1] = {
      method: options.method,
      headers,
    };

    if (options.body !== undefined) {
      requestOptions.data = options.body;
    } else if (options.data !== undefined) {
      requestOptions.data = options.data;
    }

    const response = await this.request.fetch(url, requestOptions);
    const responseBody = await response.text();
    const status = response.status();

    const shouldRetryWithFreshToken =
      status === 403 &&
      options.cookieToken &&
      this.authTokenRetry &&
      options.cookieToken === this.authTokenRetry.value &&
      !retried;

    if (shouldRetryWithFreshToken) {
      const newToken = await this.authTokenRetry.refresh();
      return this.send({ ...options, cookieToken: newToken }, true);
    }

    return this.toCachedResponse(response, responseBody);
  }

  protected contentTypeFor(requestType: RequestContentType): string {
    return requestContentTypeHeaders[requestType];
  }
}
