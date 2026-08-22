# 📁 Wanderprint — Dizin Rehberi

> Her klasörün ve dosyanın ne işe yaradığını açıklar.

---

## 🗺️ Büyük Resim: Frontend & Backend Nerede?

```
WanderLog/
│
├── apps/
│   ├── api/        ◄── 🔵 BACKEND  (Express sunucusu)
│   └── mobile/     ◄── 🟢 FRONTEND (Expo mobil uygulama)
│
├── packages/
│   └── shared/     ◄── 🟡 ORTAK    (İki tarafın paylaştığı kod)
│
└── docs/           ◄── 📄 DOKÜMANTASYON
```

> **Neden `frontend/` ve `backend/` değil de `apps/`?**
> Bu yapı **monorepo standardı** — birden fazla uygulama (`api`, `mobile`, ileride `web`) aynı repoda `apps/` altında yaşar. Yani `apps/api` = backend, `apps/mobile` = frontend.

---

## 🔵 BACKEND — `apps/api/`

```
apps/api/
├── prisma/
│   ├── schema.prisma     ← Veritabanı modeli (tablolar, ilişkiler)
│   └── seed.ts           ← DB'ye örnek veri yükleyen script
│
├── src/
│   ├── index.ts          ← Sunucuyu başlatan dosya (npm run dev buradan başlar)
│   ├── app.ts            ← Express uygulamasının tanımı (middleware, route'lar)
│   │
│   ├── config/
│   │   └── env.ts        ← .env dosyasını okur, eksik değişkende çöker
│   │
│   ├── lib/              ← Tekrar kullanılan yardımcı araçlar
│   │   ├── prisma.ts     ← Veritabanı bağlantısı (Prisma client)
│   │   ├── redis.ts      ← Redis bağlantısı (cache & kuyruk)
│   │   ├── logger.ts     ← Pino logger (log kayıtları)
│   │   └── errors.ts     ← Hata sınıfları (NotFoundError, ValidationError...)
│   │
│   ├── middleware/       ← Her isteğin geçtiği filtreler
│   │   ├── requestId.ts  ← Her isteğe benzersiz ID atar (hata takibi için)
│   │   └── errorHandler.ts ← Tüm hataları yakalar, standart JSON döner
│   │
│   ├── modules/          ← Özellik bazlı iş mantığı (her özellik kendi klasöründe)
│   │   ├── health/       ← GET /health → "API çalışıyor mu?" kontrolü
│   │   ├── auth/         ← Kayıt, giriş, token yenileme (Modül 2)
│   │   ├── users/        ← Profil görüntüleme/güncelleme (Modül 2)
│   │   ├── routes/       ← Seyahat rotaları CRUD (Modül 3)
│   │   ├── memories/     ← Anı pinleri (Modül 7)
│   │   ├── geo/          ← Ülke tespiti, harita verisi (Modül 5)
│   │   ├── social/       ← Takip, beğeni, yorum (Modül 6)
│   │   └── media/        ← Fotoğraf yükleme (Modül 7)
│   │
│   ├── adapters/         ← Dış servislerin soyutlandığı katman
│   │   ├── storage/      ← Dosya kaydetme: local disk → ileride S3
│   │   ├── mail/         ← E-posta: konsol → ileride Resend/SES
│   │   └── push/         ← Bildirimler: ileride FCM/APNs
│   │
│   └── jobs/             ← Arka plan görevleri (BullMQ worker'ları)
│                           Örnek: Rota kaydedilince ülke hesaplama
│
├── tests/                ← Entegrasyon testleri (Vitest + Supertest)
├── .env                  ← Yerel geliştirme ortam değişkenleri (git'e gitmez!)
├── package.json          ← Backend bağımlılıkları
└── tsconfig.json         ← TypeScript ayarları
```

### `modules/` içindeki her özellik klasörü nasıl görünür?

Şu an sadece `health/` dolu, diğerleri Modül 2+ ile dolacak. Örnek yapı:

```
modules/auth/
├── auth.routes.ts      ← URL tanımları (POST /auth/login gibi)
├── auth.controller.ts  ← HTTP'yi alır, servisi çağırır, yanıt döner
├── auth.service.ts     ← İş mantığı (token üretme, şifre kontrol)
└── auth.repository.ts  ← Veritabanı sorguları
```

---

## 🟢 FRONTEND — `apps/mobile/`

```
apps/mobile/
├── app/                   ← Expo Router: dosya adı = URL yolu
│   ├── _layout.tsx        ← Tüm ekranların sarmalayıcısı (QueryClient vs.)
│   ├── (auth)/            ← Parantez = URL'de görünmez, sadece gruplar
│   │   ├── login.tsx      ← /login ekranı (Modül 2)
│   │   └── register.tsx   ← /register ekranı (Modül 2)
│   ├── (tabs)/            ← Alt sekme navigasyonu
│   │   ├── _layout.tsx    ← 5 sekmenin tanımı ve stilleri
│   │   ├── index.tsx      ← 🗺️ Harita sekmesi (şu an API health gösterir)
│   │   ├── record.tsx     ← 📍 GPS Kayıt sekmesi (Modül 3)
│   │   ├── feed.tsx       ← 🌍 Sosyal Akış sekmesi (Modül 6)
│   │   ├── passport.tsx   ← 🛂 Pasaport sekmesi (Modül 5)
│   │   └── profile.tsx    ← 👤 Profil sekmesi (Modül 2)
│   ├── route/
│   │   └── [id].tsx       ← /route/abc123 → Rota detay sayfası (Modül 3)
│   └── country/
│       └── [code].tsx     ← /country/TR → Ülke detay sayfası (Modül 5)
│
├── src/                   ← Ekranların dışındaki tüm kod
│   ├── api/               ← Backend'e istek atan fonksiyonlar
│   │   ├── client.ts      ← Axios instance (base URL, interceptor'lar)
│   │   └── health.ts      ← fetchHealth() fonksiyonu
│   │
│   ├── components/        ← Yeniden kullanılabilir UI parçaları
│   │   ├── map/           ← Harita bileşenleri (Modül 1)
│   │   ├── ui/            ← Tasarım sistemi: Button, Input, Card...
│   │   └── route/         ← Rota kartları, listeler (Modül 3)
│   │
│   ├── features/          ← Karmaşık özellik mantığı
│   │   ├── tracking/      ← GPS kayıt state machine (Modül 3)
│   │   ├── drawing/       ← Manuel rota çizimi (Modül 4)
│   │   └── replay/        ← Rota oynatıcı (Modül 3)
│   │
│   ├── store/             ← Global state (Zustand)
│   │   └── auth.store.ts  ← Oturum durumu (token, kullanıcı)
│   │
│   ├── hooks/             ← Özel React hook'ları (Modüller ilerledikçe)
│   ├── db/                ← SQLite (çevrimdışı veri saklama - Modül 3)
│   └── theme/
│       └── index.ts       ← Renkler, yazı tipleri, boşluk değerleri
│
├── assets/
│   ├── geo/               ← countries.pmtiles (ülke sınır verileri - Modül 1)
│   ├── icon.png           ← Uygulama ikonu
│   └── splash.png         ← Açılış ekranı görseli
│
├── app.config.ts          ← Expo konfigürasyonu (izinler, bundle ID, vs.)
├── .env                   ← EXPO_PUBLIC_API_URL gibi mobil değişkenler
└── package.json           ← Mobil bağımlılıkları
```

---

## 🟡 ORTAK KOD — `packages/shared/`

```
packages/shared/
└── src/
    ├── schemas/           ← Zod doğrulama şemaları
    │   │                    Backend hem doğrulama hem validasyon için,
    │   │                    Mobil hem form validasyon hem tip üretimi için kullanır
    │   ├── auth.schema.ts    ← register, login, resetPassword şemaları
    │   ├── route.schema.ts   ← createRoute, updateRoute, trackPoint şemaları
    │   ├── memory.schema.ts  ← createMemory şeması
    │   └── social.schema.ts  ← comment, shareLink şemaları
    │
    ├── types/             ← API yanıt tipleri
    │   └── index.ts          ← UserPublic, RouteListItem, MapDataItem...
    │
    ├── constants/         ← Her iki tarafta kullanılan sabit değerler
    │   └── index.ts          ← Harita renk skalası, hata kodları, stamp seviyeleri
    │
    └── geo/               ← Coğrafi hesaplama yardımcıları
        └── index.ts          ← haversine(), encodePolyline(), toLineStringWKT()
```

> **Neden `shared` paketi var?**
> Backend'de `createRouteSchema` değişirse, mobil tarafta TypeScript **derleme zamanında** hata verir. Koordinasyon otomatik.

---

## 🌐 MONOREPO KÖKÜ

```
WanderLog/
├── apps/                  ← Uygulamalar
├── packages/              ← Paylaşılan paketler
├── docs/
│   └── adr/               ← Mimari Karar Kayıtları (ADR)
│                            Örnek: "Neden MapLibre seçtik?" kararının belgesi
│
├── package.json           ← Kök workspace tanımı + dev araçları
├── pnpm-workspace.yaml    ← Hangi klasörlerin workspace üyesi olduğu
├── turbo.json             ← "pnpm dev" deyince ne çalışır? (görev tanımları)
├── docker-compose.yml     ← Yerel geliştirme: PostgreSQL + Redis
├── tsconfig.base.json     ← Tüm paketlerin miras aldığı TypeScript ayarı
├── eslint.config.mjs      ← Kod kalite kuralları
├── .prettierrc            ← Kod formatlama kuralları
├── .env.example           ← Hangi .env değişkenlerinin gerekli olduğu (şablon)
├── .husky/pre-commit      ← Commit atmadan önce lint-staged çalışır
├── .lintstagedrc.json     ← Sadece değişen dosyaları formatla
└── pnpm-lock.yaml         ← Tam bağımlılık kilit dosyası (git'e gider)
```

---

## 🔄 Bir İsteğin Yolculuğu

```
📱 Mobil (apps/mobile)
   └─ src/api/health.ts    → fetchHealth() çağırır
   └─ app/(tabs)/index.tsx → useQuery ile ekranda gösterir

        ⬇  HTTP GET /api/v1/health

🖥️ Backend (apps/api)
   └─ src/app.ts                          → isteği alır
   └─ src/middleware/requestId.ts         → ID atar
   └─ src/modules/health/health.routes.ts → handler çalışır
   └─ src/lib/prisma.ts                   → DB'ye SELECT 1
   └─ src/lib/redis.ts                    → Redis PING

        ⬆  JSON yanıt
        { "data": { "status": "ok", "services": {...} } }
```

---

## 📦 Hangi Modülde Ne Açılacak?

| Modül | Klasörler |
|---|---|
| **0** (Şu an) | Tüm iskelet hazır, sadece `/health` çalışıyor |
| **1** | `apps/mobile/assets/geo/`, `apps/mobile/src/components/map/` |
| **2** | `apps/api/src/modules/auth/`, `apps/api/src/modules/users/`, `apps/mobile/app/(auth)/` |
| **3** | `apps/api/src/modules/routes/`, `apps/mobile/src/features/tracking/` |
| **4** | `apps/mobile/src/features/drawing/` |
| **5** | `apps/api/src/modules/geo/`, `apps/mobile/app/(tabs)/passport.tsx` |
| **6** | `apps/api/src/modules/social/`, `apps/mobile/app/(tabs)/feed.tsx` |
| **7** | `apps/api/src/modules/memories/`, `apps/api/src/modules/media/`, `apps/api/src/adapters/storage/` |
