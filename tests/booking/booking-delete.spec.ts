import { test, expect } from '../../src/fixtures/api.fixture';
import { RequestContentType } from '../../src/types/content-type.types';
import { validBooking } from '../../src/test-data/booking.data';
import { ResponseValidator } from '../../src/validators/response.validator';

test.describe('Booking - DeleteBooking', () => {
  test('negative: delete without auth returns 403', async ({ bookingClient }) => {
    const createResponse = await bookingClient.createBooking(RequestContentType.JSON, {
      ...validBooking,
      firstname: 'Delete',
      lastname: 'NoAuth',
    });
    const bookingId = (await createResponse.json()).bookingid;
    const context = {
      testName: 'delete without auth',
      method: 'DELETE',
      endpoint: `/booking/${bookingId}`,
    };

    const response = await bookingClient.deleteBooking(bookingId);
    ResponseValidator.assertExactStatus(response, context, 403);
  });

  test('positive: delete with cookie token returns 201', async ({
    bookingClient,
    authToken,
  }) => {
    const createResponse = await bookingClient.createBooking(RequestContentType.JSON, {
      ...validBooking,
      firstname: 'Delete',
      lastname: 'Cookie',
    });
    const bookingId = (await createResponse.json()).bookingid;
    const context = {
      testName: 'delete with cookie token',
      method: 'DELETE',
      endpoint: `/booking/${bookingId}`,
    };

    const response = await bookingClient.deleteBooking(bookingId, { token: authToken });
    ResponseValidator.assertExactStatus(response, context, 201);
    await expect(response.text()).resolves.toBe('Created');
  });

  test('positive: delete with basic auth returns 201', async ({ bookingClient }) => {
    const createResponse = await bookingClient.createBooking(RequestContentType.JSON, {
      ...validBooking,
      firstname: 'Delete',
      lastname: 'Basic',
    });
    const bookingId = (await createResponse.json()).bookingid;
    const context = {
      testName: 'delete with basic auth',
      method: 'DELETE',
      endpoint: `/booking/${bookingId}`,
    };

    const response = await bookingClient.deleteBooking(bookingId, { basicAuth: true });
    ResponseValidator.assertExactStatus(response, context, 201);
  });

  test('negative: delete already deleted booking returns 405', async ({
    bookingClient,
    authToken,
  }) => {
    const createResponse = await bookingClient.createBooking(RequestContentType.JSON, {
      ...validBooking,
      firstname: 'Delete',
      lastname: 'Twice',
    });
    const bookingId = (await createResponse.json()).bookingid;
    const context = {
      testName: 'delete already deleted booking',
      method: 'DELETE',
      endpoint: `/booking/${bookingId}`,
    };

    await bookingClient.deleteBooking(bookingId, { token: authToken });
    const response = await bookingClient.deleteBooking(bookingId, { token: authToken });

    ResponseValidator.assertExactStatus(response, context, 405);
  });

  test('verify deleted booking returns 404 on GET', async ({
    bookingClient,
    authToken,
  }) => {
    const createResponse = await bookingClient.createBooking(RequestContentType.JSON, {
      ...validBooking,
      firstname: 'Delete',
      lastname: 'Verify',
    });
    const bookingId = (await createResponse.json()).bookingid;
    const context = {
      testName: 'get deleted booking',
      method: 'GET',
      endpoint: `/booking/${bookingId}`,
    };

    await bookingClient.deleteBooking(bookingId, { token: authToken });
    const getResponse = await bookingClient.getBooking(bookingId);
    ResponseValidator.assertExactStatus(getResponse, context, 404);
  });
});
