import { z } from 'zod';

export const trackPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  ele: z.number().optional(),
  t: z.number().int(), // unix ms
  accuracy: z.number().optional(),
});

export const createRouteSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  source: z.enum(['GPS_TRACKED', 'MANUAL_DRAWN', 'IMPORTED_GPX']),
  visibility: z.enum(['PRIVATE', 'FOLLOWERS', 'PUBLIC']).default('PRIVATE'),
  points: z.array(trackPointSchema).min(2).max(50_000),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date().optional(),
  clientId: z.string().uuid(), // idempotency — çevrimdışı senkron için
});

export const updateRouteSchema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().max(2000).optional(),
  visibility: z.enum(['PRIVATE', 'FOLLOWERS', 'PUBLIC']).optional(),
  coverPhotoUrl: z.string().url().optional(),
});

export const paginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type TrackPoint = z.infer<typeof trackPointSchema>;
export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
