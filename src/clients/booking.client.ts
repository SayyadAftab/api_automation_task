import { APIRequestContext, APIResponse } from '@playwright/test';
import { BookingRequestBuilder } from '../builders/booking-request.builder';
import {
  AcceptContentType,
  RequestContentType,
} from '../types/content-type.types';
import { AuthTokenRetry } from '../helpers/auth-token.retry';
import { BookingPayload } from '../types/booking.types';
import { BaseClient } from './base.client';

export class BookingClient extends BaseClient {
  constructor(request: APIRequestContext, authTokenRetry?: AuthTokenRetry) {
    super(request, authTokenRetry);
  }

  async createBooking(
    requestType: RequestContentType,
    payload: BookingPayload,
    accept: AcceptContentType = AcceptContentType.JSON,
  ): Promise<APIResponse> {
    return this.send({
      method: 'POST',
      path: '/booking',
      body: BookingRequestBuilder.build(requestType, payload),
      contentType: this.contentTypeFor(requestType),
      accept,
    });
  }

  async createBookingRaw(
    body: string,
    contentType: string,
    accept: AcceptContentType = AcceptContentType.JSON,
  ): Promise<APIResponse> {
    return this.send({
      method: 'POST',
      path: '/booking',
      body,
      contentType,
      accept,
    });
  }

  async getBookingIds(query?: Record<string, string>): Promise<APIResponse> {
    return this.send({
      method: 'GET',
      path: '/booking',
      query,
    });
  }

  async getBooking(
    id: number | string,
    accept: AcceptContentType = AcceptContentType.JSON,
  ): Promise<APIResponse> {
    return this.send({
      method: 'GET',
      path: `/booking/${id}`,
      accept,
    });
  }

  async updateBooking(
    id: number | string,
    requestType: RequestContentType,
    payload: BookingPayload,
    options: { token?: string; basicAuth?: boolean; accept?: AcceptContentType } = {},
  ): Promise<APIResponse> {
    return this.send({
      method: 'PUT',
      path: `/booking/${id}`,
      body: BookingRequestBuilder.build(requestType, payload),
      contentType: this.contentTypeFor(requestType),
      accept: options.accept ?? AcceptContentType.JSON,
      cookieToken: options.token,
      basicAuth: options.basicAuth,
    });
  }

  async partialUpdateBooking(
    id: number | string,
    requestType: RequestContentType,
    payload: Partial<BookingPayload> | Record<string, unknown>,
    options: { token?: string; basicAuth?: boolean; accept?: AcceptContentType } = {},
  ): Promise<APIResponse> {
    return this.send({
      method: 'PATCH',
      path: `/booking/${id}`,
      body: BookingRequestBuilder.build(requestType, payload, true),
      contentType: this.contentTypeFor(requestType),
      accept: options.accept ?? AcceptContentType.JSON,
      cookieToken: options.token,
      basicAuth: options.basicAuth,
    });
  }

  async deleteBooking(
    id: number | string,
    options: { token?: string; basicAuth?: boolean } = {},
  ): Promise<APIResponse> {
    return this.send({
      method: 'DELETE',
      path: `/booking/${id}`,
      contentType: 'application/json',
      cookieToken: options.token,
      basicAuth: options.basicAuth,
    });
  }
}
