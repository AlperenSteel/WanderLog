// ─────────────────────── Map intensity colors ───────────────────────
// MapLibre choropleth renk skalası (wanderlog.md Bölüm 2)
export const INTENSITY_COLOR_SCALE = [
  { threshold: 0, color: 'rgba(0,0,0,0)' },    // hiç gidilmemiş
  { threshold: 0.25, color: '#D9F0DB' },         // az
  { threshold: 0.5, color: '#8FD69B' },
  { threshold: 0.75, color: '#41A85F' },
  { threshold: 1.0, color: '#14532D' },          // çok
] as const;

// ─────────────────────── Error codes ───────────────────────
export const ERROR_CODES = {
  // Auth
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_REUSED: 'TOKEN_REUSED',
  SESSION_NOT_FOUND: 'SESSION_NOT_FOUND',

  // Users
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  EMAIL_TAKEN: 'EMAIL_TAKEN',

  // Routes
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  ROUTE_ACCESS_DENIED: 'ROUTE_ACCESS_DENIED',
  DUPLICATE_CLIENT_ID: 'DUPLICATE_CLIENT_ID',

  // Memories
  MEMORY_NOT_FOUND: 'MEMORY_NOT_FOUND',

  // General
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

// ─────────────────────── Stamp tiers ───────────────────────
export const STAMP_TIER_THRESHOLDS = {
  VISITOR: 0,       // sadece ayak bastım
  EXPLORER: 50_000, // 50 km+
  RESIDENT: 500_000, // 500 km+
} as const;
