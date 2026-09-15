import { expect } from '@playwright/test';
import { BookingPayload, CreateBookingResponse } from '../types/booking.types';

export class BookingValidator {
  static assertCreateResponse(
    body: CreateBookingResponse,
    expected: BookingPayload,
  ): void {
    expect(body.bookingid, 'Expected bookingid in create response').toEqual(expect.any(Number));
    this.assertBooking(body.booking, expected, 'create response booking');
  }

  static assertBooking(
    body: BookingPayload,
    expected: Partial<BookingPayload>,
    label = 'booking response',
  ): void {
    if (expected.firstname !== undefined) {
      expect(body.firstname, `Expected ${label} field 'firstname'`).toBe(expected.firstname);
    }
    if (expected.lastname !== undefined) {
      expect(body.lastname, `Expected ${label} field 'lastname'`).toBe(expected.lastname);
    }
    if (expected.totalprice !== undefined) {
      expect(body.totalprice, `Expected ${label} field 'totalprice'`).toBe(expected.totalprice);
    }
    if (expected.depositpaid !== undefined) {
      expect(body.depositpaid, `Expected ${label} field 'depositpaid'`).toBe(
        expected.depositpaid,
      );
    }
    if (expected.additionalneeds !== undefined) {
      expect(body.additionalneeds, `Expected ${label} field 'additionalneeds'`).toBe(
        expected.additionalneeds,
      );
    }
    if (expected.bookingdates) {
      expect(body.bookingdates.checkin, `Expected ${label} bookingdates.checkin`).toBe(
        expected.bookingdates.checkin,
      );
      expect(body.bookingdates.checkout, `Expected ${label} bookingdates.checkout`).toBe(
        expected.bookingdates.checkout,
      );
    }
  }

  static assertRequiredBookingFields(body: BookingPayload): void {
    expect(body.firstname).toEqual(expect.any(String));
    expect(body.lastname).toEqual(expect.any(String));
    expect(body.totalprice).toEqual(expect.any(Number));
    expect(body.depositpaid).toEqual(expect.any(Boolean));
    expect(body.bookingdates.checkin).toEqual(expect.any(String));
    expect(body.bookingdates.checkout).toEqual(expect.any(String));
  }
}
