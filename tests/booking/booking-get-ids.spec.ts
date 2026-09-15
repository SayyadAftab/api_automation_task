import { test, expect } from '../../src/fixtures/api.fixture';
import { negativeGetBookingIdsContract } from '../../src/test-data/contract-expectations';
import { ResponseValidator } from '../../src/validators/response.validator';

test.describe('Booking - GetBookingIds', () => {
  test('positive: returns all booking ids', async ({ bookingClient }) => {
    const context = { testName: 'get all booking ids', method: 'GET', endpoint: '/booking' };
    const response = await bookingClient.getBookingIds();

    ResponseValidator.assertExactStatus(response, context, 200);
    const body: Array<{ bookingid: number }> = await response.json();
    expect(body.length).toBeGreaterThan(0);
    expect(body[0].bookingid).toEqual(expect.any(Number));
  });

  test('positive: filter by firstname and lastname', async ({ bookingClient }) => {
    const context = {
      testName: 'filter by name',
      method: 'GET',
      endpoint: '/booking?firstname=Jim&lastname=Brown',
    };
    const response = await bookingClient.getBookingIds({
      firstname: 'Jim',
      lastname: 'Brown',
    });

    ResponseValidator.assertExactStatus(response, context, 200);
    const body: Array<{ bookingid: number }> = await response.json();
    expect(body.length).toBeGreaterThan(0);
  });

  test('positive: filter by checkin and checkout dates', async ({ bookingClient }) => {
    const context = {
      testName: 'filter by dates',
      method: 'GET',
      endpoint: '/booking?checkin=2014-03-13&checkout=2014-05-21',
    };
    const response = await bookingClient.getBookingIds({
      checkin: '2014-03-13',
      checkout: '2014-05-21',
    });

    ResponseValidator.assertExactStatus(response, context, 200);
    expect(Array.isArray(await response.json())).toBeTruthy();
  });

  test(`negative: ${negativeGetBookingIdsContract.name}`, async ({ bookingClient }) => {
    const context = {
      testName: negativeGetBookingIdsContract.name,
      method: negativeGetBookingIdsContract.method,
      endpoint: negativeGetBookingIdsContract.endpoint,
    };

    const response = await bookingClient.getBookingIds({
      checkin: 'not-a-date',
      checkout: 'also-not-a-date',
    });

    await ResponseValidator.assertContract(response, context, {
      status: negativeGetBookingIdsContract.status,
      bodyIncludes: negativeGetBookingIdsContract.bodyIncludes,
    });
  });
});
