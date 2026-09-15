import { BookingPayload } from '../types/booking.types';

export const validBooking: BookingPayload = {
  firstname: 'Jim',
  lastname: 'Brown',
  totalprice: 111,
  depositpaid: true,
  bookingdates: {
    checkin: '2018-01-01',
    checkout: '2019-01-01',
  },
  additionalneeds: 'Breakfast',
};

export const updatedBooking: BookingPayload = {
  firstname: 'James',
  lastname: 'Brown',
  totalprice: 222,
  depositpaid: false,
  bookingdates: {
    checkin: '2020-05-01',
    checkout: '2020-05-10',
  },
  additionalneeds: 'Lunch',
};

export const partialPatch = {
  firstname: 'PatchedFirst',
  lastname: 'PatchedLast',
};
