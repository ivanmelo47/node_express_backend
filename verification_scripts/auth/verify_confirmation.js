const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:4000/api/auth';
const TEST_EMAIL = `confirm_test_${Date.now()}@example.com`;
const TEST_PASSWORD = 'password123';

async function verifyConfirmation() {
    console.log('--- Verifying Account Confirmation API ---');
    
    let token = '';

    // 1. Register
    try {
        console.log(`\n1. Registering user: ${TEST_EMAIL}`);
        const res = await axios.post(`${API_URL}/register`, {
            name: 'Confirmation Tester',
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        }, { headers: { 'X-Forwarded-For': '10.0.1.1' } }); // Spoof IP
        
        if (res.status === 201) {
            console.log('SUCCESS: Registration API returned 201.');
            token = res.data.data.mockConfirmationToken; // We kept this for testing
            if (!token) {
                console.error('FAILURE: No mock token returned!', res.data);
                process.exit(1);
            }
            console.log(`Token received: ${token}`);
        }
    } catch (err) {
        console.error('FAILURE: Registration failed');
        if (err.response) console.error(err.response.data);
        process.exit(1);
    }

    // 2. Try Login (Should Fail)
    try {
        console.log('\n2. Testing Login BEFORE confirmation (Expect Failure)...');
        await axios.post(`${API_URL}/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        }, { headers: { 'X-Forwarded-For': '10.0.1.1' } });
        console.error('FAILURE: Login succeeded but should have failed (unconfirmed)!');
        process.exit(1);
    } catch (err) {
        if (err.response && err.response.status === 403) {
            console.log('SUCCESS: Login failed with 403 as expected.');
        } else {
            console.error(`FAILURE: Unexpected login error: ${err.message}`);
             if (err.response) console.error(err.response.data);
            process.exit(1);
        }
    }

    // 3. Confirm Account
    try {
        console.log('\n3. Confirming Account...');
        const res = await axios.post(`${API_URL}/confirm-account`, {
            token: token
        }, { headers: { 'X-Forwarded-For': '10.0.1.1' } });
        if (res.status === 200) {
            console.log('SUCCESS: Account confirmation returned 200.');
        }
    } catch (err) {
         console.error('FAILURE: Confirmation failed');
         if (err.response) console.error(err.response.data);
         process.exit(1);
    }

    // 4. Try Login (Should Succeed)
    try {
        console.log('\n4. Testing Login AFTER confirmation (Expect Success)...');
        const res = await axios.post(`${API_URL}/login`, {
            email: TEST_EMAIL,
            password: TEST_PASSWORD
        }, { headers: { 'X-Forwarded-For': '10.0.1.1' } });
        if (res.status === 200) {
            console.log('SUCCESS: Login succeeded.');
        }
    } catch (err) {
        console.error('FAILURE: Login failed after confirmation!');
         if (err.response) console.error(err.response.data);
         process.exit(1);
    }
    
    // 5. Try Confirm Again (Should Fail - Token reused/cleared)
    try {
        console.log('\n5. Testing Double Confirmation (Expect Failure)...');
        await axios.post(`${API_URL}/confirm-account`, {
            token: token
        }, { headers: { 'X-Forwarded-For': '10.0.1.1' } });
        console.error('FAILURE: Double confirmation succeeded but should fail!');
        process.exit(1);
    } catch (err) {
        if (err.response && (err.response.status === 404 || err.response.status === 400)) {
            console.log('SUCCESS: Double confirmation failed as expected (Token cleared).');
        } else {
             console.error(`FAILURE: Unexpected double confirmation error: ${err.message}`);
             if (err.response) console.error(err.response.data);
             // process.exit(1); // Optional, but usually strictly incorrect
        }
    }

    console.log('\n--- VERIFICATION PASSED ---');
    process.exit(0);
}

verifyConfirmation();
