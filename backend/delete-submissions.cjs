const path = require('path');
const fs = require('fs');

// Try to find .env in current, parent, or project root
const envPaths = [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '../.env'),
    path.join(__dirname, '.env'),
    path.join(__dirname, '../.env')
];

let envLoaded = false;
for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
        require('dotenv').config({ path: envPath });
        console.log(`Loaded environment from: ${envPath}`);
        envLoaded = true;
        break;
    }
}

if (!envLoaded) {
    console.warn('Warning: Could not find .env file in expected locations.');
}

if (!process.env.DATABASE_URL) {
    // Construct local fallback
    process.env.DATABASE_URL = `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASS || 'postgres'}@localhost:5432/${process.env.DB_NAME || 'kua_dukcapil_db'}`;
    console.log(`Using constructed DATABASE_URL: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);
}
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllSubmissions() {
    console.log('--- Starting Deletion of All Submission Data ---');
    try {
        // Since we have Cascade Delete in the schema, 
        // deleting Permohonan will delete DataPernikahan, Dokumen, and StatusLog
        const count = await prisma.permohonan.deleteMany({});

        console.log(`Successfully deleted ${count.count} submissions and all their related data.`);
        console.log('Deletion Complete.');
    } catch (error) {
        console.error('Deletion failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteAllSubmissions();
