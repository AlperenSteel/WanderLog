import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

// ─────────────────────── ÜLKELER ───────────────────────
// PostGIS geometry için $executeRaw kullanılır.
// Geometri basit placeholder box — gerçek sınır verisi M3'te Natural Earth'ten yüklenecek.
const COUNTRIES = [
  { code: 'TR', nameEn: 'Turkey',      nameTr: 'Türkiye',      continent: 'Asia',    bbox: [25.6, 35.8, 44.8, 42.1] },
  { code: 'DE', nameEn: 'Germany',     nameTr: 'Almanya',      continent: 'Europe',  bbox: [5.9, 47.3, 15.0, 55.1] },
  { code: 'FR', nameEn: 'France',      nameTr: 'Fransa',       continent: 'Europe',  bbox: [-5.1, 41.3, 9.6, 51.1] },
  { code: 'IT', nameEn: 'Italy',       nameTr: 'İtalya',       continent: 'Europe',  bbox: [6.6, 35.5, 18.5, 47.1] },
  { code: 'ES', nameEn: 'Spain',       nameTr: 'İspanya',      continent: 'Europe',  bbox: [-9.3, 35.9, 4.3, 43.8] },
  { code: 'JP', nameEn: 'Japan',       nameTr: 'Japonya',      continent: 'Asia',    bbox: [122.9, 24.0, 145.8, 45.5] },
  { code: 'US', nameEn: 'USA',         nameTr: 'Amerika',      continent: 'Americas',bbox: [-124.8, 24.4, -66.9, 49.4] },
  { code: 'GB', nameEn: 'UK',          nameTr: 'İngiltere',    continent: 'Europe',  bbox: [-8.2, 49.9, 1.8, 60.9] },
  { code: 'NL', nameEn: 'Netherlands', nameTr: 'Hollanda',     continent: 'Europe',  bbox: [3.3, 50.7, 7.2, 53.6] },
  { code: 'PT', nameEn: 'Portugal',    nameTr: 'Portekiz',     continent: 'Europe',  bbox: [-9.5, 36.8, -6.2, 42.2] },
  { code: 'GR', nameEn: 'Greece',      nameTr: 'Yunanistan',   continent: 'Europe',  bbox: [19.4, 34.8, 28.2, 41.8] },
  { code: 'AT', nameEn: 'Austria',     nameTr: 'Avusturya',    continent: 'Europe',  bbox: [9.5, 46.4, 17.2, 49.0] },
  { code: 'CH', nameEn: 'Switzerland', nameTr: 'İsviçre',      continent: 'Europe',  bbox: [5.9, 45.8, 10.5, 47.8] },
  { code: 'BE', nameEn: 'Belgium',     nameTr: 'Belçika',      continent: 'Europe',  bbox: [2.5, 49.5, 6.4, 51.5] },
  { code: 'PL', nameEn: 'Poland',      nameTr: 'Polonya',      continent: 'Europe',  bbox: [14.1, 49.0, 24.2, 54.9] },
];

// ─────────────────────── KULLANICLAR ───────────────────────
const USERS = [
  {
    email: 'alice@wanderprint.dev',
    username: 'alice_wanders',
    displayName: 'Alice W.',
    bio: 'Dünyanın her köşesindeyim 🌍',
    homeCountry: 'TR',
    password: 'Secure123!',
  },
  {
    email: 'bob@wanderprint.dev',
    username: 'bob_explorer',
    displayName: 'Bob E.',
    bio: 'Yürüyüş ve fotoğraf 📷',
    homeCountry: 'DE',
    password: 'Secure123!',
  },
  {
    email: 'carol@wanderprint.dev',
    username: 'carol_trails',
    displayName: 'Carol T.',
    bio: 'Dağ yolları ve şehir sokaklarında ⛰️',
    homeCountry: 'FR',
    password: 'Secure123!',
  },
];

// ─────────────────────── ROTALAR ───────────────────────
// Her rota için yalnızca meta verisi — gerçek geometry M2'de GPS noktalarından gelecek
const ROUTE_TEMPLATES = [
  // Alice — Türkiye rotaları
  { title: 'Boğaz Yürüyüşü',        distanceMeters: 8432,  durationSeconds: 5400,  countryCodes: ['TR'], userIdx: 0 },
  { title: 'Kapalıçarşı Turu',       distanceMeters: 3210,  durationSeconds: 2700,  countryCodes: ['TR'], userIdx: 0 },
  { title: 'Belgrad Ormanı Parkuru', distanceMeters: 12500, durationSeconds: 7200,  countryCodes: ['TR'], userIdx: 0 },
  { title: 'Princes Islands Bisiklet',distanceMeters: 18000, durationSeconds: 9000, countryCodes: ['TR'], userIdx: 0 },
  { title: 'Kadıköy Meydan',         distanceMeters: 5600,  durationSeconds: 3600,  countryCodes: ['TR'], userIdx: 0 },
  { title: 'Berlin Duvarı Yolu',     distanceMeters: 9800,  durationSeconds: 6300,  countryCodes: ['DE'], userIdx: 0 },
  { title: 'Paris Marais Turu',      distanceMeters: 6700,  durationSeconds: 4200,  countryCodes: ['FR'], userIdx: 0 },
  // Bob — Avrupa rotaları
  { title: 'München Englischer Garten', distanceMeters: 11200, durationSeconds: 7800, countryCodes: ['DE'], userIdx: 1 },
  { title: 'Hamburg Liman Turu',     distanceMeters: 7300,  durationSeconds: 4800,  countryCodes: ['DE'], userIdx: 1 },
  { title: 'Köln Katedral Çevresi',  distanceMeters: 4500,  durationSeconds: 3000,  countryCodes: ['DE'], userIdx: 1 },
  { title: 'Amsterdam Kanallar',     distanceMeters: 8900,  durationSeconds: 5400,  countryCodes: ['NL'], userIdx: 1 },
  { title: 'Bruges Ortaçağ Merkezi', distanceMeters: 5100,  durationSeconds: 3300,  countryCodes: ['BE'], userIdx: 1 },
  { title: 'Viyana Ringstrasse',     distanceMeters: 7800,  durationSeconds: 5100,  countryCodes: ['AT'], userIdx: 1 },
  // Carol — Güney Avrupa
  { title: 'Barcelona Gothic Quarter', distanceMeters: 6200, durationSeconds: 4200, countryCodes: ['ES'], userIdx: 2 },
  { title: 'Lizbon Alfama',          distanceMeters: 4800,  durationSeconds: 3600,  countryCodes: ['PT'], userIdx: 2 },
  { title: 'Atina Plaka',            distanceMeters: 5300,  durationSeconds: 3900,  countryCodes: ['GR'], userIdx: 2 },
  { title: 'Roma Colosseo',          distanceMeters: 7100,  durationSeconds: 4800,  countryCodes: ['IT'], userIdx: 2 },
  { title: 'Floransa Duomo',         distanceMeters: 4200,  durationSeconds: 2700,  countryCodes: ['IT'], userIdx: 2 },
  { title: 'Zürih Eski Şehir',       distanceMeters: 5900,  durationSeconds: 3600,  countryCodes: ['CH'], userIdx: 2 },
  { title: 'Varşova Kraliyet Yolu',  distanceMeters: 8100,  durationSeconds: 5400,  countryCodes: ['PL'], userIdx: 2 },
];

// ─────────────────────── GÖREV ŞABLONLARI ───────────────────────
// quest_template tablosu M4'te Prisma şemasına eklenecek.
// Şimdilik sabit JSON olarak tutulur, M4'te DB'ye yazılır.
export const QUEST_TEMPLATES = [
  {
    id: 'qt-steps-basic',
    type: 'steps',
    title: '10.000 Adım',
    description: 'Tek günde 10.000 adım at (≈8 km)',
    rule_json: { minDistanceM: 8000, withinDays: 1 },
  },
  {
    id: 'qt-steps-marathon',
    type: 'steps',
    title: 'Maraton Yürüyüşü',
    description: 'Tek rotada 20 km yürü',
    rule_json: { minDistanceM: 20000, withinDays: 1 },
  },
  {
    id: 'qt-night-walk',
    type: 'night_walk',
    title: 'Gece Yürüyüşü',
    description: 'Yerel saat 22:00 sonrası en az 3 km yürü',
    rule_json: { afterHour: 22, minDistanceM: 3000 },
  },
  {
    id: 'qt-landmarks-3',
    type: 'landmarks',
    title: '3 Tarihi Yer',
    description: 'Ülkedeki 3 önemli tarihi yere 300m mesafeye yaklaş',
    rule_json: { count: 3, radiusM: 300 },
  },
  {
    id: 'qt-local-market',
    type: 'local',
    title: 'Yerel Pazar',
    description: 'Sabah pazarı alanından geç (hafta sonu)',
    rule_json: { poiType: 'market', weekend: true },
  },
  {
    id: 'qt-explorer-km',
    type: 'steps',
    title: 'Gerçek Kaşif',
    description: 'Bu ülkede toplamda 50 km yürü',
    rule_json: { totalDistanceM: 50000, cumulative: true },
  },
];

// ─────────────────────── MAIN ───────────────────────
async function main() {
  console.log('🌱 Seed başlıyor...\n');

  // 1. Ülkeler
  console.log('🗺️  Ülkeler ekleniyor...');
  for (const c of COUNTRIES) {
    const [minLng, minLat, maxLng, maxLat] = c.bbox;
    // Basit bbox polygon — gerçek MultiPolygon sınır verisi M3'te Natural Earth'ten yüklenecek
    const wkt = `MULTIPOLYGON(((${minLng} ${minLat}, ${maxLng} ${minLat}, ${maxLng} ${maxLat}, ${minLng} ${maxLat}, ${minLng} ${minLat})))`;
    await prisma.$executeRaw`
      INSERT INTO "Country" (code, "nameEn", "nameTr", continent, geometry)
      VALUES (
        ${c.code},
        ${c.nameEn},
        ${c.nameTr},
        ${c.continent},
        ST_GeomFromText(${wkt}, 4326)::geography
      )
      ON CONFLICT (code) DO UPDATE
        SET "nameEn"   = EXCLUDED."nameEn",
            "nameTr"   = EXCLUDED."nameTr",
            continent  = EXCLUDED.continent
    `;
  }
  console.log(`   ✅ ${COUNTRIES.length} ülke eklendi\n`);

  // 2. Kullanıcılar
  console.log('👤 Kullanıcılar ekleniyor...');
  const createdUsers: { id: string; username: string }[] = [];

  for (const u of USERS) {
    const passwordHash = await argon2.hash(u.password);
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        username: u.username,
        displayName: u.displayName,
        bio: u.bio,
        homeCountry: u.homeCountry,
        passwordHash,
        emailVerifiedAt: new Date(),
      },
    });
    createdUsers.push({ id: user.id, username: user.username });
    console.log(`   👤 ${user.username} (${user.id})`);
  }
  console.log(`   ✅ ${createdUsers.length} kullanıcı eklendi\n`);

  // 3. Rotalar
  console.log('🗺️  Rotalar ekleniyor...');
  let routeCount = 0;

  for (const tpl of ROUTE_TEMPLATES) {
    const user = createdUsers[tpl.userIdx];
    if (!user) continue;

    const startedAt = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000); // son 90 gün
    const endedAt   = new Date(startedAt.getTime() + tpl.durationSeconds * 1000);

    // clientId — seed için deterministik UUID (route index bazlı)
    const clientId  = `00000000-0000-0000-0000-${String(routeCount).padStart(12, '0')}`;

    // Kısa LineString placeholder (ülke bbox merkezinden ufak bir segment)
    const country   = COUNTRIES.find((c) => c.code === tpl.countryCodes[0]);
    const [minLng, minLat, maxLng, maxLat] = country?.bbox ?? [28, 41, 29, 42];
    const midLng    = (minLng + maxLng) / 2;
    const midLat    = (minLat + maxLat) / 2;
    const wktLine   = `LINESTRING(${midLng} ${midLat}, ${midLng + 0.01} ${midLat + 0.01})`;

    await prisma.$executeRaw`
      INSERT INTO "Route" (
        id, "userId", title, source, visibility, "clientId",
        path, "simplifiedPath", "startPoint",
        "distanceMeters", "durationSeconds", "pointCount",
        "startedAt", "endedAt", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid(),
        ${user.id}::uuid,
        ${tpl.title},
        'GPS_TRACKED'::"RouteSource",
        'PUBLIC'::"Visibility",
        ${clientId}::uuid,
        ST_GeomFromText(${wktLine}, 4326)::geography,
        ST_GeomFromText(${wktLine}, 4326)::geography,
        ST_GeomFromText(${'POINT(' + midLng + ' ' + midLat + ')'}, 4326)::geography,
        ${tpl.distanceMeters},
        ${tpl.durationSeconds},
        2,
        ${startedAt.toISOString()}::timestamptz,
        ${endedAt.toISOString()}::timestamptz,
        NOW(),
        NOW()
      )
      ON CONFLICT ("clientId") DO NOTHING
    `;

    // RouteCountry ilişkisi
    for (const iso of tpl.countryCodes) {
      await prisma.$executeRaw`
        INSERT INTO "RouteCountry" ("routeId", "countryCode", "distanceMeters")
        SELECT r.id, ${iso}, ${tpl.distanceMeters}
        FROM   "Route" r
        WHERE  r."clientId" = ${clientId}::uuid
        ON CONFLICT DO NOTHING
      `;
    }

    routeCount++;
  }
  console.log(`   ✅ ${routeCount} rota eklendi\n`);

  // 4. Görev şablonları — TODO: M4'te quest_template tablosu Prisma'ya eklenince burası aktif hale gelir
  console.log('🎯 Görev şablonları:');
  console.log(`   ℹ️  ${QUEST_TEMPLATES.length} şablon tanımlı (M4'te DB'ye yazılacak)`);
  for (const qt of QUEST_TEMPLATES) {
    console.log(`   • [${qt.type}] ${qt.title}`);
  }
  console.log();

  console.log('✅ Seed tamamlandı!');
  console.log(`   📊 ${COUNTRIES.length} ülke | ${createdUsers.length} kullanıcı | ${routeCount} rota | ${QUEST_TEMPLATES.length} görev şablonu (beklemede)`);
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
