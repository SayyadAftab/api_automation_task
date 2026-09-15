import { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../config/env';
import {
  AcceptContentType,
  RequestContentType,
  requestContentTypeHeaders,
} from '../types/content-type.types';

function basicAuthHeader(): string {
  return `Basic ${Buffer.from(`${env.username}:${env.password}`).toString('base64')}`;
}

export interface SendBookingOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  body?: string;
  contentType?: string;
  accept?: AcceptContentType;
  cookieToken?: string;
  basicAuth?: boolean;
}

export class BaseClient {
  constructor(protected readonly request: APIRequestContext) {}

  protected url(path: string): string {
    return `${env.baseUrl}${path}`;
  }

  protected buildHeaders(options: SendBookingOptions): Record<string, string> {
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

  protected async send(options: SendBookingOptions): Promise<APIResponse> {
    const headers = this.buildHeaders(options);
    const requestOptions: Parameters<APIRequestContext['fetch']>[1] = {
      method: options.method ?? 'POST',
      headers,
    };

    if (options.body !== undefined) {
      requestOptions.data = options.body;
    }

    return this.request.fetch(this.url(options.path), requestOptions);
  }

  protected contentTypeFor(requestType: RequestContentType): string {
    return requestContentTypeHeaders[requestType];
  }
}
