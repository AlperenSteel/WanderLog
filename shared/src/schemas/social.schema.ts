import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.string().min(1).max(1000),
});

export const createShareLinkSchema = z.object({
  expiresInDays: z.number().int().min(1).max(365).optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type CreateShareLinkInput = z.infer<typeof createShareLinkSchema>;
