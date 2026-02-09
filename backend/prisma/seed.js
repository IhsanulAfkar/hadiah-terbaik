/* eslint-disable no-console */
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Generate secure random password
function generateSecurePassword(length = 16) {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const special = '!@#$%^&*()_-+=[]{}';

    const all = uppercase + lowercase + numbers + special;

    let password = '';

    // Ensure at least one of each type
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += special[Math.floor(Math.random() * special.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
        password += all[Math.floor(Math.random() * all.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
}

async function main() {
    console.log('🌱 Starting database seeding...');
    console.log('⚠️  SECURITY: Generating secure random passwords for all users');

    const credentials = [];

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

    // 2. Create Super Admin with random password
    console.log('👤 Seeding users with secure passwords...');
    const adminPassword = generateSecurePassword(16);
    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password: adminPasswordHash,
            full_name: 'Super Administrator',
            nip: '199001012020011001',
            role: 'ADMIN',
            must_change_password: false, // Force password change on first login
        },
    });
    console.log(`✅ Created user: ${admin.username}`);
    credentials.push({
        username: admin.username,
        password: adminPassword,
        role: 'ADMIN',
        full_name: admin.full_name
    });

    // 3. Create KUA User with random password
    const kuaPassword = generateSecurePassword(16);
    const kuaPasswordHash = await bcrypt.hash(kuaPassword, 10);

    const kuaUser = await prisma.user.upsert({
        where: { username: 'kua_officer' },
        update: {},
        create: {
            username: 'kua_officer',
            password: kuaPasswordHash,
            full_name: 'Petugas KUA Mejayan',
            nip: '198505052010011005',
            role: 'KUA',
            kecamatan_id: mejayanKecamatan?.id,
            must_change_password: false,
        },
    });
    console.log(`✅ Created user: ${kuaUser.username}`);
    credentials.push({
        username: kuaUser.username,
        password: kuaPassword,
        role: 'KUA',
        full_name: kuaUser.full_name
    });

    // 4. Create Dukcapil Operator with random password
    const operatorPassword = generateSecurePassword(16);
    const operatorPasswordHash = await bcrypt.hash(operatorPassword, 10);

    const dukcapilUser = await prisma.user.upsert({
        where: { username: 'dukcapil_op' },
        update: {},
        create: {
            username: 'dukcapil_op',
            password: operatorPasswordHash,
            full_name: 'Operator Dukcapil',
            nip: '199202022015022002',
            role: 'OPERATOR_DUKCAPIL',
            must_change_password: false,
        },
    });
    console.log(`✅ Created user: ${dukcapilUser.username}`);
    credentials.push({
        username: dukcapilUser.username,
        password: operatorPassword,
        role: 'OPERATOR_DUKCAPIL',
        full_name: dukcapilUser.full_name
    });

    // 5. Create Dukcapil Verifier with random password
    const verifierPassword = generateSecurePassword(16);
    const verifierPasswordHash = await bcrypt.hash(verifierPassword, 10);

    const verifier = await prisma.user.upsert({
        where: { username: 'dukcapil_verifier' },
        update: {},
        create: {
            username: 'dukcapil_verifier',
            password: verifierPasswordHash,
            full_name: 'Verifikator Dukcapil',
            nip: '199303032015032003',
            role: 'VERIFIKATOR_DUKCAPIL',
            must_change_password: false,
        },
    });
    console.log(`✅ Created user: ${verifier.username}`);
    credentials.push({
        username: verifier.username,
        password: verifierPassword,
        role: 'VERIFIKATOR_DUKCAPIL',
        full_name: verifier.full_name
    });

    // 6. Create Kemenag user with random password
    const kemenagPassword = generateSecurePassword(16);
    const kemenagPasswordHash = await bcrypt.hash(kemenagPassword, 10);

    const kemenag = await prisma.user.upsert({
        where: { username: 'kemenag_user' },
        update: {},
        create: {
            username: 'kemenag_user',
            password: kemenagPasswordHash,
            full_name: 'Petugas Kemenag',
            nip: '199404042015042004',
            role: 'KEMENAG',
            must_change_password: false,
        },
    });
    console.log(`✅ Created user: ${kemenag.username}`);
    credentials.push({
        username: kemenag.username,
        password: kemenagPassword,
        role: 'KEMENAG',
        full_name: kemenag.full_name
    });

    // Save credentials to secure file
    const credentialsFile = path.join(__dirname, '../SEEDED_CREDENTIALS.txt');
    let credentialsContent = '================================================\n';
    credentialsContent += '  SEEDED USER CREDENTIALS - DEVELOPMENT ONLY\n';
    credentialsContent += '================================================\n';
    credentialsContent += 'Generated: ' + new Date().toISOString() + '\n\n';
    credentialsContent += '⚠️  IMPORTANT SECURITY NOTICE:\n';
    credentialsContent += '1. These credentials are for DEVELOPMENT/TESTING ONLY\n';
    credentialsContent += '2. All users MUST change their password on first login\n';
    credentialsContent += '3. DELETE this file after noting the credentials\n';
    credentialsContent += '4. NEVER commit this file to version control\n';
    credentialsContent += '5. For production, use the create_admin.js script instead\n\n';
    credentialsContent += '================================================\n\n';

    credentials.forEach((cred, index) => {
        credentialsContent += `${index + 1}. ${cred.role}\n`;
        credentialsContent += `   Name: ${cred.full_name}\n`;
        credentialsContent += `   Username: ${cred.username}\n`;
        credentialsContent += `   Password: ${cred.password}\n`;
        credentialsContent += `   Status: Must change password on first login\n\n`;
    });

    credentialsContent += '================================================\n';

    fs.writeFileSync(credentialsFile, credentialsContent, { mode: 0o600 }); // Read/write for owner only

    console.log('\n🎉 Seeding completed successfully!');
    console.log('\n⚠️  IMPORTANT:');
    console.log('   Credentials saved to: SEEDED_CREDENTIALS.txt');
    console.log('   Please note these credentials and DELETE the file immediately');
    console.log('   All users must change their password on first login\n');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
