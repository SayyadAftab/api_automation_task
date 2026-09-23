import { APIResponse } from '@playwright/test';
import { formatFailure } from '../helpers/failure-format.helper';
import { AcceptContentType } from '../types/content-type.types';
import { ApiCallContext } from '../types/contract.types';
import { ContractValidator } from './contract.validator';

export class ResponseValidator {
  static async assertExactStatus(
    response: APIResponse,
    context: ApiCallContext,
    expectedStatus: number,
  ): Promise<void> {
    await ContractValidator.assertExactStatus(response, context, expectedStatus);
  }

  static async assertJsonContentType(
    response: APIResponse,
    context: ApiCallContext,
  ): Promise<void> {
    await ContractValidator.assertContentType(response, context, 'application/json');
  }

  static async assertContract(
    response: APIResponse,
    context: ApiCallContext,
    expected: { status: number; bodyIncludes?: string },
  ): Promise<void> {
    await ContractValidator.assertContract(response, context, expected);
  }

  static async assertBodyEquals(
    response: APIResponse,
    context: ApiCallContext,
    expectedBody: string,
  ): Promise<void> {
    await ContractValidator.assertBodyEquals(response, context, expectedBody);
  }

  static async assertResponseFormat(
    response: APIResponse,
    context: ApiCallContext,
    accept: AcceptContentType,
  ): Promise<void> {
    const body = await response.text();

    if (accept === AcceptContentType.JSON) {
      await this.assertJsonContentType(response, context);
      try {
        JSON.parse(body);
      } catch {
        throw new Error(
          formatFailure(
            context,
            'Failure Reason:\nResponse body is not valid JSON',
            'Valid JSON',
            'Invalid JSON',
            body,
          ),
        );
      }
      return;
    }

    const isXml = body.trim().startsWith('<?xml') || body.includes('<booking>');
    if (!isXml) {
      throw new Error(
        formatFailure(
          context,
          'Failure Reason:\nResponse body is not valid XML',
          'Valid XML booking document',
          `Body preview: ${body.slice(0, 120)}`,
          body,
        ),
      );
    }
  }
}
