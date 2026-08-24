// ─────────────────────── API Response Types ───────────────────────

export interface ApiSuccess<T> {
  data: T;
  meta?: {
    nextCursor: string | null;
  };
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ─────────────────────── User Types ───────────────────────

export interface UserPublic {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  isPrivate: boolean;
  createdAt: string;
}

export interface UserMe extends UserPublic {
  email: string;
  homeCountry: string | null;
  emailVerifiedAt: string | null;
}

// ─────────────────────── Route Types ───────────────────────

export interface RouteListItem {
  id: string;
  title: string;
  description: string | null;
  source: 'GPS_TRACKED' | 'MANUAL_DRAWN' | 'IMPORTED_GPX';
  visibility: 'PRIVATE' | 'FOLLOWERS' | 'PUBLIC';
  distanceMeters: number;
  durationSeconds: number | null;
  pointCount: number;
  startedAt: string;
  endedAt: string | null;
  coverPhotoUrl: string | null;
  countries: string[];
  likeCount: number;
  commentCount: number;
  user: UserPublic;
}

// ─────────────────────── Geo Types ───────────────────────

export interface MapDataItem {
  countryCode: string;
  intensity: number; // 0–1
}

export interface CountryStat {
  countryCode: string;
  nameEn: string;
  nameTr: string;
  totalDistanceM: number;
  routeCount: number;
  daysSpent: number;
  citiesVisited: number;
  firstVisitAt: string;
  lastVisitAt: string;
  intensityScore: number;
}

export interface UserStats {
  totalDistanceM: number;
  totalRoutes: number;
  countriesVisited: number;
  daysOnRoad: number;
}
