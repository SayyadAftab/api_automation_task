import { test } from '../../src/fixtures/api.fixture';
import { apiContext } from '../../src/helpers/api-context.helper';
import { ResponseValidator } from '../../src/validators/response.validator';

test.describe('Booking - DeleteBooking', () => {
  test(
    'negative: delete without auth returns 403',
    { tag: ['@regression', '@deletebooking'] },
    async ({ bookingClient, createBooking }) => {
      const { id: bookingId } = await createBooking({ firstname: 'Delete', lastname: 'NoAuth' });
      const context = apiContext('delete without auth', 'DELETE', `/booking/${bookingId}`);

      const response = await test.step('Delete booking without auth', async () =>
        bookingClient.deleteBooking(bookingId),
      );

      await test.step('Assert 403 status', async () => {
        await ResponseValidator.assertExactStatus(response, context, 403);
      });
    },
  );

  test(
    'positive: delete with cookie token returns 201',
    { tag: ['@regression', '@deletebooking'] },
    async ({ bookingClient, authToken, createBooking }) => {
      const { id: bookingId } = await createBooking({ firstname: 'Delete', lastname: 'Cookie' });
      const context = apiContext('delete with cookie token', 'DELETE', `/booking/${bookingId}`);

      const response = await test.step('Delete booking with cookie token', async () =>
        bookingClient.deleteBooking(bookingId, { token: authToken }),
      );

      await test.step('Assert delete response', async () => {
        await ResponseValidator.assertExactStatus(response, context, 201);
        await ResponseValidator.assertBodyEquals(response, context, 'Created');
      });
    },
  );

  test(
    'positive: delete with basic auth returns 201',
    { tag: ['@regression', '@deletebooking'] },
    async ({ bookingClient, createBooking }) => {
      const { id: bookingId } = await createBooking({ firstname: 'Delete', lastname: 'Basic' });
      const context = apiContext('delete with basic auth', 'DELETE', `/booking/${bookingId}`);

      const response = await test.step('Delete booking with basic auth', async () =>
        bookingClient.deleteBooking(bookingId, { basicAuth: true }),
      );

      await test.step('Assert 201 status', async () => {
        await ResponseValidator.assertExactStatus(response, context, 201);
      });
    },
  );

  test(
    'negative: delete already deleted booking returns 405',
    { tag: ['@regression', '@deletebooking'] },
    async ({ bookingClient, authToken, createBooking }) => {
      const { id: bookingId } = await createBooking({ firstname: 'Delete', lastname: 'Twice' });
      const context = apiContext(
        'delete already deleted booking',
        'DELETE',
        `/booking/${bookingId}`,
      );

      await test.step('Delete booking first time', async () => {
        await bookingClient.deleteBooking(bookingId, { token: authToken });
      });

      const response = await test.step('Delete booking second time', async () =>
        bookingClient.deleteBooking(bookingId, { token: authToken }),
      );

      await test.step('Assert 405 status', async () => {
        await ResponseValidator.assertExactStatus(response, context, 405);
      });
    },
  );

  test(
    'verify deleted booking returns 404 on GET',
    { tag: ['@regression', '@deletebooking'] },
    async ({ bookingClient, authToken, createBooking }) => {
      const { id: bookingId } = await createBooking({ firstname: 'Delete', lastname: 'Verify' });
      const context = apiContext('get deleted booking', 'GET', `/booking/${bookingId}`);

      await test.step('Delete booking', async () => {
        await bookingClient.deleteBooking(bookingId, { token: authToken });
      });

      const getResponse = await test.step('Get deleted booking', async () =>
        bookingClient.getBooking(bookingId),
      );

      await test.step('Assert 404 status', async () => {
        await ResponseValidator.assertExactStatus(getResponse, context, 404);
      });
    },
  );
});
