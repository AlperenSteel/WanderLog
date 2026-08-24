# 📁 WanderLOG — Dizin Rehberi

> Her klasörün ve dosyanın ne işe yaradığını açıklar.

---

## 🗺️ Büyük Resim

```
WanderLog/
│
├── backend/    ◄── 🔵 BACKEND  (Express sunucusu)
├── frontend/   ◄── 🟢 FRONTEND (Expo mobil uygulama)
├── shared/     ◄── 🟡 ORTAK    (İki tarafın paylaştığı kod)
└── docs/       ◄── 📄 DOKÜMANTASYON
```

---

## 🔵 BACKEND — `backend/`

```
backend/
├── prisma/
│   ├── schema.prisma     ← Veritabanı modeli (tablolar, ilişkiler)
│   └── seed.ts           ← DB'ye örnek veri yükleyen script
│
├── src/
│   ├── index.ts          ← Sunucuyu başlatan dosya (buradan başlar)
│   ├── app.ts            ← Express uygulaması (middleware, route'lar)
│   │
│   ├── config/
│   │   └── env.ts        ← .env okur, eksik değişkende başlamaz
│   │
│   ├── lib/              ← Paylaşılan yardımcı araçlar
│   │   ├── prisma.ts     ← Veritabanı bağlantısı
│   │   ├── redis.ts      ← Redis bağlantısı
│   │   ├── logger.ts     ← Pino logger
│   │   └── errors.ts     ← AppError, NotFoundError, ValidationError...
│   │
│   ├── middleware/
│   │   ├── requestId.ts    ← Her isteğe benzersiz ID atar
│   │   └── errorHandler.ts ← Tüm hataları yakalar, standart JSON döner
│   │
│   └── modules/          ← Özellik bazlı modüller
│       │                    Her modül aynı dosya yapısına sahip:
│       │                    module.router.ts     → URL tanımları
│       │                    module.controller.ts → HTTP katmanı
│       │                    module.service.ts    → iş mantığı + DB
│       │                    module.dto.ts        → input/output tipleri
│       │                    module.middleware.ts → gerektiğinde eklenir
│       │
│       ├── health/       ← GET /health (şu an aktif)
│       ├── auth/         ← Kayıt, giriş, token (Modül 2)
│       ├── users/        ← Profil (Modül 2)
│       ├── trips/        ← Seyahat rotaları (Modül 3)
│       ├── memories/     ← Anı pinleri (Modül 7)
│       ├── geo/          ← Ülke tespiti, harita verisi (Modül 5)
│       ├── social/       ← Takip, beğeni, yorum (Modül 6)
│       └── media/        ← Fotoğraf yükleme (Modül 7)
│
├── .env                  ← Yerel ortam değişkenleri (git'e gitmez)
├── package.json
└── tsconfig.json
```

---

## 🟢 FRONTEND — `frontend/`

```
frontend/
├── app/                   ← Expo Router — dosya adı = ekran
│   ├── _layout.tsx        ← Tüm ekranların sarmalayıcısı
│   ├── (auth)/            ← Giriş ekranları (URL'de görünmez)
│   │   ├── login.tsx      ← Giriş (Modül 2)
│   │   └── register.tsx   ← Kayıt (Modül 2)
│   ├── (tabs)/            ← Alt sekme navigasyonu
│   │   ├── _layout.tsx    ← 5 sekmenin tanımı
│   │   ├── index.tsx      ← 🗺️ Harita (şu an: API health gösterir)
│   │   ├── record.tsx     ← 📍 GPS Kayıt (Modül 3)
│   │   ├── feed.tsx       ← 🌍 Sosyal Akış (Modül 6)
│   │   ├── passport.tsx   ← 🛂 Pasaport (Modül 5)
│   │   └── profile.tsx    ← 👤 Profil (Modül 2)
│   ├── route/[id].tsx     ← Rota detay sayfası (Modül 3)
│   └── country/[code].tsx ← Ülke detay sayfası (Modül 5)
│
├── api/                   ← Backend'e istek atan fonksiyonlar
│   ├── client.ts          ← Axios instance (base URL, interceptor'lar)
│   └── health.ts          ← fetchHealth()
│
├── components/            ← Yeniden kullanılabilir UI parçaları
│   ├── map/               ← Harita bileşenleri (Modül 1)
│   ├── ui/                ← Button, Input, Card... (Modüller ilerledikçe)
│   └── route/             ← Rota kartları (Modül 3)
│
├── features/              ← Karmaşık özellik mantığı
│   ├── tracking/          ← GPS kayıt state machine (Modül 3)
│   ├── drawing/           ← Manuel rota çizimi (Modül 4)
│   └── replay/            ← Rota oynatıcı (Modül 3)
│
├── store/                 ← Global state (Zustand)
│   └── auth.store.ts      ← Oturum durumu
│
├── theme/
│   └── index.ts           ← Renkler, yazı tipleri, boşluklar
│
├── hooks/                 ← Custom React hook'ları
├── db/                    ← SQLite (GPS kayıt sırasında offline tampon)
├── assets/
│   └── geo/               ← countries.pmtiles (ülke sınırları - Modül 1)
│
├── app.config.ts          ← Expo konfigürasyonu (izinler, bundle ID)
├── .env                   ← EXPO_PUBLIC_API_URL
└── package.json
```

---

## 🟡 ORTAK KOD — `shared/`

```
shared/
└── src/
    ├── schemas/           ← Zod şemaları (tek doğruluk kaynağı)
    │   ├── auth.schema.ts    ← register, login, reset
    │   ├── route.schema.ts   ← createTrip, trackPoint
    │   ├── memory.schema.ts  ← createMemory
    │   └── social.schema.ts  ← comment, shareLink
    │
    ├── types/             ← API yanıt tipleri
    │   └── index.ts          ← UserPublic, TripListItem, MapDataItem...
    │
    ├── constants/
    │   └── index.ts          ← Harita renk skalası, hata kodları
    │
    └── geo/
        └── index.ts          ← haversine(), encodePolyline(), toLineStringWKT()
```

> **Neden `shared/` var?**
> `backend` bir alanı değiştirirse `frontend` TypeScript **derleme zamanında** hata verir. Elle koordinasyon gerekmez.

---

## 🌐 PROJE KÖKÜ

```
WanderLog/
├── backend/
├── frontend/
├── shared/
├── docs/
│   ├── adr/               ← Mimari karar kayıtları
│   └── DIZIN_REHBERI.md   ← Bu dosya
├── package.json           ← Workspace kökü + dev araçları
├── pnpm-workspace.yaml    ← Workspace üyeleri
├── turbo.json             ← Görev orkestrasyonu
├── docker-compose.yml     ← PostgreSQL + Redis
├── tsconfig.base.json     ← Ortak TypeScript ayarı
├── .env.example           ← Hangi değişkenlerin gerekli olduğu
├── .prettierrc            ← Formatlama kuralları
└── eslint.config.mjs      ← Kod kalite kuralları
```

---

## 📦 Hangi Modülde Ne Açılacak?

| Modül | Klasörler |
|---|---|
| **0** ✅ | Tüm iskelet hazır, `/health` çalışıyor |
| **1** | `frontend/assets/geo/`, `frontend/components/map/` |
| **2** | `backend/src/modules/auth/`, `backend/src/modules/users/`, `frontend/app/(auth)/` |
| **3** | `backend/src/modules/trips/`, `frontend/features/tracking/` |
| **4** | `frontend/features/drawing/` |
| **5** | `backend/src/modules/geo/`, `frontend/app/(tabs)/passport.tsx` |
| **6** | `backend/src/modules/social/`, `frontend/app/(tabs)/feed.tsx` |
| **7** | `backend/src/modules/memories/`, `backend/src/modules/media/` |
