export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiCallContext {
  testName: string;
  method: HttpMethod;
  endpoint: string;
}

export interface ContractExpectation {
  status: number;
  bodyIncludes?: string;
}

export interface NegativeContractCase {
  name: string;
  method: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  status: number;
  bodyIncludes?: string;
  payload?: Record<string, unknown>;
  rawBody?: string;
  contentType?: string;
}
