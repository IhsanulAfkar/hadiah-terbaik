/* eslint-disable no-console, no-unused-vars */
const fs = require('fs');
const path = require('path');

// Helper to wait
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
    const baseUrl = 'http://localhost:3000/api/v1';
    console.log('--- JOIN KUA-DUKCAPIL BACKEND VERIFICATION ---');

    // 1. Login Logic
    async function login(username, password, role) {
        console.log(`\n[${role}] Logging in as ${username}...`);
        const res = await fetch(`${baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!res.ok) {
            const err = await res.text();
            throw new Error(`Login failed: ${res.status} ${err}`);
        }

        const data = await res.json();
        console.log(`[${role}] Login Success! Token: ${data.data.token.substring(0, 15)}...`);
        return data.data.token;
    }

    try {
        // --- STEP 1: AUTHENTICATION ---
        const kuaToken = await login('kua_officer', 'password123', 'KUA');
        const dukToken = await login('dukcapil_op', 'password123', 'DUKCAPIL');

        // --- STEP 2: SUBMISSION (KUA) ---
        console.log('\n[KUA] Creating Submission (Multipart)...');

        // Construct Multipart manually since we don't have 'form-data' package guaranteed in dev deps yet, 
        // actually node 18 fetch supports FormData if available, but Node's native FormData is experimental in some versions.
        // Let's rely on 'undici' or similar? Node 18 has fetch globally.
        // But for Multipart in Node 18 native fetch, we need to use `FormData`.
        // If `FormData` is not available, we might fail.
        // Let's try to assume FormData is available (Node 18+).

        const formData = new FormData();
        formData.append('data_pernikahan', JSON.stringify({
            husband_name: 'Budi Santoso',
            husband_nik: '1234567890123456',
            wife_name: 'Siti Aminah',
            wife_nik: '6543210987654321',
            marriage_date: new Date().toISOString(),
            marriage_book_no: 'AB-123456',
            kua_code: 'KUA-01'
        }));

        // Dummy file (PDF)
        const blob = new Blob(["%PDF-1.4 dummy content"], { type: 'application/pdf' });
        formData.append('ktp_suami', blob, 'ktp_suami.pdf');

        const subRes = await fetch(`${baseUrl}/submissions`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${kuaToken}`
                // Note: fetch automatically sets Content-Type boundary for FormData
            },
            body: formData
        });

        if (!subRes.ok) {
            const err = await subRes.text();
            throw new Error(`Submission failed: ${subRes.status} ${err}`);
        }

        const subData = await subRes.json();
        const ticket = subData.data.ticket_number;
        const subId = subData.data.id;
        console.log(`[KUA] Submission Created! Ticket: ${ticket} (ID: ${subId})`);


        // --- STEP 3: QUEUE (DUKCAPIL) ---
        console.log('\n[DUKCAPIL] Checking Queue...');
        const qRes = await fetch(`${baseUrl}/verification/queue?status=SUBMITTED`, {
            headers: { 'Authorization': `Bearer ${dukToken}` }
        });
        const qData = await qRes.json();
        console.log('Queue Response:', JSON.stringify(qData, null, 2));
        console.log(`[DUKCAPIL] Queue count: ${qData.data?.total}`);

        const target = qData.data.data.find(d => d.id === subId);
        if (!target) { throw new Error('Submission not found in queue'); }
        console.log('[DUKCAPIL] Found target submission in queue.');


        // --- STEP 4: LOCK (DUKCAPIL) ---
        console.log('\n[DUKCAPIL] Locking Submission...');
        const lockRes = await fetch(`${baseUrl}/verification/${subId}/lock`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${dukToken}` }
        });
        if (!lockRes.ok) { throw new Error('Lock failed'); }
        console.log('[DUKCAPIL] Locked successfully.');


        // --- STEP 5: VERIFY (DUKCAPIL) ---
        console.log('\n[DUKCAPIL] Approving Submission...');
        const verifyRes = await fetch(`${baseUrl}/verification/${subId}/verify`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${dukToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                decision: 'APPROVED',
                notes: 'Data valid dan lengkap.'
            })
        });
        if (!verifyRes.ok) { throw new Error('Verification failed'); }
        const verifyData = await verifyRes.json();
        console.log(`[DUKCAPIL] Decision: ${verifyData.data.status}`);

        console.log('\n--- VERIFICATION COMPLETE: SYSTEM STABLE ---');

    } catch (e) {
        console.error('\n!!! VERIFICATION FAILED !!!');
        console.error(e);
        process.exit(1);
    }
}

run();
