import { BookingDates, BookingPayload } from '../types/booking.types';
import { RequestContentType } from '../types/content-type.types';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

type PayloadInput = BookingPayload | Partial<BookingPayload> | Record<string, unknown>;

export class BookingRequestBuilder {
  static toJson(payload: PayloadInput): string {
    return JSON.stringify(payload);
  }

  static toXml(payload: PayloadInput, partial = false): string {
    const data = payload as Partial<BookingPayload>;
    const lines = ['<booking>'];

    if (data.firstname !== undefined) {
      lines.push(`  <firstname>${escapeXml(data.firstname)}</firstname>`);
    }
    if (data.lastname !== undefined) {
      lines.push(`  <lastname>${escapeXml(data.lastname)}</lastname>`);
    }
    if (data.totalprice !== undefined) {
      lines.push(`  <totalprice>${data.totalprice}</totalprice>`);
    }
    if (data.depositpaid !== undefined) {
      lines.push(`  <depositpaid>${data.depositpaid}</depositpaid>`);
    }
    if (data.bookingdates) {
      lines.push('  <bookingdates>');
      if (data.bookingdates.checkin) {
        lines.push(`    <checkin>${data.bookingdates.checkin}</checkin>`);
      }
      if (data.bookingdates.checkout) {
        lines.push(`    <checkout>${data.bookingdates.checkout}</checkout>`);
      }
      lines.push('  </bookingdates>');
    }
    if (data.additionalneeds !== undefined) {
      lines.push(`  <additionalneeds>${escapeXml(data.additionalneeds)}</additionalneeds>`);
    }

    lines.push('</booking>');

    if (!partial && !this.isFullBookingPayload(data)) {
      throw new Error('Full XML payload requires all booking fields');
    }

    return lines.join('\n');
  }

  static toUrlEncoded(payload: PayloadInput, partial = false): string {
    const data = payload as Partial<BookingPayload> & {
      bookingdates?: Partial<BookingDates>;
    };
    const params = new URLSearchParams();

    if (data.firstname !== undefined) {
      params.set('firstname', data.firstname);
    }
    if (data.lastname !== undefined) {
      params.set('lastname', data.lastname);
    }
    if (data.totalprice !== undefined) {
      params.set('totalprice', String(data.totalprice));
    }
    if (data.depositpaid !== undefined) {
      params.set('depositpaid', String(data.depositpaid));
    }
    if (data.bookingdates?.checkin) {
      params.set('bookingdates[checkin]', data.bookingdates.checkin);
    }
    if (data.bookingdates?.checkout) {
      params.set('bookingdates[checkout]', data.bookingdates.checkout);
    }
    if (data.additionalneeds !== undefined) {
      params.set('additionalneeds', data.additionalneeds);
    }

    if (!partial && !this.isFullBookingPayload(data)) {
      throw new Error('Full URL encoded payload requires all booking fields');
    }

    return params.toString();
  }

  static build(
    requestType: RequestContentType,
    payload: PayloadInput,
    partial = false,
  ): string {
    switch (requestType) {
      case RequestContentType.JSON:
        return this.toJson(payload);
      case RequestContentType.XML:
        return this.toXml(payload, partial);
      case RequestContentType.URL_ENCODED:
        return this.toUrlEncoded(payload, partial);
      default:
        throw new Error(`Unsupported request type: ${requestType}`);
    }
  }

  private static isFullBookingPayload(data: Partial<BookingPayload>): data is BookingPayload {
    return (
      data.firstname !== undefined &&
      data.lastname !== undefined &&
      data.totalprice !== undefined &&
      data.depositpaid !== undefined &&
      data.bookingdates?.checkin !== undefined &&
      data.bookingdates?.checkout !== undefined &&
      data.additionalneeds !== undefined
    );
  }
}
