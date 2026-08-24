# ✅ Modül 0: Temel Altyapı ve Ortam Kurulumu — TAMAMLANDI

> **Not:** Bu plan tamamlandı. Nihai klasör yapısı planda yazandan farklılaştı:
> `apps/api` → `backend/` · `apps/mobile` → `frontend/` · `packages/shared` → `shared/`
> Güncel yapı için: [docs/DIZIN_REHBERI.md](./docs/DIZIN_REHBERI.md)

---

Bu plan, `wanderlog.md` belgesinin **Modül 0** bölümünü uygular. Amaç her iki tarafın (API + Mobil) çalışan, tip paylaşan bir iskelete sahip olması.

## Yapılacaklar

### Monorepo Kökü
- `package.json` — pnpm workspace kökü
- `pnpm-workspace.yaml` — workspace tanımı
- `turbo.json` — görev orkestrasyonu
- `docker-compose.yml` — `postgis/postgis:16-3.4` + `redis:7`
- `.env.example` — tüm ortam değişkenleri
- `.gitignore` (güncellenecek)
- `.prettierrc`, `.eslintrc` (kök seviye)
- `lefthook.yml` veya `husky` + `lint-staged` pre-commit

---

### `packages/shared`
- `src/schemas/` — Zod şemaları: `auth.schema.ts`, `route.schema.ts`, `memory.schema.ts`, `social.schema.ts`
- `src/types/` — Zod'dan türetilen TS tipleri
- `src/constants/` — renk skalaları, hata kodları
- `src/geo/` — haversine, polyline encode/decode
- `tsconfig.json`, `package.json`

---

### `apps/api` (Express + TypeScript)
- `package.json` — bağımlılıklar: express, prisma, zod, pino, bullmq, argon2 vb.
- `tsconfig.json`
- `prisma/schema.prisma` — tam şema (Bölüm 5)
- `src/index.ts` — sunucu başlatma
- `src/app.ts` — Express uygulaması (test edilebilir, ayrı dosya)
- `src/config/env.ts` — Zod ile env doğrulama
- `src/middleware/` — requestId, error handler
- `src/lib/` — prisma client, redis client, pino logger
- `src/modules/` — boş iskelet klasörler (auth, users, routes, memories, geo, social, media)
- `GET /health` endpoint'i (DB + Redis kontrolü)

---

### `apps/mobile` (Expo + React Native + TypeScript)
- `create-expo-app` ile TypeScript + Expo Router template
- `packages/shared` bağımlılığı ekleme
- Tema sistemi: renk paleti, tipografi, spacing token'ları
- Temel UI bileşenleri: `Button`, `Input`, `Card`, `Sheet`, `Toast`
- Axios instance + interceptor iskeleti
- TanStack Query provider + Zustand store iskeleti
- 5 sekme navigasyonu (boş ekranlar)
- Açılışta `/health` çağrısı ve "API bağlı ✓" gösterimi

---

### `docs/`
- `adr/` klasörü
- `ROADMAP.md` symlink veya kopyası

---

## Bitti Kriteri
`pnpm dev` tek komutla API + Expo'yu ayağa kaldırır; mobil uygulama API'ye bağlanıp sağlık durumunu gösterir; `packages/shared`'a eklenen bir tip her iki tarafta da görünür.

## Araçlar ve Versiyon
- Node: LTS (20+)
- pnpm: 9+
- Turborepo: 2+
- Expo SDK: 52+
