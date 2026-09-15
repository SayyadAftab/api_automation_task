import { APIResponse, expect } from '@playwright/test';
import { AcceptContentType } from '../types/content-type.types';
import { ApiCallContext } from '../types/contract.types';
import { ContractValidator } from './contract.validator';

export class ResponseValidator {
  static assertExactStatus(
    response: APIResponse,
    context: ApiCallContext,
    expectedStatus: number,
  ): void {
    ContractValidator.assertExactStatus(response, context, expectedStatus);
  }

  static async assertJsonContentType(
    response: APIResponse,
    context: ApiCallContext,
  ): Promise<void> {
    ContractValidator.assertContentType(response, context, 'application/json');
  }

  static async assertContract(
    response: APIResponse,
    context: ApiCallContext,
    expected: { status: number; contentType?: string; bodyIncludes?: string },
  ): Promise<void> {
    await ContractValidator.assertContract(response, context, expected);
  }

  static async assertResponseFormat(
    response: APIResponse,
    context: ApiCallContext,
    accept: AcceptContentType,
  ): Promise<void> {
    const body = await response.text();

    if (accept === AcceptContentType.JSON) {
      await this.assertJsonContentType(response, context);
      expect(
        () => JSON.parse(body),
        `Expected valid JSON body for ${context.method} ${context.endpoint}`,
      ).not.toThrow();
      return;
    }

    const isXml = body.trim().startsWith('<?xml') || body.includes('<booking>');
    expect(
      isXml,
      `Expected XML body for ${context.method} ${context.endpoint} but received: ${body.slice(0, 120)}`,
    ).toBeTruthy();
  }
}
