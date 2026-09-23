import { z } from 'zod';

export const authSuccessSchema = z.object({
  token: z.string().min(1),
});

export const authFailureSchema = z.object({
  reason: z.string(),
});
