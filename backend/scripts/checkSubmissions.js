const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSubmissions() {
    try {
        const submissions = await prisma.permohonan.findMany({
            take: 10,
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                ticket_number: true,
                status: true,
                user_id: true,
                created_at: true
            }
        });

        console.log('Recent Submissions:');
        console.log(JSON.stringify(submissions, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSubmissions();
