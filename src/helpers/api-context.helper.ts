import { ApiCallContext } from '../types/contract.types';

export function apiContext(
  testName: string,
  method: ApiCallContext['method'],
  endpoint: string,
): ApiCallContext {
  return { testName, method, endpoint };
}
