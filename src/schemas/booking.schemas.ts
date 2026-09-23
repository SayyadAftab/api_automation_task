import { z } from 'zod';

export const bookingDatesSchema = z.object({
  checkin: z.string(),
  checkout: z.string(),
});

export const bookingPayloadSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number(),
  depositpaid: z.boolean(),
  bookingdates: bookingDatesSchema,
  additionalneeds: z.string(),
});

export const createBookingResponseSchema = z.object({
  bookingid: z.number(),
  booking: bookingPayloadSchema,
});

export const bookingIdListItemSchema = z.object({
  bookingid: z.number(),
});

export const bookingIdListSchema = z.array(bookingIdListItemSchema);
