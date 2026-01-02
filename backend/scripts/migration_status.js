const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateStatuses() {
    console.log('='.repeat(60));
    console.log('STATUS MIGRATION SCRIPT');
    console.log('='.repeat(60));
    console.log();

    try {
        // Get count of submissions by current status
        console.log('📊 Current submissions by status:\n');

        const statusCounts = await prisma.permohonan.groupBy({
            by: ['status'],
            _count: {
                id: true
            }
        });

        statusCounts.forEach(({ status, _count }) => {
            console.log(`   ${status}: ${_count.id} submission(s)`);
        });

        console.log('\n' + '-'.repeat(60));
        console.log('Migration Logic:');
        console.log('  • PROCESSING → Check assignee role');
        console.log('    - If assigned to VERIFIKATOR → PENDING_VERIFICATION');
        console.log('    - If assigned to OPERATOR → PROCESSING (no change)');
        console.log('    - If not assigned → PROCESSING (no change)');
        console.log('  • All other statuses → No change');
        console.log('-'.repeat(60) + '\n');

        // Find PROCESSING submissions
        const processingSubmissions = await prisma.permohonan.findMany({
            where: {
                status: 'PROCESSING'
            },
            include: {
                assignee: true
            }
        });

        if (processingSubmissions.length === 0) {
            console.log('✅ No PROCESSING submissions found. No migration needed.\n');
            await prisma.$disconnect();
            return;
        }

        console.log(`Found ${processingSubmissions.length} PROCESSING submission(s):\n`);

        const toMigrate = [];
        const noChange = [];

        for (const submission of processingSubmissions) {
            if (submission.assignee && submission.assignee.role === 'VERIFIKATOR_DUKCAPIL') {
                toMigrate.push({
                    id: submission.id,
                    ticketNumber: submission.ticket_number,
                    assignee: submission.assignee.full_name,
                    oldStatus: 'PROCESSING',
                    newStatus: 'PENDING_VERIFICATION'
                });
            } else {
                noChange.push({
                    id: submission.id,
                    ticketNumber: submission.ticket_number,
                    assignee: submission.assignee ? submission.assignee.full_name : 'Unassigned',
                    status: 'PROCESSING'
                });
            }
        }

        console.log(`📝 To migrate: ${toMigrate.length}`);
        console.log(`📝 No change: ${noChange.length}\n`);

        if (toMigrate.length === 0) {
            console.log('✅ No submissions need status migration.\n');
            await prisma.$disconnect();
            return;
        }

        console.log('='.repeat(60));
        console.log('SUBMISSIONS TO MIGRATE:');
        console.log('='.repeat(60));

        toMigrate.forEach((item, index) => {
            console.log(`${index + 1}. ${item.ticketNumber}`);
            console.log(`   Assignee: ${item.assignee}`);
            console.log(`   ${item.oldStatus} → ${item.newStatus}`);
        });

        console.log('\n🚀 Starting migration...\n');

        let successCount = 0;
        let failCount = 0;

        for (const item of toMigrate) {
            try {
                await prisma.permohonan.update({
                    where: { id: item.id },
                    data: { status: item.newStatus }
                });

                // Create audit log
                if (item.id) {
                    const assigneeId = processingSubmissions.find(s => s.id === item.id)?.assignee?.id;

                    if (assigneeId) {
                        await prisma.statusLog.create({
                            data: {
                                permohonan_id: item.id,
                                actor_id: assigneeId,
                                previous_status: 'PROCESSING',
                                new_status: 'PENDING_VERIFICATION',
                                notes: 'Automatic migration: PROCESSING → PENDING_VERIFICATION'
                            }
                        });
                    }
                }

                console.log(`✅ ${item.ticketNumber}: ${item.oldStatus} → ${item.newStatus}`);
                successCount++;
            } catch (error) {
                console.log(`❌ ${item.ticketNumber}: FAILED - ${error.message}`);
                failCount++;
            }
        }

        // Final report
        console.log('\n' + '='.repeat(60));
        console.log('MIGRATION COMPLETE');
        console.log('='.repeat(60));
        console.log(`✅ Success: ${successCount}`);
        console.log(`❌ Failed: ${failCount}`);
        console.log(`📊 Total: ${toMigrate.length}`);
        console.log('='.repeat(60) + '\n');

        if (failCount > 0) {
            console.log('⚠️  Some migrations failed. Please check the errors above.\n');
        } else {
            console.log('✨ All statuses migrated successfully!\n');
        }

    } catch (error) {
        console.error('\n❌ Migration error:', error);
        console.error('\nStack trace:', error.stack);
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateStatuses()
    .catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
