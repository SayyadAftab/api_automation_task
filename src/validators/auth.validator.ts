import { z } from 'zod';
import { formatFailure } from '../helpers/failure-format.helper';
import { authFailureSchema, authSuccessSchema } from '../schemas/auth.schemas';
import { ApiCallContext } from '../types/contract.types';

function assertSchema<T>(
  schema: z.ZodType<T>,
  data: unknown,
  context: ApiCallContext,
  label: string,
  responseBody: string,
): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `- ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');

    throw new Error(
      formatFailure(
        context,
        `Failure Reason:\n${label} schema validation failed\n${issues}`,
        'Valid schema',
        'Invalid response structure',
        responseBody,
      ),
    );
  }

  return result.data;
}

export class AuthValidator {
  static assertSuccessToken(
    body: unknown,
    context: ApiCallContext,
    responseBody: string,
  ): string {
    const parsed = assertSchema(authSuccessSchema, body, context, 'Auth success', responseBody);
    return parsed.token;
  }

  static assertFailureReason(
    body: unknown,
    context: ApiCallContext,
    expectedReason: string,
    responseBody: string,
  ): void {
    const parsed = assertSchema(authFailureSchema, body, context, 'Auth failure', responseBody);
    if (parsed.reason !== expectedReason) {
      throw new Error(
        formatFailure(
          context,
          'Failure Reason:\nAuth failure reason mismatch',
          expectedReason,
          parsed.reason,
          responseBody,
        ),
      );
    }
  }

  static assertNoToken(
    body: Record<string, unknown>,
    context: ApiCallContext,
    responseBody: string,
  ): void {
    if (body.token !== undefined) {
      throw new Error(
        formatFailure(
          context,
          'Failure Reason:\nToken should not be present in response',
          'token: undefined',
          `token: ${String(body.token)}`,
          responseBody,
        ),
      );
    }
  }
}
