import { APIResponse, expect } from '@playwright/test';
import { ApiCallContext, ContractExpectation } from '../types/contract.types';

function formatFailure(
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

export class ContractValidator {
  static async assertContract(
    response: APIResponse,
    context: ApiCallContext,
    expected: ContractExpectation,
  ): Promise<void> {
    const actualStatus = response.status();
    const responseBody = await response.text();
    const actualContentType = response.headers()['content-type'] ?? '';

    if (actualStatus !== expected.status) {
      throw new Error(
        formatFailure(
          context,
          'Failure Reason:\nHTTP status code mismatch',
          `HTTP ${expected.status}`,
          `HTTP ${actualStatus}`,
          responseBody,
        ),
      );
    }

    if (expected.contentType && !actualContentType.includes(expected.contentType)) {
      throw new Error(
        formatFailure(
          context,
          'Failure Reason:\nContent-Type mismatch',
          expected.contentType,
          actualContentType || '(missing)',
          responseBody,
        ),
      );
    }

    if (expected.bodyIncludes && !responseBody.includes(expected.bodyIncludes)) {
      throw new Error(
        formatFailure(
          context,
          `Failure Reason:\nResponse body must contain "${expected.bodyIncludes}"`,
          `Body includes: ${expected.bodyIncludes}`,
          `Body: ${responseBody}`,
          responseBody,
        ),
      );
    }

    if (expected.bodyExcludes && responseBody.includes(expected.bodyExcludes)) {
      throw new Error(
        formatFailure(
          context,
          `Failure Reason:\nResponse body must NOT contain "${expected.bodyExcludes}"`,
          `Body excludes: ${expected.bodyExcludes}`,
          `Body: ${responseBody}`,
          responseBody,
        ),
      );
    }
  }

  static assertExactStatus(
    response: APIResponse,
    context: ApiCallContext,
    expectedStatus: number,
  ): void {
    const actualStatus = response.status();
    expect(
      actualStatus,
      `Expected HTTP status ${expectedStatus} but received ${actualStatus} for ${context.method} ${context.endpoint} (${context.testName})`,
    ).toBe(expectedStatus);
  }

  static assertContentType(
    response: APIResponse,
    context: ApiCallContext,
    expectedContentType: string,
  ): void {
    const actual = response.headers()['content-type'] ?? '';
    expect(
      actual.includes(expectedContentType),
      `Expected Content-Type '${expectedContentType}' but received '${actual || '(missing)'}' for ${context.method} ${context.endpoint} (${context.testName})`,
    ).toBeTruthy();
  }
}
