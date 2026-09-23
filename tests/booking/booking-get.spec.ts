import { test, expect } from '../../src/fixtures/api.fixture';
import { apiContext } from '../../src/helpers/api-context.helper';
import { AcceptContentType } from '../../src/types/content-type.types';
import { BookingValidator } from '../../src/validators/booking.validator';
import { ResponseValidator } from '../../src/validators/response.validator';

const responseFormatCases = [
  { accept: AcceptContentType.JSON, label: 'JSON' },
  { accept: AcceptContentType.XML, label: 'XML' },
] as const;

test.describe('Booking - GetBooking', () => {
  let bookingId: number;

  test.beforeEach(async ({ createBooking }) => {
    const created = await createBooking({ firstname: 'Get', lastname: 'Target' });
    bookingId = created.id;
  });

  for (const scenario of responseFormatCases) {
    test(
      `positive: get booking with Accept ${scenario.label}`,
      { tag: ['@regression', '@getbooking'] },
      async ({ bookingClient }) => {
        const context = apiContext(
          `get booking Accept ${scenario.label}`,
          'GET',
          `/booking/${bookingId}`,
        );

        const response = await test.step(`Get booking with Accept ${scenario.label}`, async () =>
          bookingClient.getBooking(bookingId, scenario.accept),
        );

        await test.step('Assert response format and content', async () => {
          await ResponseValidator.assertExactStatus(response, context, 200);
          await ResponseValidator.assertResponseFormat(response, context, scenario.accept);

          if (scenario.accept === AcceptContentType.JSON) {
            const body = await response.json();
            const responseBody = JSON.stringify(body);
            BookingValidator.assertRequiredBookingFields(body, context, responseBody);
            expect(body.firstname).toBe('Get');
          } else {
            const body = await response.text();
            expect(body).toContain('<firstname>');
            expect(body).toContain('Get');
          }
        });
      },
    );
  }

  test(
    'negative: non-existent booking returns 404',
    { tag: ['@regression', '@getbooking'] },
    async ({ bookingClient }) => {
      const context = apiContext('non-existent booking', 'GET', '/booking/999999999');

      const response = await test.step('Get non-existent booking', async () =>
        bookingClient.getBooking(999999999),
      );

      await test.step('Assert 404 status', async () => {
        await ResponseValidator.assertExactStatus(response, context, 404);
      });
    },
  );
});
