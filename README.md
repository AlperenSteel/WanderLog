# Wanderprint

> Seyahat rotalarını kaydeden, dünya haritası üzerinde görselleştiren ve paylaşılabilir bir hatıra defterine dönüştüren mobil uygulama.

## Monorepo Yapısı

```
wanderprint/
├── apps/
│   ├── api/        # Express + TypeScript + Prisma + PostGIS
│   └── mobile/     # Expo + React Native + TypeScript
├── packages/
│   └── shared/     # Zod şemaları + paylaşılan tipler + geo yardımcıları
└── docs/
    └── adr/        # Mimari karar kayıtları
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
cp .env.example apps/api/.env

# 3. Veritabanını başlat (PostGIS + Redis)
docker-compose up -d

# 4. DB migration
pnpm --filter @wanderprint/api db:migrate

# 5. Geliştirme sunucusunu başlat
pnpm dev
```

## Geliştirme Modülleri

| # | Modül | Durum |
|---|---|---|
| 0 | Temel Altyapı ve Ortam | 🚧 |
| 1 | Veri Modeli ve Coğrafi Temel | ⏳ |
| 2 | Kimlik Doğrulama | ⏳ |
| 3 | GPS Rota Kaydı | ⏳ |
| 4 | Manuel Rota Çizimi | ⏳ |
| 5 | Harita ve İstatistik | ⏳ |
| 6 | Sosyal Özellikler | ⏳ |
| 7 | Medya ve Anı Pinleri | ⏳ |

Ayrıntılı yol haritası için: [wanderlog.md](./wanderlog.md)
