/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    // 1. Seed Kecamatan data for Kabupaten Madiun
    console.log('📍 Seeding Kecamatan data...');
    const kecamatanData = [
        { kode: '1', nama: 'Sawahan' },
        { kode: '2', nama: 'Wungu' },
        { kode: '3', nama: 'Mejayan' },
        { kode: '4', nama: 'Geger' },
        { kode: '5', nama: 'Saradan' },
        { kode: '6', nama: 'Pilangkenceng' },
        { kode: '7', nama: 'Kebonsari' },
        { kode: '8', nama: 'Gemarang' },
        { kode: '9', nama: 'Wonoasri' },
        { kode: '10', nama: 'Dagangan' },
        { kode: '11', nama: 'Kare' },
        { kode: '12', nama: 'Dolopo' },
        { kode: '13', nama: 'Jiwan' },
        { kode: '14', nama: 'Balerejo' },
        { kode: '15', nama: 'Madiun' },
    ];

    for (const kec of kecamatanData) {
        await prisma.kecamatan.upsert({
            where: { kode: kec.kode },
            update: {},
            create: kec,
        });
    }
    console.log(`✅ Created ${kecamatanData.length} kecamatan records`);

    // Get Mejayan kecamatan for KUA user
    const mejayanKecamatan = await prisma.kecamatan.findUnique({ where: { kode: '3' } });

    // 2. Create Super Admin
    console.log('👤 Seeding users...');
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: passwordHash,
            full_name: 'Super Administrator',
            nip: '199001012020011001',
            role: 'ADMIN',
        },
    });
    console.log(`✅ Created user: ${admin.username}`);

    // 3. Create KUA User (with kecamatan)
    const kuaUser = await prisma.user.upsert({
        where: { username: 'kua_officer' },
        update: {},
        create: {
            username: 'kua_officer',
            password: passwordHash,
            full_name: 'Petugas KUA Mejayan',
            nip: '198505052010011005',
            role: 'KUA',
            kecamatan_id: mejayanKecamatan?.id,
        },
    });
    console.log(`✅ Created user: ${kuaUser.username}`);

    // 4. Create Dukcapil User
    const dukcapilUser = await prisma.user.upsert({
        where: { username: 'dukcapil_op' },
        update: {},
        create: {
            username: 'dukcapil_op',
            password: passwordHash,
            full_name: 'Operator Dukcapil',
            nip: '199202022015022002',
            role: 'OPERATOR_DUKCAPIL',
        },
    });
    console.log(`✅ Created user: ${dukcapilUser.username}`);

    console.log('🎉 Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
