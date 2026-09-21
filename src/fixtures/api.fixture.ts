import { test as base } from '@playwright/test';
import { env } from '../config/env';
import { AuthClient } from '../clients/auth.client';
import { BookingClient } from '../clients/booking.client';
import { PingClient } from '../clients/ping.client';

type ApiFixtures = {
  authClient: AuthClient;
  bookingClient: BookingClient;
  pingClient: PingClient;
};

type ApiWorkerFixtures = {
  authToken: string;
};

export const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
  authClient: async ({ request }, use) => {
    await use(new AuthClient(request));
  },
  bookingClient: async ({ request }, use) => {
    await use(new BookingClient(request));
  },
  pingClient: async ({ request }, use) => {
    await use(new PingClient(request));
  },
  authToken: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext({
        baseURL: env.baseUrl,
        extraHTTPHeaders: { Accept: 'application/json' },
      });

      try {
        const token = await new AuthClient(request).getToken();
        await use(token);
      } finally {
        await request.dispose();
      }
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
