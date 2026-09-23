import { test, expect } from '../../src/fixtures/api.fixture';
import { apiContext } from '../../src/helpers/api-context.helper';
import { bookingIdListSchema } from '../../src/schemas/booking.schemas';
import { negativeGetBookingIdsContract } from '../../src/test-data/contract-expectations';
import { ResponseValidator } from '../../src/validators/response.validator';

test.describe('Booking - GetBookingIds', () => {
  test(
    'positive: returns all booking ids',
    { tag: ['@regression', '@getbookingids'] },
    async ({ bookingClient }) => {
      const context = apiContext('get all booking ids', 'GET', '/booking');

      const response = await test.step('Get all booking ids', async () =>
        bookingClient.getBookingIds(),
      );

      await test.step('Assert status and booking id list schema', async () => {
        await ResponseValidator.assertExactStatus(response, context, 200);
        const body = await response.json();
        const parsed = bookingIdListSchema.parse(body);
        expect(parsed.length).toBeGreaterThan(0);
      });
    },
  );

  test(
    'positive: filter by firstname and lastname',
    { tag: ['@regression', '@getbookingids'] },
    async ({ bookingClient }) => {
      const context = apiContext(
        'filter by name',
        'GET',
        '/booking?firstname=Jim&lastname=Brown',
      );

      const response = await test.step('Filter booking ids by name', async () =>
        bookingClient.getBookingIds({
          firstname: 'Jim',
          lastname: 'Brown',
        }),
      );

      await test.step('Assert filtered results', async () => {
        await ResponseValidator.assertExactStatus(response, context, 200);
        const body = bookingIdListSchema.parse(await response.json());
        expect(body.length).toBeGreaterThan(0);
      });
    },
  );

  test(
    'positive: filter by checkin and checkout dates',
    { tag: ['@regression', '@getbookingids'] },
    async ({ bookingClient }) => {
      const context = apiContext(
        'filter by dates',
        'GET',
        '/booking?checkin=2014-03-13&checkout=2014-05-21',
      );

      const response = await test.step('Filter booking ids by dates', async () =>
        bookingClient.getBookingIds({
          checkin: '2014-03-13',
          checkout: '2014-05-21',
        }),
      );

      await test.step('Assert filtered results', async () => {
        await ResponseValidator.assertExactStatus(response, context, 200);
        expect(Array.isArray(await response.json())).toBeTruthy();
      });
    },
  );

  test(
    `negative: ${negativeGetBookingIdsContract.name}`,
    { tag: ['@regression', '@getbookingids'] },
    async ({ bookingClient }) => {
      const context = apiContext(
        negativeGetBookingIdsContract.name,
        negativeGetBookingIdsContract.method,
        negativeGetBookingIdsContract.endpoint,
      );

      const response = await test.step('Send invalid date filter', async () =>
        bookingClient.getBookingIds({
          checkin: 'not-a-date',
          checkout: 'also-not-a-date',
        }),
      );

      await test.step('Assert negative contract', async () => {
        await ResponseValidator.assertContract(response, context, {
          status: negativeGetBookingIdsContract.status,
          bodyIncludes: negativeGetBookingIdsContract.bodyIncludes,
        });
      });
    },
  );
});
