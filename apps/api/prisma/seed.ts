import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seed başlıyor...');

  // Seed verileri Modül 1'de eklenecek
  // (Natural Earth ülke verileri + örnek kullanıcılar)

  console.log('✅ Seed tamamlandı');
}

main()
  .catch((e) => {
    console.error('Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
