import { z } from 'zod';

export const createMemorySchema = z.object({
  type: z.enum(['PHOTO', 'NOTE', 'AUDIO']),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  caption: z.string().max(1000).optional(),
  mediaUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional(),
  capturedAt: z.coerce.date(),
  distanceFromStart: z.number().min(0),
});

export type CreateMemoryInput = z.infer<typeof createMemorySchema>;
