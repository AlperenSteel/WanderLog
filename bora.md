# bora.md — Frontend Geliştirme Planı

**Rol:** Frontend (mobil uygulama, ekranlar, durumlar, animasyonlar)
**Eş plan:** `alperen.md` (backend)
**Tasarım kaynağı:** `Wanderprint.dc.html` (Tur 1–8) · Deste: `Wanderprint Deck.dc.html`

---

## Nerede olduğumuzu nasıl görüyoruz

| Faz | Kapsam | Frontend durumu | Kapı (ikisi birlikte geçer) |
|---|---|---|---|
| F0 | Kurulum + tasarım sistemi | ☐ | Sözleşme + token'lar hazır |
| F1 | Auth ekranları | ☐ | Giriş uçtan uca çalışıyor |
| F2 | Kayıt (rota) akışı | ☐ | Kaydedilen rota haritada yeşil |
| F3 | Harita + ülke detay | ☐ | Harita gerçek veriyle boyanıyor |
| F4 | Görevler + damga | ☐ | Damga basma uçtan uca |
| F5 | Akış + sosyal profil | ☐ | Akış ve profil canlı |
| F6 | Karanlık mod + cila + sürüm | ☐ | Beta yayına hazır |

> Kural: Backend hazır olmadan ekran beklemiyoruz — F1–F5 boyunca mock sunucu üzerinde çalışılır, kapıda gerçek API'ye geçilir.

**Şu anki faz:** F0
**Son güncelleme:** —

---

## M0 · Kurulum ve tasarım sistemi (F0)

- [ ] Proje iskeleti, navigasyon kütüphanesi, ortam değişkenleri
- [ ] API istemcisi: token saklama, refresh araya girmesi, hata eşlemesi
- [ ] Mock sunucuya bağlanma (Alperen'in mock'u)
- [ ] **Token'lar:** renk paleti (900/700/500/300/100), yoğunluk skalası 5 durak, ink nötrleri, amber/terra/red
- [ ] Tipografi ölçeği: Display (Instrument Serif), Başlık 1–2, Gövde, Etiket, tabular sayılar
- [ ] Bileşen kütüphanesi v1: Buton (5 durum), Input (odak/hata), Çip, Kart, Alt sayfa (3 kademe), Durum şeridi
- [ ] Damga bileşeni: Visitor / Explorer / Resident / kilitli + in-sarsıl-yerleş animasyonu
- [ ] Sekme çubuğu: Harita · Akış · Kaydet · Pasaport · Sosyal (ikonlu, 44 px hedef)
- [ ] Boş / yükleniyor / hata durumu şablonları
- [ ] Erişilebilirlik temeli: kontrast, dokunma hedefi, dinamik yazı boyutu

---

## M1 · Auth ekranları (F1)

- [ ] Giriş: harita şeridi başlık, e-posta + şifre, göz ikonu
- [ ] Giriş hata durumu: alan kenarlıkları, uyarı şeridi, kalan deneme, titreme + haptic
- [ ] Kayıt ol: kullanıcı adı uygunluk tiki, şifre gücü çubuğu, canlı kural listesi
- [ ] Şifremi unuttum akışı (e-posta gönderildi ekranı)
- [ ] Google / Apple ile devam
- [ ] Onboarding 3 ekran + konum izni ekranı
- [ ] Oturum kalıcılığı, açılışta sessiz refresh, çıkış
- [ ] Testler: hatalı şifre, kilitli hesap, offline giriş denemesi

---

## M2 · Rota kaydı akışı (F2)

- [ ] Kayıt ekranı 4 durum: hazır · kayıtta · duraklatıldı · özet
- [ ] Canlı sayaçlar: mesafe, süre, hız (tabular)
- [ ] Arka planda konum izleme + pil uyarısı
- [ ] Çevrimdışı kuyruk: kayıtlar cihazda, bağlanınca yükleme (durum şeridi)
- [ ] Kayıt özeti: başlık düzenleme, gizlilik seçimi, foto/anı ekleme
- [ ] Yükleme sonrası "ülke güncellendi" bildirimi
- [ ] Elle rota çizme (boş durumdaki ikinci yol)
- [ ] Testler: uygulama kapanıp açılınca kayıt sürüyor

---

## M3 · Harita ve ülke detay (F3)

- [ ] Dünya haritası: gerçek geometri, yoğunluk boyaması, pan/zoom
- [ ] Yakınlaştıkça rota çizgilerinin belirmesi
- [ ] Cam istatistik paneli: 4 kolon + yoğunluk efsanesi
- [ ] Sol üst arama; sol üst filtre/katman (yıl, kıta, yoğunluk eşiği, damga durumu + aktif filtre rozeti)
- [ ] Sağ üst hesap menüsü: ayarlar, birim (km/mil), tema
- [ ] Boş durum ("Haritan seni bekliyor") ve iskelet yükleniyor durumu
- [ ] Ülke alt sayfası 3 kademe: peek %25 · yarı %50 · tam %90
- [ ] Ülke detayı: damga ilerlemesi, istatistik ızgarası, fotoğraflar, rota listesi
- [ ] Performans: 195 ülke + rota katmanı ile 60 fps hedefi
- [ ] Testler: gerçek `/countries` verisiyle renkler doğru

---

## M4 · Görevler ve damga (F4)

- [ ] Ülke görev listesi: 3 tip kart (yürüyüş / atmosfer / keşif) + ilerleme
- [ ] Damga kilidi kartı: `n/3` sayacı, kilitli görsel
- [ ] Görev detayı: landmark listesi, uzaklık, "bu göreve rota kaydet"
- [ ] "Damgayı bas · basılı tut" — dolum, haptic, iptal
- [ ] Damga anı ekranı (ana yol kararı: 4A tören / **4B pasaport sayfası** / 4C alt sayfa)
- [ ] Paylaşım kartı 4D: 9:16 · 1:1 · video, dışa aktarma
- [ ] Pasaport ızgarası: kazanılan / görev bekleyen (`2/3`) / kilitli sekmeleri
- [ ] Hata: `QUESTS_INCOMPLETE` gelirse buton kilitli kalır + açıklama
- [ ] Testler: görev tamamlanınca buton açılıyor, çift basma engelli

---

## M5 · Akış ve sosyal profil (F5)

- [ ] Akış kartı: kapak fotoğrafı, mini harita, damga rozeti, meta satırı
- [ ] Beğeni (dolum + sıçrama), yorum sayacı, paylaş
- [ ] Takip Edilenler / Keşfet sekmeleri; aşağı çekerek yenileme, sonsuz kaydırma
- [ ] Keşfet: arama, filtre çipleri, haftanın rotası, 2 sütun ızgara
- [ ] Akış boş durumu + önerilen kullanıcılar
- [ ] Rota detay ekranı (karta dokununca) + yorum alt sayfası
- [ ] Sosyal profil: Rotalarım · Favoriler · Takip sekmeleri, istatistik şeridi, damga şeridi
- [ ] Koleksiyonlar (Yaz planı, Gece) ve "rotayı kullan"
- [ ] Başka kullanıcının profili: takip et / ortak ülkeler
- [ ] Bildirim merkezi + push izni
- [ ] Testler: gizli rota kendi profilinde görünür, başkasında görünmez

---

## M6 · Karanlık mod, cila, sürüm (F6)

- [ ] Karanlık mod token'ları: zeminler (#0B0D0C/#0E100F/#171A18), açık yeşil primary, altın damga
- [ ] Karanlıkta eksik ekranlar: kayıt, görev detayı, ülke alt sayfası, sosyal profil
- [ ] Otomatik tema geçişi (sistem takibi) + manuel seçim
- [ ] Animasyon geçişleri ve haptic denetimi
- [ ] Boş/hata/offline durumlarının tam taraması
- [ ] Erişilebilirlik denetimi (kontrast, ekran okuyucu etiketleri)
- [ ] Mağaza görselleri, sürüm notları, beta dağıtımı

---

## Alperen'i bekleyen / Alperen'i bekleyen işler

| Konu | Yön | Durum |
|---|---|---|
| OpenAPI imzası | Alperen → Bora | ☐ |
| Mock sunucu ayakta | Alperen → Bora | ☐ |
| Rota yükleme payload formatı | ortak karar | ☐ |
| Yoğunluk skalası eşikleri | Alperen → Bora | ☐ |
| Görev ilerleme alan isimleri | ortak karar | ☐ |
| Damga hata kodları | Alperen → Bora | ☐ |
| Push token kayıt ucu | Bora → Alperen | ☐ |

---

## Haftalık ritim

- Pazartesi: faz durumu güncelle (üstteki tablo + "Şu anki faz")
- Çarşamba: sözleşme değişikliği geldiyse istemciyi güncelle
- Cuma: tamamlanan maddeleri tikle, kapı kontrolü
