const { PrismaClient } = require('@prisma/client');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

const kecamatanData = [
    { kode: '35.19.01', nama: 'Kebonsari' },
    { kode: '35.19.02', nama: 'Geger' },
    { kode: '35.19.03', nama: 'Dolopo' },
    { kode: '35.19.04', nama: 'Dagangan' },
    { kode: '35.19.05', nama: 'Wungu' },
    { kode: '35.19.06', nama: 'Kare' },
    { kode: '35.19.07', nama: 'Gemarang' },
    { kode: '35.19.08', nama: 'Saradan' },
    { kode: '35.19.09', nama: 'Pilangkenceng' },
    { kode: '35.19.10', nama: 'Mejayan' },
    { kode: '35.19.11', nama: 'Wonoasri' },
    { kode: '35.19.12', nama: 'Sawahan' },
    { kode: '35.19.13', nama: 'Balerejo' },
    { kode: '35.19.14', nama: 'Madiun' },
    { kode: '35.19.15', nama: 'Jiwan' }
];

async function main() {
    console.log('🌍 Seeding Kecamatan data for Kabupaten Madiun...\n');

    for (const kec of kecamatanData) {
        const result = await prisma.kecamatan.upsert({
            where: { kode: kec.kode },
            update: {
                nama: kec.nama
            },
            create: {
                kode: kec.kode,
                nama: kec.nama
            }
        });
        console.log(`✅ Created/Updated: ${result.nama} (${result.kode})`);
    }

    console.log('\n✨ Seeding complete! Total kecamatan:', kecamatanData.length);
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
