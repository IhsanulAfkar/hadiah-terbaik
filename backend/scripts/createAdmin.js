const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO');
// console.log('DATABASE_URL value:', process.env.DATABASE_URL); // Don't log secrets in prod usually, but here checking if it's there.

// Construct DATABASE_URL if missing
if (!process.env.DATABASE_URL) {
    const { DB_USER, DB_PASS, DB_NAME } = process.env;
    process.env.DATABASE_URL = `postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public`;
    console.log('Constructed DATABASE_URL:', process.env.DATABASE_URL);
}

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    console.log('Creating Admin User...');

    const password = await bcrypt.hash('admin123', 10);

    // Upsert Admin
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: password, // Force update password
            full_name: 'Super Administrator',
            role: 'ADMIN'       // Ensure role is ADMIN
        },
        create: {
            username: 'admin',
            password,
            full_name: 'Super Administrator',
            nip: '999999999',
            role: 'ADMIN'
        }
    });

    console.log(`Admin created: ${admin.username} / admin123`);
    console.log('Please login via Swagger using these credentials.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
