const API_URL = 'http://localhost:4000/api';

async function testRBAC() {
  try {
    console.log('--- Setting up Users ---');
    // 1. Register Admin
    const adminEmail = `admin${Date.now()}@example.com`;
    console.log(`Registering Admin (${adminEmail})...`);
    const adminRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin User', email: adminEmail, password: 'password123' })
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.data.token;

    // Manually update role to admin (simulating DB update since we don't have an endpoint for it yet)
    // NOTE: In a real scenario, we'd need direct DB access or a seed. 
    // For this test, we might fail if the user is created as 'user' by default.
    // Let's assume we need to hack the DB or just test the 'user' failure first.
    
    // 2. Register User
    const userEmail = `user${Date.now()}@example.com`;
    console.log(`Registering User (${userEmail})...`);
    const userRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Normal User', email: userEmail, password: 'password123' })
    });
    const userData = await userRes.json();
    const userToken = userData.data.token;

    console.log('\n--- Testing RBAC ---');

    // 3. Test GET (Allowed for User)
    console.log('User accessing GET /users...');
    const getRes = await fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('Status:', getRes.status, getRes.status === 200 ? '(OK)' : '(Failed)');

    // 4. Test DELETE (Forbidden for User)
    console.log('User accessing DELETE /users/1...');
    const deleteRes = await fetch(`${API_URL}/users/1`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('Status:', deleteRes.status, deleteRes.status === 403 ? '(OK - Forbidden)' : '(Failed - Should be 403)');

    // 5. Test DELETE (Allowed for Admin - assuming we can make them admin)
    // Since we can't easily make them admin via API without a backdoor, 
    // we will just log that we need to manually verify this or update the DB.
    console.log('Admin accessing DELETE /users/1...');
    const adminDeleteRes = await fetch(`${API_URL}/users/1`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('Status:', adminDeleteRes.status, ' (If 403, it means the user is not actually admin yet)');

  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}

testRBAC();
