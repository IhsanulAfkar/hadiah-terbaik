const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateRoles() {
    console.log('='.repeat(60));
    console.log('MERGE DUKCAPIL ROLE');
    console.log('='.repeat(60));

    try {
        // Check if migration is needed (look for old DUKCAPIL role in database)
        console.log('📊 Checking for users with legacy role...\n');

        const dukcapilUsers = await prisma.$queryRaw`
            SELECT id, username, full_name, nip, role 
            FROM users 
            WHERE role in ('VERIFIKATOR_DUKCAPIL','OPERATOR_DUKCAPIL')
        `;
        const users = await prisma.user.updateMany({
            where: {
                role: {
                    in: ['OPERATOR_DUKCAPIL', 'VERIFIKATOR_DUKCAPIL']
                }
            },
            data: {
                role: 'DUKCAPIL'
            }
        })
        if (dukcapilUsers.length === 0) {
            console.log('✅ No users found with OPERATOR or VERIFIKATOR DUKCAPIL role.');
            console.log('   Migration not needed or already completed.\n');

            await prisma.$disconnect();
            return;
        }

        console.log(`⚠️  Found ${dukcapilUsers.length} user(s) updated to DUKCAPIL\n`);

    } catch (error) {
        console.error('\n❌ Migration error:', error);
        console.error('\nStack trace:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateRoles()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
