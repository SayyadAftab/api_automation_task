import { test as base } from '@playwright/test';
import { env } from '../config/env';
import { AuthClient } from '../clients/auth.client';
import { BookingClient } from '../clients/booking.client';
import { PingClient } from '../clients/ping.client';
import { AuthTokenRetry } from '../helpers/auth-token.retry';
import { RequestContentType } from '../types/content-type.types';
import { BookingPayload } from '../types/booking.types';
import { validBooking } from '../test-data/booking.data';

type ApiFixtures = {
  authClient: AuthClient;
  bookingClient: BookingClient;
  pingClient: PingClient;
  createBooking: (overrides?: Partial<BookingPayload>) => Promise<{ id: number }>;
  authToken: string;
};

type ApiWorkerFixtures = {
  authTokenRetry: AuthTokenRetry;
};

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  authTokenRetry: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext({
        baseURL: env.baseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
      });

      try {
        const authClient = new AuthClient(request);
        const retry = new AuthTokenRetry(
          await authClient.getToken(),
          () => authClient.getToken(),
        );
        await use(retry);
      } finally {
        await request.dispose();
      }
    },
    { scope: 'worker' },
  ],

  authToken: async ({ authTokenRetry }, use) => {
    await use(authTokenRetry.value);
  },

  authClient: async ({ request }, use) => {
    await use(new AuthClient(request));
  },

  bookingClient: async ({ request, authTokenRetry }, use) => {
    await use(new BookingClient(request, authTokenRetry));
  },

  pingClient: async ({ request }, use) => {
    await use(new PingClient(request));
  },

  createBooking: async ({ bookingClient }, use) => {
    const create = async (overrides: Partial<BookingPayload> = {}): Promise<{ id: number }> => {
      const payload = { ...validBooking, ...overrides };
      const response = await bookingClient.createBooking(RequestContentType.JSON, payload);
      const body = await response.json() as { bookingid: number };
      return { id: body.bookingid };
    };

    await use(create);
  },
});

export { expect } from '@playwright/test';
