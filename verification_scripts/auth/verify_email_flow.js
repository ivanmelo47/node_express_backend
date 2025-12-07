const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:4000/api/auth';
const TEST_EMAIL = `test_struct_refactor_${Date.now()}@example.com`;

async function verifyEmailFlow() {
    console.log('--- Verifying Email Flow (Transporter Pattern) ---');
    console.log(`Registering user: ${TEST_EMAIL}`);

    try {
        const res = await axios.post(`${API_URL}/register`, {
            name: 'Structure Tester',
            email: TEST_EMAIL,
            password: 'password123'
        }, { headers: { 'X-Forwarded-For': '10.0.1.2' } }); // Spoof IP

        if (res.status === 201) {
            console.log('SUCCESS: Registration API returned 201.');
            console.log('CHECK CONSOLE FOR: "Message sent: <id>"');
        } else {
            console.error('FAILURE: Registration failed, status:', res.status);
        }

    } catch (err) {
        console.error('FAILURE: API Call failed');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error(err.message);
        }
        process.exit(1);
    }
}

verifyEmailFlow();
