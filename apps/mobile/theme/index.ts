// ─────────────────────── Renkler ───────────────────────
export const colors = {
  // Ana arka plan
  background: '#0A0F1E',
  surface: '#111827',
  surfaceElevated: '#1A2233',

  // Birincil — yeşil (choropleth skalasından)
  primary: '#41A85F',
  primaryLight: '#8FD69B',
  primaryDark: '#14532D',
  primaryFaint: '#D9F0DB',

  // İkincil — mavi-mor aksan
  accent: '#6366F1',
  accentLight: '#818CF8',

  // Metin
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#4B5563',

  // Durum
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Sınırlar
  border: '#1F2937',
  borderSubtle: '#111827',

  // Harita
  mapBackground: '#0A0F1E',
} as const;

// ─────────────────────── Tipografi ───────────────────────
export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// ─────────────────────── Spacing ───────────────────────
export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  8: 32,
  10: 40,
  12: 48,
  16: 64,
} as const;

// ─────────────────────── Border radius ───────────────────────
export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const theme = { colors, typography, spacing, radius } as const;
export type Theme = typeof theme;
