const API_URL = 'http://localhost:3000/api';
const PersonalAccessToken = require('./src/models/PersonalAccessToken');

async function verifyExpiration() {
  try {
    console.log('--- Registering User ---');
    const userEmail = `expire${Date.now()}@example.com`;
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Expire User', email: userEmail, password: 'password123' })
    });
    const registerData = await registerRes.json();
    const token = registerData.data.token;
    console.log('User Registered. Token:', token ? 'Yes' : 'No');

    // 1. Verify Token Works Initially
    console.log('\n--- Testing Valid Token ---');
    const validRes = await fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Valid Token Access:', validRes.status === 200 ? 'Success' : 'Failed');

    // 2. Manually Expire Token in DB
    console.log('\n--- Expiring Token Manually ---');
    // We need to find the token record and set expires_at to the past
    const tokenRecord = await PersonalAccessToken.findOne({ where: { token } });
    if (tokenRecord) {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 1); // Yesterday
        tokenRecord.expires_at = pastDate;
        await tokenRecord.save();
        console.log('Token expired in DB.');
    } else {
        console.error('Token record not found in DB.');
        return;
    }

    // 3. Verify Expired Token
    console.log('\n--- Testing Expired Token ---');
    const expiredRes = await fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const expiredData = await expiredRes.json();
    console.log('Expired Token Status:', expiredRes.status);
    console.log('Expired Token Message:', expiredData.message);
    
    if (expiredRes.status === 401 && expiredData.message === 'Token expired') {
        console.log('Verification PASSED: Token expired correctly.');
    } else {
        console.log('Verification FAILED: Unexpected response.');
    }

  } catch (error) {
    console.error('Verification Error:', error);
  }
}

verifyExpiration();
