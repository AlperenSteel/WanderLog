# Wanderprint — Geliştirme Yol Haritası

> Seyahat rotalarını kaydeden, dünya haritası üzerinde görselleştiren ve paylaşılabilir bir hatıra defterine dönüştüren mobil uygulama.

---

## İçindekiler

1. [Ürün Vizyonu](#1-ürün-vizyonu)0
2. [Teknoloji Kararları ve Gerekçeleri](#2-teknoloji-kararları-ve-gerekçeleri)
3. [Sistem Mimarisi](#3-sistem-mimarisi)
4. [Repo Yapısı (Monorepo)](#4-repo-yapısı-monorepo)
5. [Veri Modeli](#5-veri-modeli)
6. [Coğrafi Veri Stratejisi (PostGIS)](#6-coğrafi-veri-stratejisi-postgis)
7. [API Sözleşmesi](#7-api-sözleşmesi)
8. [Geliştirme Modülleri](#8-geliştirme-modülleri)
9. [Ortak Standartlar](#9-ortak-standartlar)
10. [Test Stratejisi](#10-test-stratejisi)
11. [Deployment ve Operasyon](#11-deployment-ve-operasyon)
12. [Gelecek Özellikler](#12-gelecek-özellikler)

---

## 1. Ürün Vizyonu

### Tek cümlelik tanım

Kullanıcılar yurt dışı seyahatlerinde yürüdükleri rotaları GPS ile kaydeder ya da harita üzerinde çizer; bu rotalar fotoğraf ve notlarla zenginleştirilmiş bir hatıra koleksiyonuna dönüşür ve dünya haritası üzerinde ziyaret yoğunluğuna göre renklendirilmiş bir "seyahat pasaportu" oluşturur.

### Strava'dan farkı

| Strava | Wanderprint |
|---|---|
| Performans odaklı (hız, tempo, kalp atışı) | **Hatıra odaklı** (fotoğraf, not, hikâye) |
| Aktivite = antrenman | Aktivite = **anı** |
| Yerel rotalarda tekrar | **Ülke/şehir keşfi**, tekrar etmeyen rotalar |
| Segment yarışması | **Koleksiyon ve keşif** (pasaport damgaları) |

### Çekirdek kullanıcı hikâyeleri (MVP)

```
US-01  Kullanıcı olarak, yeni bir şehirde yürürken uygulamayı açıp
       "Kaydı Başlat" diyebilmeliyim ki rotam otomatik çizilsin.

US-02  Kullanıcı olarak, kayıt sırasında durup fotoğraf çekebilmeliyim
       ki o an rotamın üzerinde bir "Anı Pini" olarak işaretlensin.

US-03  Kullanıcı olarak, kaydı bitirdiğimde rotamın hangi ülke ve
       şehirden geçtiğini otomatik görmeliyim ki manuel giriş yapmayayım.

US-04  Kullanıcı olarak, dünya haritasında ziyaret ettiğim ülkeleri
       yoğunluğa göre farklı yeşil tonlarında görmeliyim ki
       seyahat geçmişimi tek bakışta kavrayabileyim.

US-05  Kullanıcı olarak, bir ülkeye dokunduğumda oradaki toplam mesafe,
       gün sayısı ve rota listemi görebilmeliyim.

US-06  Kullanıcı olarak, bir rotamı arkadaşımla paylaşabilmeliyim.

US-07  Kullanıcı olarak, başka kullanıcıları takip edip onların
       yeni rotalarını bir akışta görebilmeliyim.

US-08  Kullanıcı olarak, GPS kaydı yapamadığım geçmiş bir seyahati
       harita üzerinde manuel çizerek ekleyebilmeliyim.
```

---

## 2. Teknoloji Kararları ve Gerekçeleri

### Karar tablosu

| Katman | Seçim | Gerekçe |
|---|---|---|
| Mobil | **React Native + Expo (TypeScript)** | Tek kod tabanı, EAS Build ile kolay dağıtım, background location için olgun kütüphaneler |
| Harita | **MapLibre GL Native** (`@maplibre/maplibre-react-native`) | Choropleth (ülke boyama) için data-driven styling zorunlu; ücretsiz; vendor-agnostic |
| Tile sağlayıcı | **OpenFreeMap / Protomaps** (başlangıç) | Sıfır maliyet, ihtiyaç halinde Mapbox'a config değişikliğiyle geçiş |
| Backend | **Express + TypeScript** | Sade, açık; her katmanı kendin kurduğun için production davranışını tam kontrol edersin |
| ORM | **Prisma** | Tip güvenli sorgular, migration yönetimi; PostGIS için `$queryRaw` kaçış kapısı var |
| Veritabanı | **PostgreSQL 16 + PostGIS 3.4** | Coğrafi hesapların veritabanında yapılması şart (aşağıda detaylı) |
| Cache / Kuyruk | **Redis + BullMQ** | Refresh token blacklist, rate limit sayaçları, ağır coğrafi işler için job queue |
| Auth | **Kendi JWT sistemi** (+ Modül 12'de OAuth) | Bağımsızlık, veri sahipliği, taşınabilirlik |
| Medya | **Local disk → S3 uyumlu depolama** | Storage katmanı arayüz arkasına alınır, taşıma tek dosya değişikliği olur |
| Validasyon | **Zod** | Şema tanımını backend ve mobil arasında paylaşabilme |
| Loglama | **Pino** | JSON structured log, düşük overhead |
| Test | **Vitest + Supertest + Testcontainers** | Gerçek PostGIS'e karşı entegrasyon testi |

### Neden Google Maps değil?

Sadece mobil hedeflendiği için Google Maps SDK'nın harita gösterimi ücretsizdir — maliyet bir engel değil. Ancak çekirdek özelliğimiz olan **choropleth ülke boyama** Google Maps SDK'da her ülke için ayrı `Polygon` nesnesi oluşturmayı gerektirir. Yaklaşık 250 ülke, on binlerce koordinat noktası ile bu, mobil cihazda kabul edilemez bir render maliyeti doğurur.

MapLibre'de aynı iş bir vektör kaynağı ve tek bir stil ifadesiyle çözülür:

```ts
// Ülke renklendirmesi — GPU tarafında, tek ifade
fillColor: [
  'interpolate', ['linear'], ['coalesce', ['feature-state', 'intensity'], 0],
  0,    'rgba(0,0,0,0)',        // hiç gidilmemiş
  0.25, '#D9F0DB',              // az
  0.50, '#8FD69B',
  0.75, '#41A85F',
  1.0,  '#14532D'               // çok
]
```

Ayrıca ülke sınırı verisi olarak **Natural Earth Admin-0** (public domain) kullanılacağı için harici bir servise sorgu atma ihtiyacı tamamen ortadan kalkar — reverse geocoding maliyeti de sıfırlanır.

### Kendi JWT sistemimizin kapsamı

**Üstleneceğimiz sorumluluklar:**
- Argon2id ile şifre hash'leme
- Kısa ömürlü access token (15 dk) + uzun ömürlü refresh token (30 gün)
- Refresh token rotation + reuse detection (çalınan token tespiti)
- Cihaz bazlı oturum yönetimi
- Rate limiting ve brute-force koruması
- E-posta doğrulama ve şifre sıfırlama akışları

**Riskler ve azaltma:**

| Risk | Azaltma |
|---|---|
| Token sızması | Kısa ömür + rotation + reuse detection ile hasar penceresi daraltılır |
| Apple App Store politikası: sosyal login sunuyorsan "Sign in with Apple" zorunlu | Modül 12'de OAuth eklenirken Apple da aynı anda eklenir |
| E-posta gönderimi altyapısı | Resend veya AWS SES; soyut `MailService` arayüzü arkasında |
| Şifre sıfırlama token'ı güvenliği | Tek kullanımlık, 15 dk ömürlü, hash'lenerek saklanan token |

---

## 3. Sistem Mimarisi

```
┌──────────────────────────────────────────────────────────────┐
│                    MOBİL (Expo / React Native)               │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐              │
│  │  Ekranlar  │  │  MapLibre  │  │ Background │              │
│  │ (Expo      │  │  Harita    │  │  Location  │              │
│  │  Router)   │  │  Katmanı   │  │  Task      │              │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘              │
│        │               │               │                     │
│  ┌─────┴───────────────┴───────────────┴──────┐              │
│  │   State: TanStack Query + Zustand          │              │
│  └─────┬──────────────────────────┬───────────┘              │
│        │                          │                          │
│  ┌─────┴──────┐            ┌──────┴──────────┐               │
│  │ API Client │            │ SQLite (offline │               │
│  │  (Axios)   │            │  outbox + cache)│               │
│  └─────┬──────┘            └─────────────────┘               │
└────────┼─────────────────────────────────────────────────────┘
         │ HTTPS / JSON
┌────────┼─────────────────────────────────────────────────────┐
│        ▼            BACKEND (Express + TypeScript)           │
│  ┌──────────────────────────────────────────────┐            │
│  │ Middleware: helmet · cors · rateLimit · auth │            │
│  │             requestId · zodValidate · error  │            │
│  └────────────────────┬─────────────────────────┘            │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────┐            │
│  │ Routes → Controllers (HTTP katmanı)          │            │
│  └────────────────────┬─────────────────────────┘            │
│                       ▼                                      │
│  ┌──────────────────────────────────────────────┐            │
│  │ Services (iş mantığı — HTTP'den bağımsız)    │            │
│  └────────┬─────────────────────┬───────────────┘            │
│           ▼                     ▼                            │
│  ┌────────────────┐   ┌──────────────────┐                   │
│  │ Repositories   │   │ Adapters         │                   │
│  │ (Prisma + raw  │   │ Storage · Mail   │                   │
│  │  PostGIS SQL)  │   │ Push · Queue     │                   │
│  └────────┬───────┘   └────────┬─────────┘                   │
└───────────┼────────────────────┼─────────────────────────────┘
            ▼                    ▼
   ┌──────────────────┐   ┌─────────────┐  ┌──────────────┐
   │ PostgreSQL       │   │   Redis     │  │ Object Store │
   │ + PostGIS        │   │ + BullMQ    │  │ (local → S3) │
   └──────────────────┘   └─────────────┘  └──────────────┘
```

### Katman kuralları (ihlal edilmeyecek)

1. **Controller** HTTP bilir, iş mantığı bilmez. Girdi doğrular, servisi çağırır, yanıt biçimlendirir.
2. **Service** iş mantığı bilir, HTTP bilmez. `req`/`res` asla servise geçmez.
3. **Repository** veritabanı bilir, iş mantığı bilmez.
4. **Adapter** dış dünyayı (dosya, mail, push) soyutlar. Servis somut sağlayıcıyı asla bilmez.

Bu kural sayesinde local disk → S3 geçişi tek dosyanın değişmesiyle olur.

---

## 4. Repo Yapısı (Monorepo)

```
wanderprint/
├── package.json                 # pnpm workspace kökü
├── pnpm-workspace.yaml
├── turbo.json                   # görev orkestrasyonu
├── docker-compose.yml           # postgis + redis (yerel geliştirme)
├── .env.example
│
├── packages/
│   ├── shared/                  # ⚠️ HER İKİ TARAFIN PAYLAŞTIĞI
│   │   ├── src/
│   │   │   ├── schemas/         # Zod şemaları (tek doğruluk kaynağı)
│   │   │   │   ├── auth.schema.ts
│   │   │   │   ├── route.schema.ts
│   │   │   │   ├── memory.schema.ts
│   │   │   │   └── social.schema.ts
│   │   │   ├── types/           # Zod'dan türetilen TS tipleri
│   │   │   ├── constants/       # renk skalaları, hata kodları
│   │   │   └── geo/             # haversine, polyline encode/decode
│   │   └── package.json
│   │
│   └── config/                  # paylaşılan eslint/tsconfig
│
├── apps/
│   ├── api/                     # BACKEND
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── src/
│   │   │   ├── index.ts         # sunucu başlatma
│   │   │   ├── app.ts           # Express uygulaması (test edilebilir)
│   │   │   ├── config/          # env doğrulama (Zod)
│   │   │   ├── middleware/
│   │   │   ├── modules/
│   │   │   │   ├── auth/        # controller · service · repository · routes
│   │   │   │   ├── users/
│   │   │   │   ├── routes/      # seyahat rotaları
│   │   │   │   ├── memories/    # anı pinleri
│   │   │   │   ├── geo/         # ülke tespiti, istatistik
│   │   │   │   ├── social/      # takip, feed
│   │   │   │   └── media/
│   │   │   ├── adapters/
│   │   │   │   ├── storage/     # LocalStorage · S3Storage
│   │   │   │   ├── mail/
│   │   │   │   └── push/
│   │   │   ├── jobs/            # BullMQ worker'ları
│   │   │   └── lib/             # prisma client, redis, logger
│   │   └── tests/
│   │
│   └── mobile/                  # FRONTEND
│       ├── app/                 # Expo Router (dosya bazlı yönlendirme)
│       │   ├── (auth)/
│       │   │   ├── login.tsx
│       │   │   └── register.tsx
│       │   ├── (tabs)/
│       │   │   ├── index.tsx        # Dünya haritası
│       │   │   ├── record.tsx       # Kayıt ekranı
│       │   │   ├── feed.tsx         # Sosyal akış
│       │   │   ├── passport.tsx     # Pasaport
│       │   │   └── profile.tsx
│       │   ├── route/[id].tsx
│       │   └── country/[code].tsx
│       ├── src/
│       │   ├── api/             # TanStack Query hook'ları
│       │   ├── components/
│       │   │   ├── map/
│       │   │   ├── ui/          # tasarım sistemi
│       │   │   └── route/
│       │   ├── features/
│       │   │   ├── tracking/    # GPS kayıt mantığı
│       │   │   ├── drawing/     # manuel çizim
│       │   │   └── replay/      # rota oynatıcı
│       │   ├── store/           # Zustand
│       │   ├── db/              # SQLite (offline)
│       │   ├── hooks/
│       │   └── theme/
│       ├── assets/
│       │   └── geo/             # countries.pmtiles (ülke sınırları)
│       └── app.json
│
└── docs/
    ├── api.md                   # OpenAPI'den üretilen
    ├── adr/                     # mimari karar kayıtları
    └── ROADMAP.md               # bu dosya
```

**Neden monorepo?** `packages/shared` içindeki Zod şemaları hem backend'de doğrulama hem mobilde tip üretimi için kullanılır. Backend'de bir alan değişince mobil tarafta TypeScript **derleme zamanında** hata verir. Bu, iki tarafın koordineli ilerlemesinin teknik garantisidir.

---

## 5. Veri Modeli

### Prisma şeması (özet)

```prisma
// apps/api/prisma/schema.prisma

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [postgis]
}

// ─────────────────────── KULLANICI ───────────────────────

model User {
  id             String    @id @default(uuid()) @db.Uuid
  email          String    @unique
  passwordHash   String?                        // OAuth-only kullanıcılarda null
  username       String    @unique
  displayName    String
  avatarUrl      String?
  bio            String?   @db.VarChar(280)
  homeCountry    String?   @db.Char(2)          // ISO 3166-1 alpha-2
  emailVerifiedAt DateTime?
  isPrivate      Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?                      // soft delete

  routes         Route[]
  sessions       Session[]
  oauthAccounts  OAuthAccount[]
  following      Follow[]  @relation("follower")
  followers      Follow[]  @relation("following")
  likes          Like[]
  comments       Comment[]
  countryStats   UserCountryStat[]
  stamps         PassportStamp[]

  @@index([username])
  @@index([email])
}

model Session {
  id                String   @id @default(uuid()) @db.Uuid
  userId            String   @db.Uuid
  refreshTokenHash  String   @unique            // token asla düz saklanmaz
  familyId          String   @db.Uuid           // rotation zinciri
  deviceName        String?
  deviceId          String?
  ipAddress         String?
  expiresAt         DateTime
  revokedAt         DateTime?
  createdAt         DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([familyId])
}

model OAuthAccount {
  id             String   @id @default(uuid()) @db.Uuid
  userId         String   @db.Uuid
  provider       OAuthProvider
  providerUserId String
  createdAt      DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerUserId])
}

enum OAuthProvider { GOOGLE APPLE }

// ─────────────────────── ROTA ───────────────────────

model Route {
  id            String       @id @default(uuid()) @db.Uuid
  userId        String       @db.Uuid
  title         String       @db.VarChar(120)
  description   String?      @db.VarChar(2000)
  source        RouteSource                       // GPS_TRACKED | MANUAL_DRAWN
  visibility    Visibility   @default(PRIVATE)

  // Coğrafi veri — PostGIS
  path          Unsupported("geography(LineString, 4326)")
  simplifiedPath Unsupported("geography(LineString, 4326)")?  // liste görünümü için
  bbox          Unsupported("geography(Polygon, 4326)")?
  startPoint    Unsupported("geography(Point, 4326)")

  // Türetilmiş metrikler (yazma anında hesaplanır)
  distanceMeters Float
  durationSeconds Int?
  elevationGainM  Float?
  pointCount      Int

  startedAt     DateTime
  endedAt       DateTime?
  coverPhotoUrl String?

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  deletedAt     DateTime?

  user          User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  memories      Memory[]
  countries     RouteCountry[]
  likes         Like[]
  comments      Comment[]
  shareLinks    ShareLink[]

  @@index([userId, startedAt(sort: Desc)])
  @@index([visibility, createdAt(sort: Desc)])
}

enum RouteSource { GPS_TRACKED MANUAL_DRAWN IMPORTED_GPX }
enum Visibility  { PRIVATE FOLLOWERS PUBLIC }

// Rota ↔ Ülke (bir rota birden fazla ülkeden geçebilir)
model RouteCountry {
  routeId        String @db.Uuid
  countryCode    String @db.Char(2)
  distanceMeters Float                    // o ülkedeki kısmın uzunluğu

  route   Route   @relation(fields: [routeId], references: [id], onDelete: Cascade)
  country Country @relation(fields: [countryCode], references: [code])

  @@id([routeId, countryCode])
}

model Country {
  code       String  @id @db.Char(2)
  nameEn     String
  nameTr     String
  continent  String
  geometry   Unsupported("geography(MultiPolygon, 4326)")

  routes     RouteCountry[]
  stats      UserCountryStat[]
}

// ─────────────────────── ANI PİNLERİ ───────────────────────

model Memory {
  id          String     @id @default(uuid()) @db.Uuid
  routeId     String     @db.Uuid
  type        MemoryType
  location    Unsupported("geography(Point, 4326)")
  distanceFromStart Float                  // replay senkronizasyonu için
  caption     String?    @db.VarChar(1000)
  mediaUrl    String?
  thumbnailUrl String?
  capturedAt  DateTime
  createdAt   DateTime   @default(now())

  route Route @relation(fields: [routeId], references: [id], onDelete: Cascade)

  @@index([routeId, distanceFromStart])
}

enum MemoryType { PHOTO NOTE AUDIO }

// ─────────────────────── İSTATİSTİK (denormalize) ───────────────────────

model UserCountryStat {
  userId          String   @db.Uuid
  countryCode     String   @db.Char(2)
  totalDistanceM  Float    @default(0)
  routeCount      Int      @default(0)
  daysSpent       Int      @default(0)
  citiesVisited   Int      @default(0)
  firstVisitAt    DateTime
  lastVisitAt     DateTime
  intensityScore  Float    @default(0)     // 0–1, harita rengi bu değerden

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  country Country @relation(fields: [countryCode], references: [code])

  @@id([userId, countryCode])
}

model PassportStamp {
  id          String   @id @default(uuid()) @db.Uuid
  userId      String   @db.Uuid
  countryCode String   @db.Char(2)
  tier        StampTier                    // ziyaret derinliğine göre
  earnedAt    DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, countryCode])
}

enum StampTier { VISITOR EXPLORER RESIDENT }

// ─────────────────────── SOSYAL ───────────────────────

model Follow {
  followerId  String   @db.Uuid
  followingId String   @db.Uuid
  createdAt   DateTime @default(now())

  follower  User @relation("follower",  fields: [followerId],  references: [id], onDelete: Cascade)
  following User @relation("following", fields: [followingId], references: [id], onDelete: Cascade)

  @@id([followerId, followingId])
  @@index([followingId])
}

model Like {
  userId    String   @db.Uuid
  routeId   String   @db.Uuid
  createdAt DateTime @default(now())

  user  User  @relation(fields: [userId],  references: [id], onDelete: Cascade)
  route Route @relation(fields: [routeId], references: [id], onDelete: Cascade)

  @@id([userId, routeId])
}

model Comment {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid
  routeId   String   @db.Uuid
  body      String   @db.VarChar(1000)
  createdAt DateTime @default(now())
  deletedAt DateTime?

  user  User  @relation(fields: [userId],  references: [id], onDelete: Cascade)
  route Route @relation(fields: [routeId], references: [id], onDelete: Cascade)

  @@index([routeId, createdAt(sort: Desc)])
}

model ShareLink {
  id        String   @id @default(uuid()) @db.Uuid
  routeId   String   @db.Uuid
  slug      String   @unique                 // kısa, tahmin edilemez
  expiresAt DateTime?
  viewCount Int      @default(0)
  createdAt DateTime @default(now())

  route Route @relation(fields: [routeId], references: [id], onDelete: Cascade)
}
```

### Kritik tasarım notu: `Unsupported` alanlar

Prisma PostGIS tiplerini native desteklemez. `Unsupported("geography(...)")` kullandığımızda:

- ✅ Migration'lar doğru şekilde üretilir
- ❌ `prisma.route.create()` ile bu alanlara yazamayız
- ❌ `select` ile okuyamayız

**Çözüm deseni:** Coğrafi alanlara erişim her zaman `$queryRaw` / `$executeRaw` ile, repository katmanına hapsedilir. Servis katmanı bunu asla bilmez.

```ts
// modules/routes/route.repository.ts
async createWithGeometry(input: CreateRouteInput, tx: PrismaTx) {
  const wkt = toLineStringWKT(input.points);   // "LINESTRING(lng lat, ...)"

  const [row] = await tx.$queryRaw<{ id: string; distance: number }[]>`
    INSERT INTO "Route" (
      id, "userId", title, source, visibility,
      path, "simplifiedPath", "startPoint", bbox,
      "distanceMeters", "pointCount", "startedAt", "endedAt",
      "createdAt", "updatedAt"
    ) VALUES (
      gen_random_uuid(),
      ${input.userId}::uuid,
      ${input.title},
      ${input.source}::"RouteSource",
      ${input.visibility}::"Visibility",
      ST_GeogFromText(${wkt}),
      ST_Simplify(ST_GeogFromText(${wkt})::geometry, 0.0001)::geography,
      ST_StartPoint(ST_GeogFromText(${wkt})::geometry)::geography,
      ST_Envelope(ST_GeogFromText(${wkt})::geometry)::geography,
      ST_Length(ST_GeogFromText(${wkt})),
      ${input.points.length},
      ${input.startedAt},
      ${input.endedAt},
      now(), now()
    )
    RETURNING id, "distanceMeters" AS distance
  `;
  return row;
}
```

---

## 6. Coğrafi Veri Stratejisi (PostGIS)

Bu bölüm uygulamanın kalbi. Yanlış kurgulanırsa istatistik ekranı kullanılamaz hâle gelir.

### 6.1 Ülke tespiti — harici servis olmadan

Rota kaydedildiğinde hangi ülkelerden geçtiğini bulmak için Natural Earth ülke poligonlarını veritabanına yükleriz. Tek seferlik seed işlemi:

```bash
# Natural Earth Admin-0 (public domain) → PostGIS
ogr2ogr -f PostgreSQL PG:"$DATABASE_URL" ne_10m_admin_0_countries.shp \
  -nln country_geom -lco GEOMETRY_NAME=geometry -t_srs EPSG:4326 -overwrite
```

Sonrasında ülke tespiti tek sorgu:

```sql
-- Rotanın geçtiği ülkeler ve her ülkedeki mesafe
INSERT INTO "RouteCountry" ("routeId", "countryCode", "distanceMeters")
SELECT
  r.id,
  c.code,
  ST_Length(ST_Intersection(r.path::geometry, c.geometry::geometry)::geography)
FROM "Route" r
JOIN "Country" c ON ST_Intersects(r.path::geometry, c.geometry::geometry)
WHERE r.id = $1
ON CONFLICT ("routeId", "countryCode") DO UPDATE
  SET "distanceMeters" = EXCLUDED."distanceMeters";
```

Bu, ayda binlerce reverse-geocoding çağrısının yerini alır. **Maliyet: $0.**

### 6.2 Zorunlu indeksler

```sql
-- Migration'a manuel eklenecek
CREATE INDEX route_path_gist        ON "Route"   USING GIST (path);
CREATE INDEX route_start_gist       ON "Route"   USING GIST ("startPoint");
CREATE INDEX country_geometry_gist  ON "Country" USING GIST (geometry);
CREATE INDEX memory_location_gist   ON "Memory"  USING GIST (location);
```

GIST indeksi olmadan `ST_Intersects` tam tablo taraması yapar — 250 ülke poligonuna karşı her rota için saniyeler sürer.

### 6.3 Yoğunluk skoru (harita renklendirmesi)

`intensityScore` üç bileşenden oluşur ve 0–1 arasına normalize edilir:

```ts
// modules/geo/intensity.service.ts
export function computeIntensity(stat: RawCountryStat): number {
  // Logaritmik ölçek: 5 km ile 500 km arasındaki fark,
  // 500 km ile 5000 km arasındaki farktan daha anlamlıdır
  const distanceScore = Math.min(1, Math.log10(stat.totalDistanceM / 1000 + 1) / 3);
  const timeScore     = Math.min(1, Math.log10(stat.daysSpent + 1) / 2);
  const breadthScore  = Math.min(1, stat.citiesVisited / 10);

  return 0.45 * distanceScore + 0.35 * timeScore + 0.20 * breadthScore;
}
```

Bu skor `UserCountryStat` tablosunda **denormalize** saklanır. Harita ekranı açıldığında tek bir sorgu ile tüm ülke renkleri gelir:

```
GET /api/v1/me/map-data
→ [{ "countryCode": "IT", "intensity": 0.82 }, { "countryCode": "AT", "intensity": 0.34 }, ...]
```

Payload boyutu: ~250 ülke × ~30 byte = **7 KB**. Anında render.

### 6.4 İstatistik güncelleme akışı

Rota kaydedildiğinde ağır hesaplar HTTP isteğini bloklamaz:

```
POST /routes  →  [transaction] rota + geometri yaz  →  201 döner (hızlı)
                       │
                       └→ BullMQ job: "route.processed"
                              ├─ ülke kesişimlerini hesapla
                              ├─ UserCountryStat güncelle
                              ├─ intensityScore yeniden hesapla
                              ├─ PassportStamp kontrolü
                              └─ takipçilere push bildirimi
```

---

## 7. API Sözleşmesi

### Genel kurallar

- Taban yol: `/api/v1`
- Kimlik: `Authorization: Bearer <accessToken>`
- Tüm yanıtlar aşağıdaki zarfta döner
- Sayfalama: **cursor tabanlı** (offset değil — feed'de kayma sorunu olmasın)

```ts
// Başarılı
{ "data": T, "meta"?: { "nextCursor": string | null } }

// Hatalı
{ "error": { "code": "ROUTE_NOT_FOUND", "message": "...", "details"?: {...} } }
```

### Endpoint listesi

| Modül | Metot | Yol | Açıklama |
|---|---|---|---|
| Auth | POST | `/auth/register` | Kayıt |
| | POST | `/auth/login` | Giriş |
| | POST | `/auth/refresh` | Token yenileme (rotation) |
| | POST | `/auth/logout` | Oturum sonlandırma |
| | POST | `/auth/verify-email` | E-posta doğrulama |
| | POST | `/auth/forgot-password` | Sıfırlama talebi |
| | POST | `/auth/reset-password` | Sıfırlama |
| | GET | `/auth/sessions` | Aktif cihazlar |
| | DELETE | `/auth/sessions/:id` | Cihaz çıkışı |
| Users | GET | `/me` | Profilim |
| | PATCH | `/me` | Profil güncelle |
| | GET | `/users/:username` | Profil görüntüle |
| Routes | POST | `/routes` | Rota oluştur |
| | GET | `/routes/:id` | Rota detayı (+ anı pinleri) |
| | PATCH | `/routes/:id` | Güncelle |
| | DELETE | `/routes/:id` | Sil |
| | GET | `/me/routes` | Rotalarım (cursor) |
| | POST | `/routes/import/gpx` | GPX içe aktarma |
| Memories | POST | `/routes/:id/memories` | Anı pini ekle |
| | DELETE | `/memories/:id` | Sil |
| Media | POST | `/media/upload-url` | Yükleme URL'i al |
| Geo | GET | `/me/map-data` | Ülke renk verisi |
| | GET | `/me/stats` | Genel istatistikler |
| | GET | `/me/countries/:code` | Ülke detayı |
| | GET | `/me/passport` | Pasaport damgaları |
| Social | POST | `/users/:id/follow` | Takip et |
| | DELETE | `/users/:id/follow` | Takibi bırak |
| | GET | `/feed` | Akış (cursor) |
| | POST | `/routes/:id/like` | Beğen |
| | POST | `/routes/:id/comments` | Yorum |
| Share | POST | `/routes/:id/share` | Paylaşım linki üret |
| | GET | `/share/:slug` | Herkese açık görüntüleme |

### Rota oluşturma sözleşmesi (paylaşılan Zod şeması)

```ts
// packages/shared/src/schemas/route.schema.ts
import { z } from 'zod';

export const trackPointSchema = z.object({
  lat:      z.number().min(-90).max(90),
  lng:      z.number().min(-180).max(180),
  ele:      z.number().optional(),
  t:        z.number().int(),         // unix ms
  accuracy: z.number().optional(),
});

export const createRouteSchema = z.object({
  title:       z.string().min(1).max(120),
  description: z.string().max(2000).optional(),
  source:      z.enum(['GPS_TRACKED', 'MANUAL_DRAWN', 'IMPORTED_GPX']),
  visibility:  z.enum(['PRIVATE', 'FOLLOWERS', 'PUBLIC']).default('PRIVATE'),
  points:      z.array(trackPointSchema).min(2).max(50_000),
  startedAt:   z.coerce.date(),
  endedAt:     z.coerce.date().optional(),
  clientId:    z.string().uuid(),     // idempotency — çevrimdışı senkron için
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
```

`clientId` alanı kritik: mobil çevrimdışıyken kaydedip sonra senkronize ettiğinde, ağ hatası nedeniyle iki kez gönderilirse aynı rota iki kez oluşmaz.

---

## 8. Geliştirme Modülleri

Her modül şu formatta: **Backend görevleri → Frontend görevleri → Entegrasyon → Bitti kriteri**

Modüller sırayla yapılır. Bir modül "Bitti kriteri"ni karşılamadan sonrakine geçilmez.

---

### 🟦 MODÜL 0 — Temel Altyapı ve Ortam

**Amaç:** Her iki tarafın da çalışan, tip paylaşan bir iskelete sahip olması.

#### Backend
- [ ] pnpm workspace + Turborepo kurulumu
- [ ] `apps/api` — Express + TypeScript + tsx (dev) + tsup (build)
- [ ] `docker-compose.yml`: `postgis/postgis:16-3.4` + `redis:7`
- [ ] Prisma init, `postgis` extension'ı etkinleştir
- [ ] Zod ile env doğrulama (`config/env.ts`) — eksik değişkende başlangıçta çök
- [ ] Pino logger + requestId middleware
- [ ] Merkezi hata sınıfları (`AppError`, `NotFoundError`, `ValidationError`) ve error middleware
- [ ] `GET /health` (DB + Redis bağlantı kontrolü ile)
- [ ] ESLint + Prettier + Husky pre-commit

#### Frontend
- [ ] `npx create-expo-app --template` (TypeScript, Expo Router)
- [ ] `packages/shared` bağımlılığını ekle, tip paylaşımını doğrula
- [ ] Tema sistemi: renk paleti, tipografi ölçeği, spacing token'ları
- [ ] Temel UI bileşenleri: `Button`, `Input`, `Card`, `Sheet`, `Toast`
- [ ] Axios instance + interceptor iskeleti (henüz token yok)
- [ ] TanStack Query provider + Zustand store iskeleti
- [ ] Tab navigasyonu (5 sekme, boş ekranlar)

#### Entegrasyon
- [ ] Mobil `/health` endpoint'ini çağırıp ekranda "API bağlı ✓" gösterir

#### ✅ Bitti kriteri
`pnpm dev` tek komutla API + Expo'yu ayağa kaldırır; mobil uygulama API'ye bağlanıp sağlık durumunu gösterir; `packages/shared`'a eklenen bir tip her iki tarafta da görünür.

---

### 🟦 MODÜL 1 — Veri Modeli ve Coğrafi Temel

**Amaç:** Veritabanının, ülke verisinin ve PostGIS erişim deseninin hazır olması.

#### Backend
- [ ] Tam Prisma şeması (Bölüm 5) yazımı
- [ ] İlk migration + GIST indekslerini içeren manuel migration
- [ ] Natural Earth ülke poligonlarını `Country` tablosuna yükleyen seed script
- [ ] Türkçe ülke isimleri eşleştirmesi
- [ ] `GeoRepository` — PostGIS `$queryRaw` yardımcıları
  - `insertRouteGeometry`, `findIntersectingCountries`, `computeRouteLength`
- [ ] WKT/GeoJSON dönüşüm yardımcıları (`packages/shared/geo`)
- [ ] Testcontainers ile PostGIS entegrasyon testi altyapısı
- [ ] Seed: 3 örnek kullanıcı + 5 örnek rota

#### Frontend
- [ ] MapLibre kurulumu ve ilk harita render'ı
- [ ] Ülke sınırlarını `.pmtiles` olarak paketleme (offline çalışsın)
- [ ] `WorldMap` bileşeni — pan/zoom, sabit renkte ülke fill'i
- [ ] Harita stil dosyası (`assets/map-style.json`)

#### Entegrasyon
- [ ] Seed edilen bir rotanın geometrisi API'den GeoJSON olarak çekilip haritada çizilir

#### ✅ Bitti kriteri
Bir test rotası veritabanına yazıldığında hangi ülkelerden geçtiği doğru hesaplanır; mobilde dünya haritası akıcı şekilde render olur.

---

### 🟦 MODÜL 2 — Kimlik Doğrulama

**Amaç:** Production seviyesinde, kendi kontrolümüzde bir auth sistemi.

#### Backend
- [ ] `POST /auth/register` — Argon2id hash, e-posta benzersizliği
- [ ] `POST /auth/login` — sabit zamanlı karşılaştırma, hatalı girişte generic mesaj
- [ ] Access token (15 dk, HS256) + refresh token (30 gün, opaque + hash'li saklama)
- [ ] **Refresh token rotation:** her yenilemede eski token iptal, yenisi verilir
- [ ] **Reuse detection:** iptal edilmiş bir refresh token kullanılırsa tüm `familyId` iptal edilir
- [ ] `authenticate` middleware — `req.user` doldurur
- [ ] Rate limiting: login için IP+email bazlı, 5 deneme / 15 dk
- [ ] `MailAdapter` arayüzü + konsol implementasyonu (geliştirme)
- [ ] E-posta doğrulama + şifre sıfırlama akışları (tek kullanımlık, hash'li token)
- [ ] `GET /auth/sessions`, `DELETE /auth/sessions/:id`
- [ ] Auth servisi için birim testleri (rotation ve reuse senaryoları dahil)

#### Frontend
- [ ] Kayıt / giriş ekranları, Zod ile client-side doğrulama
- [ ] `expo-secure-store` ile token saklama (asla AsyncStorage değil)
- [ ] Axios response interceptor: 401 → refresh dene → başarısızsa çıkış
- [ ] **Eşzamanlı 401 kuyruğu:** aynı anda 5 istek 401 alırsa tek refresh yapılır
- [ ] `useAuth` hook + Zustand auth store
- [ ] Expo Router ile korumalı rota grupları
- [ ] Açılışta oturum geri yükleme + splash ekranı
- [ ] Şifre sıfırlama ekranları
- [ ] Profil ayarlarında "Aktif cihazlar" ekranı

#### Entegrasyon
- [ ] Uçtan uca akış: kayıt → doğrulama → giriş → token yenileme → çıkış
- [ ] Uygulamayı kapatıp açtığında oturum korunur

#### ✅ Bitti kriteri
Access token süresi dolduğunda kullanıcı hiçbir kesinti hissetmez; çalınmış bir refresh token ile ikinci kullanım tüm oturum ailesini kapatır.

---

### 🟦 MODÜL 3 — GPS Rota Kaydı

**Amaç:** Uygulamanın çekirdek eylemi — yürürken rota çizmek.

#### Backend
- [ ] `POST /routes` — `clientId` ile idempotent oluşturma
- [ ] Transaction: rota yaz → geometri hesapla → `RouteCountry` doldur
- [ ] Nokta sayısı sınırı (50.000) ve payload boyutu koruması
- [ ] `GET /routes/:id` — GeoJSON LineString olarak path döner
- [ ] `GET /me/routes` — cursor sayfalama, `simplifiedPath` ile hafif payload
- [ ] `PATCH /routes/:id`, `DELETE /routes/:id` (soft delete)
- [ ] Sahiplik kontrolü middleware'i

#### Frontend
- [ ] `expo-location` izin akışı (foreground → background, açıklayıcı ekranla)
- [ ] `expo-task-manager` ile arka plan konum görevi
- [ ] **Kayıt state machine:** `IDLE → RECORDING → PAUSED → SAVING → DONE`
- [ ] Konum filtreleme: `accuracy > 50m` olan noktaları at, 10m'den yakın noktaları birleştir
- [ ] Kalman benzeri basit yumuşatma (GPS zıplamalarını engelle)
- [ ] Canlı istatistik paneli: mesafe, süre, ortalama hız
- [ ] Kayıt sırasında harita otomatik takip + "rotayı ortala" butonu
- [ ] Ham noktaları SQLite'a yaz (uygulama çökerse veri kaybolmasın)
- [ ] Kayıt bitince özet ekranı: başlık, açıklama, gizlilik seçimi
- [ ] Pil optimizasyonu: ekran kapalıyken güncelleme aralığını uzat

#### Entegrasyon
- [ ] Kaydedilen rota API'ye gider, dönen `RouteCountry` verisi özet ekranında gösterilir

#### ✅ Bitti kriteri
Telefon cebindeyken 30 dakikalık bir yürüyüş kesintisiz kaydedilir; uygulama arka plandayken veya öldürüldüğünde bile veri kaybolmaz.

---

### 🟦 MODÜL 4 — Manuel Rota Çizimi

**Amaç:** Geçmiş seyahatleri de eklenebilir kılmak (kullanıcı edinme için kritik).

#### Backend
- [ ] `source: MANUAL_DRAWN` desteği (aynı endpoint, farklı doğrulama)
- [ ] Manuel rotalarda `durationSeconds` opsiyonel
- [ ] `POST /routes/import/gpx` — GPX parse + doğrulama

#### Frontend
- [ ] Çizim modu: haritaya dokunarak nokta ekleme
- [ ] Nokta sürükleme, silme, araya nokta ekleme
- [ ] Geri al / ileri al (undo/redo) yığını
- [ ] Canlı mesafe hesabı (haversine, client-side)
- [ ] Tarih aralığı seçici (geçmiş seyahat için)
- [ ] Konum arama (Nominatim — ücretsiz, kullanım politikasına uygun)
- [ ] GPX dosya seçici + içe aktarma önizlemesi

#### ✅ Bitti kriteri
Kullanıcı 3 yıl önceki Roma gezisini haritada çizip tarihiyle birlikte kaydedebilir.

---

### 🟦 MODÜL 5 — Anı Pinleri ve Medya

**Amaç:** Rotayı çizgiden hikâyeye dönüştürmek.

#### Backend
- [ ] `StorageAdapter` arayüzü: `put`, `getUrl`, `delete`
- [ ] `LocalStorageAdapter` — `uploads/` klasörü + statik servis
- [ ] `POST /media/upload-url` — presigned URL deseni (local'de de aynı arayüz)
- [ ] Sharp ile görsel işleme: EXIF temizleme, yeniden boyutlandırma, thumbnail
- [ ] MIME doğrulama (uzantıya değil, magic number'a bakarak)
- [ ] Dosya boyutu limiti (10 MB) ve kullanıcı başına kota
- [ ] `POST /routes/:id/memories` — konum + `distanceFromStart` hesabı
- [ ] `DELETE /memories/:id` — depolamadan da sil
- [ ] Rota silindiğinde medyayı temizleyen BullMQ job

#### Frontend
- [ ] Kayıt ekranında "Anı Ekle" butonu (fotoğraf / not / ses)
- [ ] `expo-camera` + `expo-image-picker` entegrasyonu
- [ ] `expo-av` ile sesli not kaydı
- [ ] Çekim anında konumu yakala
- [ ] Yükleme kuyruğu: çevrimdışıyken beklet, bağlantı gelince gönder
- [ ] Yükleme ilerleme göstergesi
- [ ] Harita üzerinde anı pinleri (fotoğraf thumbnail'li marker)
- [ ] Pin'e dokununca alt sayfada (bottom sheet) detay

#### Entegrasyon
- [ ] Fotoğraf çekildiğinde rotanın doğru noktasında pin belirir
- [ ] Çevrimdışı çekilen 5 fotoğraf bağlantı gelince sırayla yüklenir

#### ✅ Bitti kriteri
Bir rota, üzerinde fotoğraflı duraklar olan gezilebilir bir hikâye olarak görüntülenir.

---

### 🟦 MODÜL 6 — Dünya Haritası ve Renklendirme

**Amaç:** Uygulamanın imza ekranı.

#### Backend
- [ ] `intensityScore` hesaplama servisi (Bölüm 6.3)
- [ ] `UserCountryStat` güncelleme job'ı (`route.processed`)
- [ ] `GET /me/map-data` — hafif payload, Redis'te 5 dk cache
- [ ] Rota silindiğinde istatistiklerin yeniden hesaplanması
- [ ] İstatistik tutarlılığını doğrulayan bakım job'ı (gecelik)

#### Frontend
- [ ] `feature-state` ile data-driven ülke renklendirmesi
- [ ] Renk skalası ve efsane (legend) bileşeni
- [ ] Ülkeye dokunma → alt sayfada özet (mesafe, gün, rota sayısı)
- [ ] "Tüm rotalarımı göster" katmanı (zoom seviyesine göre görünürlük)
- [ ] Zoom'a göre detay: dünya → ülke → şehir → rota
- [ ] Boş durum: hiç rota yoksa açıklayıcı ilk kullanım ekranı
- [ ] Harita verisini cache'leme (uygulama açılışı anında dolu görünsün)

#### ✅ Bitti kriteri
Harita ekranı 500 ms altında dolu render olur; yeni rota eklendiğinde ilgili ülkenin rengi koyulaşır.

---

### 🟦 MODÜL 7 — İstatistikler ve Pasaport

**Amaç:** Veriyi anlamlı ve paylaşılabilir kılmak.

#### Backend
- [ ] `GET /me/stats` — toplam mesafe, ülke sayısı, kıta sayısı, en uzun rota, en aktif ay
- [ ] `GET /me/countries/:code` — ülke detayı + rota listesi
- [ ] `PassportStamp` kazanma mantığı
  - `VISITOR`: ilk rota
  - `EXPLORER`: 50 km veya 3 farklı şehir
  - `RESIDENT`: 30+ gün veya 200 km
- [ ] `GET /me/passport` — kazanılan damgalar

#### Frontend
- [ ] İstatistik ekranı: kart tabanlı düzen, `react-native-skia` ile grafikler
- [ ] Yıllara göre mesafe grafiği
- [ ] Kıta kapsama halkası (donut)
- [ ] **Pasaport ekranı:** ülke damgaları grid'i, kazanılmayanlar soluk
- [ ] Damga kazanma animasyonu (haptic feedback ile)
- [ ] Ülke detay ekranı: rota listesi + mini harita + fotoğraf ızgarası

#### ✅ Bitti kriteri
Kullanıcı pasaport ekranını açtığında koleksiyon hissi oluşur ve eksik damgaları görmek yeni seyahat motivasyonu yaratır.

---

### 🟦 MODÜL 8 — Paylaşım

**Amaç:** Uygulamanın dışına çıkan ilk içerik.

#### Backend
- [ ] `POST /routes/:id/share` — nanoid slug, opsiyonel son kullanma
- [ ] `GET /share/:slug` — kimlik doğrulamasız, salt okunur
- [ ] Paylaşılan sayfa için OpenGraph meta üretimi
- [ ] Statik harita görseli üretimi (paylaşım önizlemesi için)
- [ ] `viewCount` sayacı
- [ ] Paylaşım linkini iptal etme

#### Frontend
- [ ] Rota detayında "Paylaş" butonu → native share sheet
- [ ] Paylaşım öncesi gizlilik uyarısı
- [ ] Görsel kart üretimi (`react-native-view-shot`): harita + istatistik + başlık
- [ ] Instagram Story boyutunda (1080×1920) dışa aktarma
- [ ] Deep link ile paylaşılan rotayı uygulamada açma

#### ✅ Bitti kriteri
Paylaşılan link WhatsApp'ta zengin önizlemeyle görünür; uygulaması olmayan biri rotayı web'de görebilir.

---

### 🟦 MODÜL 9 — Sosyal Katman

**Amaç:** Takip ve akış sistemi.

#### Backend
- [ ] `POST/DELETE /users/:id/follow`
- [ ] Gizli hesaplar için takip isteği akışı
- [ ] `GET /feed` — takip edilenlerin `PUBLIC`/`FOLLOWERS` rotaları, cursor sayfalama
- [ ] Feed sorgusu optimizasyonu (kompozit indeks + `simplifiedPath`)
- [ ] Beğeni ve yorum endpoint'leri
- [ ] Yorum için içerik denetimi (uzunluk, spam koruması)
- [ ] Bildirim tablosu + `PushAdapter` (Expo Push)
- [ ] Kullanıcı arama (`pg_trgm` ile fuzzy)
- [ ] Engelleme ve şikayet mekanizması

#### Frontend
- [ ] Feed ekranı: sonsuz kaydırma, rota önizleme kartı (mini harita + kapak fotoğrafı)
- [ ] Beğeni animasyonu (optimistic update)
- [ ] Yorum alt sayfası
- [ ] Kullanıcı profil ekranı: mini dünya haritası + rota ızgarası
- [ ] Takip / takipçi listeleri
- [ ] Kullanıcı arama
- [ ] Bildirim ekranı + push izin akışı
- [ ] Gizlilik ayarları ekranı

#### Entegrasyon
- [ ] A kullanıcısı B'yi takip eder, B rota paylaşır, A'nın feed'inde ve bildirimlerinde görünür

#### ✅ Bitti kriteri
Feed 60 fps akıcılıkta kaydırılır; 100 rotalık feed'de bellek şişmesi olmaz.

---

### 🟦 MODÜL 10 — Çevrimdışı Destek ve Senkronizasyon

**Amaç:** Yurt dışında internet olmadan da çalışan uygulama. Bu modül **ürünün varlık nedeni** açısından kritik — insanlar yabancı ülkede roaming olmadan geziyor.

#### Backend
- [ ] Toplu senkronizasyon endpoint'i: `POST /sync/routes` (çoklu rota, idempotent)
- [ ] Çakışma çözümü: `updatedAt` karşılaştırması, sunucu kazanır politikası
- [ ] `GET /sync/changes?since=` — artımlı indirme

#### Frontend
- [ ] SQLite şeması (`expo-sqlite`) — sunucu şemasının yerel aynası
- [ ] **Outbox deseni:** her yazma önce yerele, sonra kuyruğa
- [ ] `NetInfo` ile bağlantı dinleme, bağlantı gelince otomatik senkron
- [ ] Üstel geri çekilme (exponential backoff) ile yeniden deneme
- [ ] Senkronizasyon durumu göstergesi (bekleyen N öğe)
- [ ] Harita tile'larını çevrimdışı indirme (bölge seçimli)
- [ ] Çakışma durumunda kullanıcıya seçim sunma

#### ✅ Bitti kriteri
Uçak modunda 3 rota kaydedilip 10 fotoğraf eklenir; wifi'ye bağlanınca hepsi eksiksiz senkronize olur.

---

### 🟦 MODÜL 11 — Replay (Yeniden Yaşa) Modu

**Amaç:** Paylaşımın motoru olacak animasyonlu rota oynatıcı.

#### Backend
- [ ] Replay için optimize edilmiş rota verisi (`memories` konum sırasına göre)
- [ ] Rota önizleme videosunu sunucuda üretme (opsiyonel, BullMQ + ffmpeg)

#### Frontend
- [ ] Animasyon motoru (`react-native-reanimated` + Skia)
- [ ] Kamera rotayı takip eder, çizgi ilerledikçe çizilir
- [ ] Anı pinlerine gelindiğinde fotoğraf belirir, kısa duraklama
- [ ] Oynat / duraklat / hız kontrolü (1x, 2x, 4x)
- [ ] İlerleme çubuğu ile sarma
- [ ] Video dışa aktarma (15 sn, dikey format)

#### ✅ Bitti kriteri
Bir rota 15 saniyede, fotoğraflarıyla birlikte, paylaşılabilir bir video olarak dışa aktarılır.

---

### 🟦 MODÜL 12 — OAuth ve Hesap Güvenliği

**Amaç:** Giriş sürtünmesini azaltmak, App Store gereksinimlerini karşılamak.

#### Backend
- [ ] `POST /auth/oauth/google` — ID token doğrulama (Google public keys)
- [ ] `POST /auth/oauth/apple` — Apple ID token doğrulama
- [ ] Hesap birleştirme: aynı e-posta ile mevcut hesap varsa `OAuthAccount` bağla
- [ ] Şifresiz kullanıcılar için şifre belirleme akışı

#### Frontend
- [ ] `expo-auth-session` ile Google Sign-In
- [ ] `expo-apple-authentication` ile Sign in with Apple (iOS'ta zorunlu)
- [ ] Hesap ayarlarında bağlı hesapları yönetme

#### ✅ Bitti kriteri
Kullanıcı Google ile giriş yapar, sonra aynı e-postayla şifre belirleyip her iki yolla da girebilir.

---

### 🟦 MODÜL 13 — Production Hazırlığı

#### Backend
- [ ] Dockerfile (multi-stage, non-root kullanıcı)
- [ ] GitHub Actions CI: lint → typecheck → test → build
- [ ] Migration'ları deploy öncesi çalıştıran pipeline adımı
- [ ] Sentry entegrasyonu
- [ ] Prometheus metrikleri (`/metrics`)
- [ ] Yapılandırılmış log + korelasyon ID
- [ ] Veritabanı yedekleme stratejisi (günlük snapshot + PITR)
- [ ] Yük testi (k6) — feed ve harita endpoint'lerinde
- [ ] Güvenlik denetimi: `helmet`, CORS whitelist, SQL injection kontrolü, bağımlılık taraması
- [ ] KVKK/GDPR: veri dışa aktarma ve hesap silme endpoint'leri

#### Frontend
- [ ] EAS Build yapılandırması (development / preview / production)
- [ ] Sentry + Expo Updates (OTA)
- [ ] Uygulama ikonu, splash, mağaza görselleri
- [ ] Gizlilik politikası ve kullanım şartları (konum verisi için zorunlu)
- [ ] App Store / Play Store gizlilik beyanları
- [ ] Erişilebilirlik denetimi (kontrast, dokunma alanı, ekran okuyucu)
- [ ] Performans: bundle boyutu, görsel önbellekleme, liste sanallaştırma
- [ ] Türkçe/İngilizce lokalizasyon (`i18n-js`)

#### ✅ Bitti kriteri
Uygulama TestFlight ve Play Internal Testing'de gerçek kullanıcılarla çalışır durumda.

---

## 9. Ortak Standartlar

### Git akışı

```
main          ← production, korumalı
  └─ develop  ← entegrasyon dalı
       ├─ feat/api-auth-jwt
       ├─ feat/mobile-gps-tracking
       └─ fix/route-distance-calc
```

**Commit formatı (Conventional Commits):**
```
feat(api): add refresh token rotation
fix(mobile): prevent duplicate route upload on retry
refactor(shared): extract polyline encoding to shared package
```

### Kodlama kuralları

| Kural | Gerekçe |
|---|---|
| `any` yasak, gerekirse `unknown` + type guard | Tip güvenliği çekirdek karar |
| Servisler `req`/`res` almaz | Test edilebilirlik |
| Tüm dış girdiler Zod'dan geçer | Güvenlik |
| Coğrafi SQL sadece repository katmanında | Sızıntı önleme |
| Frontend'de API tipleri elle yazılmaz | `packages/shared`'dan gelir |
| Her `catch` bloğu ya loglar ya yeniden fırlatır | Sessiz hata olmaz |

### Modül teslim kontrol listesi

Her modül kapatılmadan önce:
- [ ] Backend testleri geçiyor
- [ ] Tip kontrolü her iki tarafta temiz
- [ ] API değişikliği `packages/shared`'a yansıtıldı
- [ ] Manuel uçtan uca test yapıldı
- [ ] Hata durumları (ağ yok, 401, 500) mobilde düzgün gösteriliyor
- [ ] `docs/api.md` güncellendi

---

## 10. Test Stratejisi

```
        ╱╲          E2E (Maestro / Detox)
       ╱  ╲         — kritik akışlar: kayıt, rota kaydı, senkron
      ╱────╲
     ╱      ╲       Entegrasyon (Supertest + Testcontainers)
    ╱        ╲      — gerçek PostGIS'e karşı, tüm endpoint'ler
   ╱──────────╲
  ╱            ╲    Birim (Vitest)
 ╱______________╲   — servisler, coğrafi hesaplar, yoğunluk skoru
```

**Öncelikli test edilecekler:**
1. Refresh token rotation ve reuse detection
2. Rota → ülke kesişimi doğruluğu (bilinen sınır geçen rotalarla)
3. Mesafe hesabının referans değerlerle uyumu
4. Idempotency (aynı `clientId` iki kez gönderilirse)
5. Yetkilendirme: A kullanıcısı B'nin özel rotasına erişemez
6. Çevrimdışı senkron çakışma senaryoları

---

## 11. Deployment ve Operasyon

| Bileşen | Öneri | Alternatif |
|---|---|---|
| API | Fly.io / Railway | Hetzner + Docker |
| PostgreSQL + PostGIS | Neon (PostGIS destekli) | Kendi Docker'ın |
| Redis | Upstash | Kendi Docker'ın |
| Object storage | Cloudflare R2 | AWS S3 |
| Mobil dağıtım | EAS Build + Submit | — |
| Hata izleme | Sentry | — |

**Ortam değişkenleri (`.env.example`):**

```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://wp:wp@localhost:5432/wanderprint
REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=       # openssl rand -base64 48
JWT_REFRESH_SECRET=
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=30d

STORAGE_DRIVER=local     # local | s3
STORAGE_LOCAL_PATH=./uploads
S3_ENDPOINT=
S3_BUCKET=
S3_ACCESS_KEY=
S3_SECRET_KEY=

MAIL_DRIVER=console      # console | resend
RESEND_API_KEY=

CORS_ORIGINS=http://localhost:8081
```

---

## 12. Gelecek Özellikler

MVP sonrası, öncelik sırasına göre:

### Yakın vadede (v1.1 – v1.3)
1. **Akıllı Seyahat Özeti** — bir seyahatteki rotaları otomatik gruplayıp "Roma Gezisi, 5 gün, 47 km" başlıklı bir albüm oluşturma
2. **Yıllık Wrapped** — yıl sonunda kişiselleştirilmiş, animasyonlu seyahat özeti (viralite motoru)
3. **Rota Keşfi** — bulunduğun şehirdeki popüler kullanıcı rotalarını keşfetme ve indirme
4. **Yürüyüş Rehberi Modu** — başkasının rotasını takip ederken sıradaki anı pinini önden görme

### Orta vadede (v2)
5. **Ortak Seyahat** — birden fazla kullanıcının aynı seyahate rota ve anı katkısı (çok-çoklu ilişki + üyelik bazlı yetkilendirme)
6. **Şehir bazlı ısı haritası** — ülke seviyesinden şehir/mahalle seviyesine inen yoğunluk görselleştirmesi
7. **Rozet ve meydan okumalar** — "7 kıta", "Ekvator'u geçtin", "100 şehir"
8. **Wearable entegrasyonu** — Apple Watch / Wear OS ile telefonsuz kayıt

### Uzun vadede (v3+)
9. **Fotoğraf EXIF'inden otomatik rota** — galeri izniyle geçmiş seyahatleri otomatik yeniden inşa etme
10. **Sesli anlatım** — rota üzerinde sesli günlük, replay'de otomatik oynatma
11. **Basılı kitap çıktısı** — seyahat albümünü fiziksel foto kitaba dönüştürme (gelir modeli)
12. **Premium katman** — sınırsız çevrimdışı harita, 4K video dışa aktarma, gelişmiş istatistikler

---

## Ek: Kritik Riskler ve Azaltmaları

| Risk | Etki | Azaltma |
|---|---|---|
| Arka plan konum izni reddi | Çekirdek özellik çalışmaz | Manuel çizim alternatifi (Modül 4) her zaman mevcut |
| iOS arka plan kısıtlamaları | Kayıt kesilir | `significant location change` yedeği + SQLite kalıcılığı |
| Pil tüketimi şikayeti | Kullanıcı kaybı | Uyarlanabilir örnekleme aralığı, kullanıcıya kontrol |
| Büyük rotalarda payload | Yavaş yükleme | Sunucuda `ST_Simplify`, liste görünümünde basitleştirilmiş yol |
| PostGIS öğrenme eğrisi | Gecikme | Modül 1'de tüm coğrafi desenler tek seferde kurulur |
| Konum verisi hassasiyeti | Yasal risk | Varsayılan gizlilik `PRIVATE`, ev konumu maskeleme opsiyonu |

---

*Bu doküman yaşayan bir belgedir. Her modül tamamlandığında "Bitti kriteri" işaretlenir ve öğrenilenler ilgili bölüme geri yazılır.*
