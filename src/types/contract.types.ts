export interface ApiCallContext {
  testName: string;
  method: string;
  endpoint: string;
}

export interface ContractExpectation {
  status: number;
  contentType?: string;
  bodyIncludes?: string;
  bodyExcludes?: string;
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
