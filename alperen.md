# alperen.md — Backend Geliştirme Planı

**Rol:** Backend (API, veri modeli, iş kuralları, arka plan işleri)
**Eş plan:** `bora.md` (frontend)
**Ürün:** Wanderprint — yoğunluk haritası, ülke görevleri, pasaport damgaları

---

## Nerede olduğumuzu nasıl görüyoruz

| Faz | Kapsam | Backend durumu | Kapı (ikisi birlikte geçer) |
|---|---|---|---|
| F0 | Kurulum + sözleşme | ✅ | API sözleşmesi dondu |
| F1 | Auth + profil | ☐ | Giriş uçtan uca çalışıyor |
| F2 | Rota kaydı + ülke tespiti | ☐ | Kaydedilen rota haritada yeşil |
| F3 | Yoğunluk + ülke detay | ☐ | Harita gerçek veriyle boyanıyor |
| F4 | Görev motoru + damga | ☐ | Damga basma uçtan uca |
| F5 | Akış + sosyal | ☐ | Akış ve profil canlı |
| F6 | Sertleştirme + sürüm | ☐ | Beta yayına hazır |

> Kural: Bir fazı "bitti" saymak için hem `alperen.md` hem `bora.md` içindeki o faz maddeleri tikli olmalı. Kapı geçilmeden sonraki fazın entegrasyon işleri başlamaz (hazırlık işleri paralel sürebilir).

**Şu anki faz:** F1
**Son güncelleme:** 2026-08-27

---

## M0 · Kurulum ve sözleşme (F0)

- [x] Repo, ortamlar (local / staging / prod), `.env` şablonu
- [x] Postgres + PostGIS ayağa kalkıyor, migration aracı seçildi (Prisma)
- [x] CI: lint + test + migration kontrolü (`.github/workflows/ci.yml`)
- [x] Hata formatı standardı: `{code, message, details}` + HTTP eşlemesi
- [x] Kimlik: JWT access (15 dk) + refresh (30 gün) kararı
- [x] **OpenAPI ilk taslak** — `docs/openapi.yaml` (Bora ile imzalanacak)
- [x] Mock sunucu ayakta — `pnpm --filter @wanderprint/api mock` (Prism, port 3001)
- [x] Seed veri: 15 ülke, 3 kullanıcı, 20 rota, 6 görev şablonu (beklemede M4)

**Sözleşme çıktısı (Bora'nın beklediği):** `/auth/*`, `/me`, `/routes`, `/countries`, `/countries/{iso}`, `/quests`, `/stamps`, `/feed`, `/users/{handle}`

---

## M1 · Kimlik ve hesap (F1)

- [ ] `POST /auth/register` (e-posta, kullanıcı adı, şifre)
- [ ] Kullanıcı adı uygunluk kontrolü: `GET /auth/username-available`
- [ ] Şifre politikası (min 8, büyük harf, sayı/sembol) + güç puanı yanıtı
- [ ] `POST /auth/login` — hatalı denemede kalan hak sayısı döner
- [ ] Oran sınırı: IP + hesap başına giriş denemesi
- [ ] `POST /auth/refresh`, `POST /auth/logout`
- [ ] Şifre sıfırlama: token üretimi + e-posta kuyruğu
- [ ] OAuth: Google, Apple
- [ ] `GET /me`, `PATCH /me` (ad, handle, bio, avatar, birim km/mil, tema)
- [ ] Avatar yükleme: imzalı URL + boyutlandırma işi
- [ ] Testler: kayıt, giriş, kilit, refresh döngüsü

---

## M2 · Rota kaydı ve ülke tespiti (F2)

- [ ] Veri modeli: `route(id, user_id, started_at, ended_at, distance_m, duration_s, visibility)`
- [ ] `route_point` (geography Point + timestamp) veya sıkıştırılmış polyline
- [ ] `POST /routes` — toplu nokta yükleme, idempotency-key
- [ ] Çevrimdışı senkron: aynı istemci kaydı iki kez gelirse tek kayıt
- [ ] Mesafe ve süre hesabı sunucu tarafında doğrulanır (istemciye güvenilmez)
- [ ] Nokta temizleme: sıçrama filtresi, min doğruluk eşiği
- [ ] Ülke/şehir tespiti: PostGIS `ST_Intersects` ile sınır tablosu
- [ ] `country_visit(user_id, iso, first_seen, last_seen, total_distance_m, days)` toplaması
- [ ] `GET /routes`, `GET /routes/{id}`, `PATCH /routes/{id}` (başlık, gizlilik), `DELETE`
- [ ] Anı/foto: `route_photo` + imzalı yükleme
- [ ] Testler: sınır geçen rota iki ülkeye de yazılıyor

---

## M3 · Yoğunluk ve ülke detay (F3)

- [ ] Yoğunluk formülü: mesafe + gün + şehir sayısı → 0.00–1.00 normalizasyonu
- [ ] `GET /countries` — `[{iso, density, total_distance, stamp_level}]` (harita boyaması)
- [ ] Yanıt küçük ve önbelleklenebilir (ETag)
- [ ] `GET /countries/{iso}` — özet, rota listesi, foto listesi, damga durumu
- [ ] Toplam istatistikler: `GET /me/stats` (ülke, kıta, toplam mesafe, rota sayısı, yıllık değişim %)
- [ ] Birim dönüşümü (km/mil) sunucuda değil istemcide — sadece metre döner
- [ ] Materialized view + rota kaydında tetiklenen yenileme işi
- [ ] Testler: yoğunluk sınır değerleri (0, 0.25, 1.0)

---

## M4 · Görev motoru ve damga (F4)

- [ ] `quest_template(id, iso, type, title, rule_json, order)` — tipler: `steps`, `night_walk`, `landmarks`, `local`
- [ ] `user_quest(user_id, template_id, progress_json, completed_at)`
- [ ] Kural değerlendirici: rota kaydedildiğinde ilgili görevleri yeniden hesapla
  - [ ] `steps`: tek gün içinde eşik
  - [ ] `night_walk`: yerel saat 22:00 sonrası, min mesafe
  - [ ] `landmarks`: 300 m yakınlık, N/M sayacı (landmark tablosu + seed)
- [ ] `GET /countries/{iso}/quests` — ilerleme yüzdeleri ile
- [ ] Damga seviyeleri: Visitor / Explorer / Resident koşulları
- [ ] `POST /countries/{iso}/stamp` — tüm görevler tamam değilse `409 QUESTS_INCOMPLETE`
- [ ] Damga idempotent: ikinci çağrı aynı damgayı döner, çift basmaz
- [ ] `GET /me/passport` — kazanılan / görev bekleyen / kilitli gruplaması
- [ ] Damga olayında bildirim kuyruğu kaydı
- [ ] Testler: 2/3 görevle damga reddi, 3/3 ile kabul, tekrar çağrı

---

## M5 · Akış ve sosyal (F5)

- [ ] `follow(follower_id, followee_id)` + `POST/DELETE /users/{handle}/follow`
- [ ] `GET /feed?scope=following|discover` — imleç bazlı sayfalama
- [ ] Akış öğesi payload'ı: rota özeti, kapak fotoğrafı, ülke, o rotada kazanılan damga
- [ ] Beğeni: `POST/DELETE /routes/{id}/like`, sayaç denormalize
- [ ] Yorum: `GET/POST /routes/{id}/comments`
- [ ] Favori + koleksiyon: `collection`, `collection_item`, CRUD uçları
- [ ] `GET /users/{handle}` — rotalar, favoriler, takip sayıları, damga şeridi
- [ ] Keşfet sıralaması: son 7 gün beğeni + mesafe + çeşitlilik
- [ ] Gizlilik: `visibility=private` rotalar akışta ve profilde görünmez
- [ ] Bildirimler: `GET /notifications`, okundu işaretleme, push token kaydı
- [ ] Testler: gizli rota sızmıyor, takip/çıkma akışı değiştiriyor

---

## M6 · Sertleştirme ve sürüm (F6)

- [ ] Yük testi: 10k rota / 1k kullanıcı ile harita ve akış uçları
- [ ] Sorgu planları: harita ve akış uçlarında index doğrulama
- [ ] Oran sınırı ve kötüye kullanım koruması (yükleme, beğeni)
- [ ] Hesap silme + veri ihracı (KVKK/GDPR)
- [ ] Loglama, izleme, hata takibi, uptime alarmı
- [ ] Yedekleme ve geri yükleme provası
- [ ] Sürüm notları + API sürümleme politikası

---

## Bora'yı bekleyen / Bora'yı bekleyen işler

| Konu | Yön | Durum |
|---|---|---|
| OpenAPI imzası | Alperen → Bora | ✅ `docs/openapi.yaml` hazır |
| Mock sunucu ayakta | Alperen → Bora | ✅ `pnpm mock` → port 3001 |
| Rota yükleme payload formatı | ortak karar | ☐ |
| Yoğunluk skalası eşikleri (harita renkleri) | Alperen → Bora | ☐ |
| Görev ilerleme alanlarının isimleri | ortak karar | ☐ |
| Damga hata kodları (`QUESTS_INCOMPLETE`) | Alperen → Bora | ☐ |
| Push token kayıt ucu | Bora → Alperen | ☐ |

---

## Haftalık ritim

- Pazartesi: faz durumu güncelle (üstteki tablo + "Şu anki faz")
- Çarşamba: sözleşme değişikliği varsa OpenAPI + mock güncelle, Bora'ya haber
- Cuma: tamamlanan maddeleri tikle, kapı kontrolü
