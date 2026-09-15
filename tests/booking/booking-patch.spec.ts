import { test, expect } from '../../src/fixtures/api.fixture';
import { RequestContentType } from '../../src/types/content-type.types';
import { partialPatch, validBooking } from '../../src/test-data/booking.data';
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

  test.beforeEach(async ({ bookingClient }) => {
    const createResponse = await bookingClient.createBooking(
      RequestContentType.JSON,
      { ...validBooking, firstname: 'Patch', lastname: 'Target' },
    );
    bookingId = (await createResponse.json()).bookingid;
  });

  test('negative: patch without auth returns 403', async ({ bookingClient }) => {
    const context = {
      testName: 'patch without auth',
      method: 'PATCH',
      endpoint: `/booking/${bookingId}`,
    };

    const response = await bookingClient.partialUpdateBooking(
      bookingId,
      RequestContentType.JSON,
      partialPatch,
    );

    ResponseValidator.assertExactStatus(response, context, 403);
  });

  for (const scenario of patchContentTypeCases) {
    test(`positive: patch booking using ${scenario.requestType}`, async ({
      bookingClient,
      authToken,
    }) => {
      const context = {
        testName: `patch booking using ${scenario.requestType}`,
        method: 'PATCH',
        endpoint: `/booking/${bookingId}`,
      };

      const response = await bookingClient.partialUpdateBooking(
        bookingId,
        scenario.requestType,
        scenario.payload,
        { token: authToken },
      );

      ResponseValidator.assertExactStatus(response, context, 200);
      await ResponseValidator.assertJsonContentType(response, context);

      const body = await response.json();
      BookingValidator.assertBooking(body, scenario.payload);
      BookingValidator.assertRequiredBookingFields(body);
    });
  }

  test('positive: patch with basic auth using JSON', async ({ bookingClient }) => {
    const context = {
      testName: 'patch with basic auth using JSON',
      method: 'PATCH',
      endpoint: `/booking/${bookingId}`,
    };

    const response = await bookingClient.partialUpdateBooking(
      bookingId,
      RequestContentType.JSON,
      { additionalneeds: 'Late checkout' },
      { basicAuth: true },
    );

    ResponseValidator.assertExactStatus(response, context, 200);
    expect((await response.json()).additionalneeds).toBe('Late checkout');
  });
});
