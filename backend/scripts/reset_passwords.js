const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function resetPasswords() {
    console.log('🔐 Resetting passwords for testing...\n');

    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const users = ['admin', 'kua_officer', 'dukcapil_op'];

    for (const username of users) {
        await prisma.user.update({
            where: { username },
            data: { password: hashedPassword }
        });
        console.log(`✅ Reset password for: ${username}`);
    }

    console.log('\n✅ All passwords reset to: password123\n');
    await prisma.$disconnect();
}

resetPasswords().catch(console.error);
