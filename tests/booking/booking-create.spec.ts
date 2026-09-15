import { test } from '../../src/fixtures/api.fixture';
import { AcceptContentType, RequestContentType } from '../../src/types/content-type.types';
import { validBooking } from '../../src/test-data/booking.data';
import {
  negativeCreateContractCases,
  negativeXmlCreateContractCases,
} from '../../src/test-data/contract-expectations';
import { BookingValidator } from '../../src/validators/booking.validator';
import { ResponseValidator } from '../../src/validators/response.validator';
import { BookingRequestBuilder } from '../../src/builders/booking-request.builder';

const positiveCreateCases = [
  { requestType: RequestContentType.JSON, label: 'JSON' },
  { requestType: RequestContentType.XML, label: 'XML' },
  { requestType: RequestContentType.URL_ENCODED, label: 'URL encoded' },
] as const;

test.describe('Booking - CreateBooking', () => {
  for (const scenario of positiveCreateCases) {
    test(`positive: create booking using ${scenario.label}`, async ({ bookingClient }) => {
      const payload = {
        ...validBooking,
        firstname: `Auto${scenario.requestType}`,
        lastname: 'Create',
      };
      const context = {
        testName: `create booking using ${scenario.label}`,
        method: 'POST',
        endpoint: '/booking',
      };

      const response = await bookingClient.createBooking(
        scenario.requestType,
        payload,
        AcceptContentType.JSON,
      );

      ResponseValidator.assertExactStatus(response, context, 200);
      await ResponseValidator.assertJsonContentType(response, context);

      const body = await bookingClient.parseCreateResponse(response);
      BookingValidator.assertCreateResponse(body, payload);
    });
  }

  for (const scenario of negativeCreateContractCases) {
    test(`negative: ${scenario.name}`, async ({ bookingClient }) => {
      const context = {
        testName: scenario.name,
        method: scenario.method,
        endpoint: scenario.endpoint,
      };

      let response;
      if (scenario.rawBody) {
        response = await bookingClient.createBookingRaw(
          scenario.rawBody,
          scenario.contentType ?? 'application/json',
        );
      } else if (scenario.contentType) {
        response = await bookingClient.createBookingRaw(
          BookingRequestBuilder.toJson(scenario.payload ?? {}),
          scenario.contentType,
        );
      } else {
        response = await bookingClient.createBookingRaw(
          BookingRequestBuilder.toJson(scenario.payload ?? {}),
          'application/json',
        );
      }

      await ResponseValidator.assertContract(response, context, {
        status: scenario.status,
        bodyIncludes: scenario.bodyIncludes,
      });
    });
  }

  for (const scenario of negativeXmlCreateContractCases) {
    test(`negative: ${scenario.name}`, async ({ bookingClient }) => {
      const context = {
        testName: scenario.name,
        method: scenario.method,
        endpoint: scenario.endpoint,
      };

      const response = await bookingClient.createBookingRaw(
        scenario.rawBody!,
        scenario.contentType ?? 'text/xml',
      );

      await ResponseValidator.assertContract(response, context, {
        status: scenario.status,
        bodyIncludes: scenario.bodyIncludes,
      });
    });
  }
});
