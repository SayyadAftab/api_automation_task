import { test } from '../../src/fixtures/api.fixture';
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

  test.beforeEach(async ({ bookingClient }) => {
    const createResponse = await bookingClient.createBooking(
      RequestContentType.JSON,
      { ...validBooking, firstname: 'Update', lastname: 'Target' },
    );
    bookingId = (await createResponse.json()).bookingid;
  });

  test('negative: update without auth returns 403', async ({ bookingClient }) => {
    const context = {
      testName: 'update without auth',
      method: 'PUT',
      endpoint: `/booking/${bookingId}`,
    };

    const response = await bookingClient.updateBooking(
      bookingId,
      RequestContentType.JSON,
      updatedBooking,
    );

    ResponseValidator.assertExactStatus(response, context, 403);
  });

  for (const requestType of updateContentTypeCases) {
    test(`positive: update booking using ${requestType}`, async ({
      bookingClient,
      authToken,
    }) => {
      const payload = {
        ...updatedBooking,
        firstname: `James${requestType}`,
        lastname: 'Updated',
        ...(requestType !== RequestContentType.JSON && {
          depositpaid: validBooking.depositpaid,
        }),
      };
      const context = {
        testName: `update booking using ${requestType}`,
        method: 'PUT',
        endpoint: `/booking/${bookingId}`,
      };

      const response = await bookingClient.updateBooking(bookingId, requestType, payload, {
        token: authToken,
        accept: AcceptContentType.JSON,
      });

      ResponseValidator.assertExactStatus(response, context, 200);
      await ResponseValidator.assertJsonContentType(response, context);

      const body = await response.json();
      const { depositpaid, ...expectedWithoutDepositpaid } = payload;
      const expected =
        requestType === RequestContentType.JSON ? payload : expectedWithoutDepositpaid;
      BookingValidator.assertBooking(body, expected);
    });
  }

  test('positive: update booking using JSON with basic auth', async ({ bookingClient }) => {
    const payload = { ...updatedBooking, firstname: 'JamesBasic' };
    const context = {
      testName: 'update booking using JSON with basic auth',
      method: 'PUT',
      endpoint: `/booking/${bookingId}`,
    };

    const response = await bookingClient.updateBooking(
      bookingId,
      RequestContentType.JSON,
      payload,
      { basicAuth: true },
    );

    ResponseValidator.assertExactStatus(response, context, 200);
    BookingValidator.assertBooking(await response.json(), payload);
  });

  test('negative: update invalid booking id returns 405', async ({ bookingClient, authToken }) => {
    const context = {
      testName: 'update invalid booking id',
      method: 'PUT',
      endpoint: '/booking/999999999',
    };

    const response = await bookingClient.updateBooking(
      999999999,
      RequestContentType.JSON,
      updatedBooking,
      { token: authToken },
    );

    ResponseValidator.assertExactStatus(response, context, 405);
  });
});
