const readline = require('readline');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Password validation function
const validatePassword = (password) => {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];

    if (password.length < minLength) {
        errors.push(`✗ Password minimal ${minLength} karakter`);
    }
    if (!hasUpperCase) {
        errors.push('✗ Password harus mengandung huruf besar (A-Z)');
    }
    if (!hasLowerCase) {
        errors.push('✗ Password harus mengandung huruf kecil (a-z)');
    }
    if (!hasNumbers) {
        errors.push('✗ Password harus mengandung angka (0-9)');
    }
    if (!hasSpecialChar) {
        errors.push('✗ Password harus mengandung karakter spesial (!@#$%^&*...)');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

// Common password check
const isCommonPassword = (password) => {
    const commonPasswords = [
        'password123', 'admin123', '12345678', 'qwerty123',
        'indonesia123', 'password', 'admin', 'administrator'
    ];

    return commonPasswords.includes(password.toLowerCase());
};

// Prompt for input
const question = (query) => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

// Main function
const createAdmin = async () => {
    console.log('\n===========================================');
    console.log('  SECURE ADMIN USER CREATION');
    console.log('===========================================\n');

    try {
        // Get username
        const username = await question('Username (min 5 karakter): ');

        if (username.length < 5) {
            console.error('❌ Username harus minimal 5 karakter');
            process.exit(1);
        }

        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            console.error('❌ Username sudah digunakan');
            process.exit(1);
        }

        // Get full name
        const fullName = await question('Nama Lengkap: ');

        if (!fullName || fullName.trim().length < 3) {
            console.error('❌ Nama lengkap harus minimal 3 karakter');
            process.exit(1);
        }

        // Get NIP (optional)
        const nip = await question('NIP (optional, tekan Enter untuk skip): ');

        // Get password
        console.log('\n📋 Persyaratan Password:');
        console.log('  ✓ Minimal 12 karakter');
        console.log('  ✓ Mengandung huruf besar (A-Z)');
        console.log('  ✓ Mengandung huruf kecil (a-z)');
        console.log('  ✓ Mengandung angka (0-9)');
        console.log('  ✓ Mengandung karakter spesial (!@#$%^&*...)\n');

        const password = await question('Password: ');

        // Validate password
        const validation = validatePassword(password);

        if (!validation.valid) {
            console.error('\n❌ Password tidak memenuhi persyaratan:');
            validation.errors.forEach(err => console.error(`  ${err}`));
            process.exit(1);
        }

        if (isCommonPassword(password)) {
            console.error('❌ Password terlalu umum. Gunakan password yang lebih unik.');
            process.exit(1);
        }

        // Confirm password
        const confirmPassword = await question('Konfirmasi Password: ');

        if (password !== confirmPassword) {
            console.error('❌ Password tidak cocok');
            process.exit(1);
        }

        // Hash password
        console.log('\n⏳ Membuat admin user...');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create admin user
        const admin = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                full_name: fullName.trim(),
                nip: nip.trim() || null,
                role: 'ADMIN',
                must_change_password: false // Admin set own password, no need to change
            }
        });

        console.log('\n✅ Admin user berhasil dibuat!');
        console.log('\n📝 Detail User:');
        console.log(`  ID: ${admin.id}`);
        console.log(`  Username: ${admin.username}`);
        console.log(`  Nama: ${admin.full_name}`);
        console.log(`  Role: ${admin.role}`);
        if (admin.nip) {
            console.log(`  NIP: ${admin.nip}`);
        }
        console.log('\n===========================================\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
};

// Run
createAdmin();
