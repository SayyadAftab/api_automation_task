export enum RequestContentType {
  JSON = 'JSON',
  XML = 'XML',
  URL_ENCODED = 'URL_ENCODED',
}

export enum AcceptContentType {
  JSON = 'application/json',
  XML = 'application/xml',
}

export const requestContentTypeHeaders: Record<RequestContentType, string> = {
  [RequestContentType.JSON]: 'application/json',
  [RequestContentType.XML]: 'text/xml',
  [RequestContentType.URL_ENCODED]: 'application/x-www-form-urlencoded',
};
