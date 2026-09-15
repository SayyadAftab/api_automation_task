import { test as base } from '@playwright/test';
import { AuthClient } from '../clients/auth.client';
import { BookingClient } from '../clients/booking.client';
import { PingClient } from '../clients/ping.client';

type ApiFixtures = {
  authClient: AuthClient;
  bookingClient: BookingClient;
  pingClient: PingClient;
  authToken: string;
};

export const test = base.extend<ApiFixtures>({
  authClient: async ({ request }, use) => {
    await use(new AuthClient(request));
  },
  bookingClient: async ({ request }, use) => {
    await use(new BookingClient(request));
  },
  pingClient: async ({ request }, use) => {
    await use(new PingClient(request));
  },
  authToken: async ({ authClient }, use) => {
    const token = await authClient.getToken();
    await use(token);
  },
});

export { expect } from '@playwright/test';
