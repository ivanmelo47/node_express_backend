const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:4000/api/auth/login';

async function verifySecurity() {
    console.log('--- Verifying Security (Rate Limiting) ---');
    console.log(`Testing against: ${API_URL}`);
    console.log('Sending repetitive requests to trigger Rate Limiter...');

    let requestCount = 0;
    const maxRequests = 25; // Auth limiter max is 20, so 25 should trigger it

    for (let i = 0; i < maxRequests; i++) {
        try {
            await axios.post(API_URL, {
                email: 'test@example.com',
                password: 'wrongpassword' 
            });
            requestCount++;
            process.stdout.write('.');
        } catch (err) {
            process.stdout.write('!');
            if (err.response) {
                // Check if headers exist
                const remaining = err.response.headers['ratelimit-remaining'];
                if (remaining !== undefined) {
                     // console.log(`[Limit Remaining: ${remaining}]`);
                } else {
                     // console.log('[No RateLimit headers]');
                }

                 if (err.response.status === 429) {
                    console.log(`\nSUCCESS: Rate Limiter triggered at request #${i + 1}.`);
                    console.log(`Status: ${err.response.status} ${err.response.statusText}`);
                    console.log(`Message: ${err.response.data.message}`);
                    process.exit(0);
                 } else if (remaining === '0') {
                    // Sometimes middleware sets remaining to 0 but status might be different if misconfigured? 
                    // But standard is 429.
                    console.log(`\nWARNING: Limit reached (Remaining: 0) but status is ${err.response.status}`);
                 }
            }
        }
    }

    console.log('\nFAILURE: Rate Limiter did NOT trigger after 25 requests.');
    process.exit(1);
}

verifySecurity();
