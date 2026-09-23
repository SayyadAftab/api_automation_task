import { ApiCallContext } from '../types/contract.types';

export function formatFailure(
  context: ApiCallContext,
  reason: string,
  expected: string,
  actual: string,
  responseBody: string,
): string {
  return [
    '-------------------------------------------',
    'API TEST FAILURE',
    '-------------------------------------------',
    `Test: ${context.testName}`,
    '',
    'Endpoint:',
    `${context.method} ${context.endpoint}`,
    '',
    reason,
    '',
    'Expected:',
    expected,
    '',
    'Actual:',
    actual,
    '',
    'Actual Response Body:',
    responseBody || '(empty)',
    '-------------------------------------------',
  ].join('\n');
}
