import { defineConfig } from '@playwright/test';
import { env } from './src/config/env';

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  retries: 0,
  fullyParallel: true,
  workers: 2,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: env.baseUrl,
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
  },
  timeout: 30_000,
  projects: [
    {
      name: 'ping',
      testMatch: 'tests/ping/**/*.spec.ts',
    },
    {
      name: 'auth',
      testMatch: 'tests/auth/**/*.spec.ts',
      dependencies: ['ping'],
    },
    {
      name: 'booking-public',
      testMatch: [
        'tests/booking/booking-create.spec.ts',
        'tests/booking/booking-get.spec.ts',
        'tests/booking/booking-get-ids.spec.ts',
      ],
      dependencies: ['ping'],
    },
    {
      name: 'booking-protected',
      testMatch: [
        'tests/booking/booking-update.spec.ts',
        'tests/booking/booking-patch.spec.ts',
        'tests/booking/booking-delete.spec.ts',
      ],
      dependencies: ['auth'],
    },
  ],
});
