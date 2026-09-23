import { test } from '../../src/fixtures/api.fixture';
import { apiContext } from '../../src/helpers/api-context.helper';
import { AcceptContentType, RequestContentType } from '../../src/types/content-type.types';
import { validBooking } from '../../src/test-data/booking.data';
import {
  negativeCreateContractCases,
  negativeXmlCreateContractCases,
} from '../../src/test-data/contract-expectations';
import { CreateBookingResponse } from '../../src/types/booking.types';
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
    test(
      `positive: create booking using ${scenario.label}`,
      { tag: ['@regression', '@createbooking'] },
      async ({ bookingClient }) => {
        const payload = {
          ...validBooking,
          firstname: `Auto${scenario.requestType}`,
          lastname: 'Create',
        };
        const context = apiContext(
          `create booking using ${scenario.label}`,
          'POST',
          '/booking',
        );

        const response = await test.step(`Create booking using ${scenario.label}`, async () =>
          bookingClient.createBooking(scenario.requestType, payload, AcceptContentType.JSON),
        );

        await test.step('Assert response contract and booking fields', async () => {
          await ResponseValidator.assertExactStatus(response, context, 200);
          await ResponseValidator.assertJsonContentType(response, context);

          const body = await response.json() as CreateBookingResponse;
          BookingValidator.assertCreateResponse(
            body,
            payload,
            context,
            JSON.stringify(body),
          );
        });
      },
    );
  }

  for (const scenario of negativeCreateContractCases) {
    test(
      `negative: ${scenario.name}`,
      { tag: ['@regression', '@createbooking'] },
      async ({ bookingClient }) => {
        const context = apiContext(scenario.name, scenario.method, scenario.endpoint);

        const response = await test.step(`Send invalid create request: ${scenario.name}`, async () => {
          if (scenario.rawBody) {
            return bookingClient.createBookingRaw(
              scenario.rawBody,
              scenario.contentType ?? 'application/json',
            );
          }

          if (scenario.contentType) {
            return bookingClient.createBookingRaw(
              BookingRequestBuilder.toJson(scenario.payload ?? {}),
              scenario.contentType,
            );
          }

          return bookingClient.createBookingRaw(
            BookingRequestBuilder.toJson(scenario.payload ?? {}),
            'application/json',
          );
        });

        await test.step('Assert negative contract', async () => {
          await ResponseValidator.assertContract(response, context, {
            status: scenario.status,
            bodyIncludes: scenario.bodyIncludes,
          });
        });
      },
    );
  }

  for (const scenario of negativeXmlCreateContractCases) {
    test(
      `negative: ${scenario.name}`,
      { tag: ['@regression', '@createbooking'] },
      async ({ bookingClient }) => {
        const context = apiContext(scenario.name, scenario.method, scenario.endpoint);

        const response = await test.step(`Send invalid XML create request: ${scenario.name}`, async () =>
          bookingClient.createBookingRaw(
            scenario.rawBody!,
            scenario.contentType ?? 'text/xml',
          ),
        );

        await test.step('Assert negative contract', async () => {
          await ResponseValidator.assertContract(response, context, {
            status: scenario.status,
            bodyIncludes: scenario.bodyIncludes,
          });
        });
      },
    );
  }
});
