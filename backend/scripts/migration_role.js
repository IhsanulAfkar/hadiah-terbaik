const { PrismaClient } = require('@prisma/client');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function migrateRoles() {
    console.log('='.repeat(60));
    console.log('ROLE MIGRATION SCRIPT');
    console.log('='.repeat(60));
    console.log();

    try {
        // Check if migration is needed (look for old DUKCAPIL role in database)
        console.log('📊 Checking for users with legacy role...\n');

        const dukcapilUsers = await prisma.$queryRaw`
            SELECT id, username, full_name, nip, role 
            FROM users 
            WHERE role = 'DUKCAPIL'
        `;

        if (dukcapilUsers.length === 0) {
            console.log('✅ No users found with DUKCAPIL role.');
            console.log('   Migration not needed or already completed.\n');
            rl.close();
            await prisma.$disconnect();
            return;
        }

        console.log(`⚠️  Found ${dukcapilUsers.length} user(s) with DUKCAPIL role:\n`);

        dukcapilUsers.forEach((user, index) => {
            console.log(`${index + 1}. ${user.full_name} (${user.username}) - NIP: ${user.nip}`);
        });

        console.log('\n' + '-'.repeat(60));
        console.log('These users need to be assigned to either:');
        console.log('  [1] OPERATOR_DUKCAPIL  - Processes submissions');
        console.log('  [2] VERIFIKATOR_DUKCAPIL - Verifies and approves submissions');
        console.log('-'.repeat(60) + '\n');

        const assignments = [];

        // Interactive role assignment
        for (const user of dukcapilUsers) {
            console.log(`\n👤 User: ${user.full_name} (${user.username})`);

            let choice;
            while (true) {
                choice = await question('   Assign to [1] OPERATOR or [2] VERIFIKATOR? ');

                if (choice === '1' || choice === '2') {
                    break;
                }
                console.log('   ❌ Invalid choice. Please enter 1 or 2.');
            }

            const newRole = choice === '1' ? 'OPERATOR_DUKCAPIL' : 'VERIFIKATOR_DUKCAPIL';
            assignments.push({
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                oldRole: 'DUKCAPIL',
                newRole: newRole
            });

            console.log(`   ✓ Will assign to: ${newRole}`);
        }

        // Confirmation
        console.log('\n' + '='.repeat(60));
        console.log('MIGRATION SUMMARY');
        console.log('='.repeat(60));

        assignments.forEach((assignment, index) => {
            console.log(`${index + 1}. ${assignment.full_name} (${assignment.username})`);
            console.log(`   ${assignment.oldRole} → ${assignment.newRole}`);
        });

        console.log('\n');
        const confirm = await question('Proceed with migration? (yes/no): ');

        if (confirm.toLowerCase() !== 'yes' && confirm.toLowerCase() !== 'y') {
            console.log('\n❌ Migration cancelled by user.\n');
            rl.close();
            await prisma.$disconnect();
            return;
        }

        // Execute migration
        console.log('\n🚀 Starting migration...\n');

        let successCount = 0;
        let failCount = 0;

        for (const assignment of assignments) {
            try {
                await prisma.$executeRaw`
                    UPDATE users 
                    SET role = ${assignment.newRole}::text::"Role"
                    WHERE id = ${assignment.id}
                `;

                console.log(`✅ ${assignment.username}: ${assignment.oldRole} → ${assignment.newRole}`);
                successCount++;
            } catch (error) {
                console.log(`❌ ${assignment.username}: FAILED - ${error.message}`);
                failCount++;
            }
        }

        // Final report
        console.log('\n' + '='.repeat(60));
        console.log('MIGRATION COMPLETE');
        console.log('='.repeat(60));
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log(`📊 Total: ${assignments.length}`);
        console.log('='.repeat(60) + '\n');

        if (failCount > 0) {
            console.log('⚠️  Some migrations failed. Please check the errors above.\n');
        } else {
            console.log('✨ All users migrated successfully!\n');
        }

    } catch (error) {
        console.error('\n❌ Migration error:', error);
        console.error('\nStack trace:', error.stack);
    } finally {
        rl.close();
        await prisma.$disconnect();
    }
}

// Run migration
migrateRoles()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
