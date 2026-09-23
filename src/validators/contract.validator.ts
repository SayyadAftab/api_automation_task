import { APIResponse } from '@playwright/test';
import { formatFailure } from '../helpers/failure-format.helper';
import { ApiCallContext, ContractExpectation } from '../types/contract.types';

export class ContractValidator {
  static async assertContract(
    response: APIResponse,
    context: ApiCallContext,
    expected: ContractExpectation,
  ): Promise<void> {
    const actualStatus = response.status();
    const responseBody = await response.text();

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
  }

  static async assertExactStatus(
    response: APIResponse,
    context: ApiCallContext,
    expectedStatus: number,
  ): Promise<void> {
    const actualStatus = response.status();
    if (actualStatus !== expectedStatus) {
      const responseBody = await response.text();
      throw new Error(
        formatFailure(
          context,
          'Failure Reason:\nHTTP status code mismatch',
          `HTTP ${expectedStatus}`,
          `HTTP ${actualStatus}`,
          responseBody,
        ),
      );
    }
  }

  static async assertContentType(
    response: APIResponse,
    context: ApiCallContext,
    expectedContentType: string,
  ): Promise<void> {
    const actual = response.headers()['content-type'] ?? '';
    if (!actual.includes(expectedContentType)) {
      const responseBody = await response.text();
      throw new Error(
        formatFailure(
          context,
          'Failure Reason:\nContent-Type mismatch',
          expectedContentType,
          actual || '(missing)',
          responseBody,
        ),
      );
    }
  }

  static async assertBodyEquals(
    response: APIResponse,
    context: ApiCallContext,
    expectedBody: string,
  ): Promise<void> {
    const actualBody = await response.text();
    if (actualBody !== expectedBody) {
      throw new Error(
        formatFailure(
          context,
          'Failure Reason:\nResponse body mismatch',
          expectedBody,
          actualBody,
          actualBody,
        ),
      );
    }
  }
}
