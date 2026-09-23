import { test } from '../../src/fixtures/api.fixture';
import { apiContext } from '../../src/helpers/api-context.helper';
import { AcceptContentType, RequestContentType } from '../../src/types/content-type.types';
import { updatedBooking, validBooking } from '../../src/test-data/booking.data';
import { BookingValidator } from '../../src/validators/booking.validator';
import { ResponseValidator } from '../../src/validators/response.validator';

const updateContentTypeCases = [
  RequestContentType.JSON,
  RequestContentType.XML,
  RequestContentType.URL_ENCODED,
] as const;

test.describe('Booking - UpdateBooking', () => {
  let bookingId: number;

  test.beforeEach(async ({ createBooking }) => {
    const created = await createBooking({ firstname: 'Update', lastname: 'Target' });
    bookingId = created.id;
  });

  test(
    'negative: update without auth returns 403',
    { tag: ['@regression', '@updatebooking'] },
    async ({ bookingClient }) => {
      const context = apiContext('update without auth', 'PUT', `/booking/${bookingId}`);

      const response = await test.step('Update booking without auth', async () =>
        bookingClient.updateBooking(bookingId, RequestContentType.JSON, updatedBooking),
      );

      await test.step('Assert 403 status', async () => {
        await ResponseValidator.assertExactStatus(response, context, 403);
      });
    },
  );

  for (const requestType of updateContentTypeCases) {
    test(
      `positive: update booking using ${requestType}`,
      { tag: ['@regression', '@updatebooking'] },
      async ({ bookingClient, authToken }) => {
        const payload = {
          ...updatedBooking,
          firstname: `James${requestType}`,
          lastname: 'Updated',
          ...(requestType !== RequestContentType.JSON && {
            depositpaid: validBooking.depositpaid,
          }),
        };
        const context = apiContext(
          `update booking using ${requestType}`,
          'PUT',
          `/booking/${bookingId}`,
        );

        const response = await test.step(`Update booking using ${requestType}`, async () =>
          bookingClient.updateBooking(bookingId, requestType, payload, {
            token: authToken,
            accept: AcceptContentType.JSON,
          }),
        );

        await test.step('Assert update response', async () => {
          await ResponseValidator.assertExactStatus(response, context, 200);
          await ResponseValidator.assertJsonContentType(response, context);

          const body = await response.json();
          const responseBody = JSON.stringify(body);
          const { depositpaid, ...expectedWithoutDepositpaid } = payload;
          const expected =
            requestType === RequestContentType.JSON ? payload : expectedWithoutDepositpaid;
          BookingValidator.assertBooking(body, expected, context, responseBody);
        });
      },
    );
  }

  test(
    'positive: update booking using JSON with basic auth',
    { tag: ['@regression', '@updatebooking'] },
    async ({ bookingClient }) => {
      const payload = { ...updatedBooking, firstname: 'JamesBasic' };
      const context = apiContext(
        'update booking using JSON with basic auth',
        'PUT',
        `/booking/${bookingId}`,
      );

      const response = await test.step('Update booking with basic auth', async () =>
        bookingClient.updateBooking(bookingId, RequestContentType.JSON, payload, {
          basicAuth: true,
        }),
      );

      await test.step('Assert update response', async () => {
        await ResponseValidator.assertExactStatus(response, context, 200);
        const body = await response.json();
        BookingValidator.assertBooking(body, payload, context, JSON.stringify(body));
      });
    },
  );

  test(
    'negative: update invalid booking id returns 405',
    { tag: ['@regression', '@updatebooking'] },
    async ({ bookingClient, authToken }) => {
      const context = apiContext('update invalid booking id', 'PUT', '/booking/999999999');

      const response = await test.step('Update non-existent booking', async () =>
        bookingClient.updateBooking(999999999, RequestContentType.JSON, updatedBooking, {
          token: authToken,
        }),
      );

      await test.step('Assert 405 status', async () => {
        await ResponseValidator.assertExactStatus(response, context, 405);
      });
    },
  );
});
