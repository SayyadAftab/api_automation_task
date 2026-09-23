import { z } from 'zod';
import { formatFailure } from '../helpers/failure-format.helper';
import {
  bookingPayloadSchema,
  createBookingResponseSchema,
} from '../schemas/booking.schemas';
import { BookingPayload, CreateBookingResponse } from '../types/booking.types';
import { ApiCallContext } from '../types/contract.types';

function formatSchemaFailure(
  context: ApiCallContext,
  label: string,
  error: z.ZodError,
  responseBody: string,
): string {
  const issues = error.issues
    .map((issue) => `- ${issue.path.join('.') || '(root)'}: ${issue.message}`)
    .join('\n');

  return formatFailure(
    context,
    `Failure Reason:\n${label} schema validation failed\n${issues}`,
    'Valid schema',
    'Invalid response structure',
    responseBody,
  );
}

function parseWithSchema<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context: ApiCallContext,
  label: string,
  responseBody: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(formatSchemaFailure(context, label, result.error, responseBody));
  }
  return result.data;
}

export class BookingValidator {
  static assertCreateResponse(
    body: CreateBookingResponse,
    expected: BookingPayload,
    context: ApiCallContext,
    responseBody = JSON.stringify(body),
  ): void {
    parseWithSchema(
      createBookingResponseSchema,
      body,
      context,
      'Create booking response',
      responseBody,
    );
    this.assertBooking(body.booking, expected, context, responseBody);
  }

  static assertBooking(
    body: BookingPayload,
    expected: Partial<BookingPayload>,
    context: ApiCallContext,
    responseBody = JSON.stringify(body),
  ): void {
    parseWithSchema(bookingPayloadSchema, body, context, 'Booking payload', responseBody);

    const mismatches: string[] = [];

    if (expected.firstname !== undefined && body.firstname !== expected.firstname) {
      mismatches.push(`firstname: expected "${expected.firstname}", got "${body.firstname}"`);
    }
    if (expected.lastname !== undefined && body.lastname !== expected.lastname) {
      mismatches.push(`lastname: expected "${expected.lastname}", got "${body.lastname}"`);
    }
    if (expected.totalprice !== undefined && body.totalprice !== expected.totalprice) {
      mismatches.push(`totalprice: expected ${expected.totalprice}, got ${body.totalprice}`);
    }
    if (expected.depositpaid !== undefined && body.depositpaid !== expected.depositpaid) {
      mismatches.push(
        `depositpaid: expected ${expected.depositpaid}, got ${body.depositpaid}`,
      );
    }
    if (expected.additionalneeds !== undefined && body.additionalneeds !== expected.additionalneeds) {
      mismatches.push(
        `additionalneeds: expected "${expected.additionalneeds}", got "${body.additionalneeds}"`,
      );
    }
    if (expected.bookingdates) {
      if (body.bookingdates.checkin !== expected.bookingdates.checkin) {
        mismatches.push(
          `bookingdates.checkin: expected "${expected.bookingdates.checkin}", got "${body.bookingdates.checkin}"`,
        );
      }
      if (body.bookingdates.checkout !== expected.bookingdates.checkout) {
        mismatches.push(
          `bookingdates.checkout: expected "${expected.bookingdates.checkout}", got "${body.bookingdates.checkout}"`,
        );
      }
    }

    if (mismatches.length > 0) {
      throw new Error(
        formatFailure(
          context,
          `Failure Reason:\nBooking field mismatch\n${mismatches.join('\n')}`,
          JSON.stringify(expected, null, 2),
          JSON.stringify(body, null, 2),
          responseBody,
        ),
      );
    }
  }

  static assertRequiredBookingFields(
    body: BookingPayload,
    context: ApiCallContext,
    responseBody = JSON.stringify(body),
  ): void {
    parseWithSchema(bookingPayloadSchema, body, context, 'Booking payload', responseBody);
  }
}
