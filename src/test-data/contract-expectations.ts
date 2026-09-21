import { validBooking } from './booking.data';
import { NegativeContractCase } from '../types/contract.types';

/** Strict contract expectations per Restful Booker API documentation. */
export const negativeCreateContractCases: NegativeContractCase[] = [
  {
    name: 'missing required fields',
    method: 'POST',
    endpoint: '/booking',
    status: 400,
    bodyIncludes: 'Bad Request',
    payload: { firstname: 'Jim' },
  },
  {
    name: 'invalid totalprice datatype',
    method: 'POST',
    endpoint: '/booking',
    status: 400,
    bodyIncludes: 'Bad Request',
    payload: {
      ...validBooking,
      totalprice: 'not-a-number' as unknown as number,
    },
  },
  {
    name: 'empty request body',
    method: 'POST',
    endpoint: '/booking',
    status: 400,
    bodyIncludes: 'Bad Request',
    payload: {},
  },
  {
    name: 'malformed json body',
    method: 'POST',
    endpoint: '/booking',
    status: 400,
    bodyIncludes: 'Bad Request',
    rawBody: '{ firstname: Jim }',
    contentType: 'application/json',
  },
  {
    name: 'unsupported content type',
    method: 'POST',
    endpoint: '/booking',
    status: 415,
    payload: validBooking as unknown as Record<string, unknown>,
    contentType: 'text/plain',
  },
];

export const negativeXmlCreateContractCases: NegativeContractCase[] = [
  {
    name: 'malformed xml body',
    method: 'POST',
    endpoint: '/booking',
    status: 400,
    bodyIncludes: 'Bad Request',
    rawBody: '<booking><firstname>Jim</firstname>',
    contentType: 'text/xml',
  },
];

export const negativeGetBookingIdsContract = {
  name: 'invalid date format',
  method: 'GET' as const,
  endpoint: '/booking?checkin=not-a-date&checkout=also-not-a-date',
  status: 500,
  bodyIncludes: 'Internal Server Error',
};
