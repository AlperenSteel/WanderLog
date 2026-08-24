# WanderLOG

> Seyahat rotalarını kaydeden, dünya haritası üzerinde görselleştiren ve paylaşılabilir bir hatıra defterine dönüştüren mobil uygulama.

## Yapı

```
WanderLog/
├── backend/    # Express + TypeScript + Prisma + PostGIS
├── frontend/   # Expo + React Native + TypeScript
├── shared/     # Zod şemaları + paylaşılan tipler + geo yardımcıları
└── docs/       # Mimari karar kayıtları, dizin rehberi
```

## Ön Koşullar

- Node.js 20+
- pnpm 9+
- Docker Desktop

## Hızlı Başlangıç

```bash
# 1. Bağımlılıkları yükle
pnpm install

# 2. Ortam değişkenlerini ayarla
cp .env.example backend/.env

# 3. Veritabanını başlat (PostGIS + Redis)
docker-compose up -d

# 4. DB migration
pnpm --filter @wanderprint/backend db:migrate

# 5. Geliştirme sunucusunu başlat
pnpm dev
```

## Geliştirme Modülleri

| # | Modül | Durum |
|---|---|---|
| 0 | Temel Altyapı ve Ortam | ✅ |
| 1 | Veri Modeli ve Coğrafi Temel | ⏳ |
| 2 | Kimlik Doğrulama | ⏳ |
| 3 | GPS Rota Kaydı | ⏳ |
| 4 | Manuel Rota Çizimi | ⏳ |
| 5 | Harita ve İstatistik | ⏳ |
| 6 | Sosyal Özellikler | ⏳ |
| 7 | Medya ve Anı Pinleri | ⏳ |

Ayrıntılı yol haritası: [wanderlog.md](./wanderlog.md) · Dizin rehberi: [docs/DIZIN_REHBERI.md](./docs/DIZIN_REHBERI.md)
