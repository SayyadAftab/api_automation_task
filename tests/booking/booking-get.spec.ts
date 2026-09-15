import { test, expect } from '../../src/fixtures/api.fixture';
import { AcceptContentType, RequestContentType } from '../../src/types/content-type.types';
import { validBooking } from '../../src/test-data/booking.data';
import { BookingValidator } from '../../src/validators/booking.validator';
import { ResponseValidator } from '../../src/validators/response.validator';

const responseFormatCases = [
  { accept: AcceptContentType.JSON, label: 'JSON' },
  { accept: AcceptContentType.XML, label: 'XML' },
] as const;

test.describe('Booking - GetBooking', () => {
  let bookingId: number;

  test.beforeEach(async ({ bookingClient }) => {
    const createResponse = await bookingClient.createBooking(RequestContentType.JSON, {
      ...validBooking,
      firstname: 'Get',
      lastname: 'Target',
    });
    bookingId = (await createResponse.json()).bookingid;
  });

  for (const scenario of responseFormatCases) {
    test(`positive: get booking with Accept ${scenario.label}`, async ({ bookingClient }) => {
      const context = {
        testName: `get booking Accept ${scenario.label}`,
        method: 'GET',
        endpoint: `/booking/${bookingId}`,
      };

      const response = await bookingClient.getBooking(bookingId, scenario.accept);

      ResponseValidator.assertExactStatus(response, context, 200);
      await ResponseValidator.assertResponseFormat(response, context, scenario.accept);

      if (scenario.accept === AcceptContentType.JSON) {
        const body = await response.json();
        BookingValidator.assertRequiredBookingFields(body);
        expect(body.firstname).toBe('Get');
      } else {
        const body = await response.text();
        expect(body).toContain('<firstname>');
        expect(body).toContain('Get');
      }
    });
  }

  test('negative: non-existent booking returns 404', async ({ bookingClient }) => {
    const context = {
      testName: 'non-existent booking',
      method: 'GET',
      endpoint: '/booking/999999999',
    };

    const response = await bookingClient.getBooking(999999999);
    ResponseValidator.assertExactStatus(response, context, 404);
  });
});
