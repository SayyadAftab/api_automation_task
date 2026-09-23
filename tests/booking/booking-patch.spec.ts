import { test, expect } from '../../src/fixtures/api.fixture';
import { apiContext } from '../../src/helpers/api-context.helper';
import { RequestContentType } from '../../src/types/content-type.types';
import { partialPatch } from '../../src/test-data/booking.data';
import { BookingValidator } from '../../src/validators/booking.validator';
import { ResponseValidator } from '../../src/validators/response.validator';

const patchContentTypeCases = [
  { requestType: RequestContentType.JSON, payload: partialPatch },
  {
    requestType: RequestContentType.XML,
    payload: { firstname: 'PatchedXml', lastname: 'PatchedXmlLast' },
  },
  {
    requestType: RequestContentType.URL_ENCODED,
    payload: { firstname: 'PatchedUrl', lastname: 'PatchedUrlLast' },
  },
] as const;

test.describe('Booking - PartialUpdateBooking', () => {
  let bookingId: number;

  test.beforeEach(async ({ createBooking }) => {
    const created = await createBooking({ firstname: 'Patch', lastname: 'Target' });
    bookingId = created.id;
  });

  test(
    'negative: patch without auth returns 403',
    { tag: ['@regression', '@patchbooking'] },
    async ({ bookingClient }) => {
      const context = apiContext('patch without auth', 'PATCH', `/booking/${bookingId}`);

      const response = await test.step('Patch booking without auth', async () =>
        bookingClient.partialUpdateBooking(
          bookingId,
          RequestContentType.JSON,
          partialPatch,
        ),
      );

      await test.step('Assert 403 status', async () => {
        await ResponseValidator.assertExactStatus(response, context, 403);
      });
    },
  );

  for (const scenario of patchContentTypeCases) {
    test(
      `positive: patch booking using ${scenario.requestType}`,
      { tag: ['@regression', '@patchbooking'] },
      async ({ bookingClient, authToken }) => {
        const context = apiContext(
          `patch booking using ${scenario.requestType}`,
          'PATCH',
          `/booking/${bookingId}`,
        );

        const response = await test.step(`Patch booking using ${scenario.requestType}`, async () =>
          bookingClient.partialUpdateBooking(
            bookingId,
            scenario.requestType,
            scenario.payload,
            { token: authToken },
          ),
        );

        await test.step('Assert patch response', async () => {
          await ResponseValidator.assertExactStatus(response, context, 200);
          await ResponseValidator.assertJsonContentType(response, context);

          const body = await response.json();
          const responseBody = JSON.stringify(body);
          BookingValidator.assertBooking(body, scenario.payload, context, responseBody);
          BookingValidator.assertRequiredBookingFields(body, context, responseBody);
        });
      },
    );
  }

  test(
    'positive: patch with basic auth using JSON',
    { tag: ['@regression', '@patchbooking'] },
    async ({ bookingClient }) => {
      const context = apiContext(
        'patch with basic auth using JSON',
        'PATCH',
        `/booking/${bookingId}`,
      );

      const response = await test.step('Patch booking with basic auth', async () =>
        bookingClient.partialUpdateBooking(
          bookingId,
          RequestContentType.JSON,
          { additionalneeds: 'Late checkout' },
          { basicAuth: true },
        ),
      );

      await test.step('Assert patch response', async () => {
        await ResponseValidator.assertExactStatus(response, context, 200);
        const body = await response.json();
        expect(body.additionalneeds).toBe('Late checkout');
      });
    },
  );
});
