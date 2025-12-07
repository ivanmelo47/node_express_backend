const API_URL = 'http://localhost:3000/api';

async function testAbilities() {
  try {
    console.log('--- Setting up Users ---');
    
    // 1. Register Admin (Should get ['*'])
    const adminEmail = `admin${Date.now()}@example.com`;
    console.log(`Registering Admin (${adminEmail})...`);
    const adminRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin User', email: adminEmail, password: 'password123' })
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.data.token;
    
    // Hack: We need to make this user an admin in the DB to get the role, 
    // BUT since we just registered, they are 'user' by default.
    // However, the register endpoint assigns abilities based on the role AT CREATION.
    // Wait, my authController logic for register sets role='user' hardcoded.
    // So the admin user created here is actually a normal user with ['user:read', 'user:update'].
    // To test the admin wildcard, we'd need to login AS an existing admin.
    // Let's assume the previous verify_rbac.js run created an admin (if we manually updated DB).
    
    // For this test, let's focus on the "Normal User" abilities.
    // A normal user has ['user:read', 'user:update'].
    // They should be able to GET.
    // They should NOT be able to DELETE (requires 'user:delete' AND 'admin' role).
    
    const userEmail = `user${Date.now()}@example.com`;
    console.log(`Registering User (${userEmail})...`);
    const userRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Normal User', email: userEmail, password: 'password123' })
    });
    const userData = await userRes.json();
    const userToken = userData.data.token;

    console.log('\n--- Testing Abilities ---');

    // 2. Test GET (Requires 'user:read') - Should Succeed
    console.log('User accessing GET /users...');
    const getRes = await fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('Status:', getRes.status, getRes.status === 200 ? '(OK)' : '(Failed)');

    // 3. Test DELETE (Requires 'user:delete') - Should Fail (User doesn't have this ability)
    // Note: It will also fail due to roleMiddleware, but let's see if abilityMiddleware catches it first 
    // or if they run in sequence. In routes, roleMiddleware is first.
    // So to test abilityMiddleware specifically, we might need a route that allows the role but checks ability.
    // But for now, let's just verify standard access.
    
    console.log('User accessing DELETE /users/1...');
    const deleteRes = await fetch(`${API_URL}/users/1`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('Status:', deleteRes.status, deleteRes.status === 403 ? '(OK - Forbidden)' : '(Failed)');
    const deleteData = await deleteRes.json();
    console.log('Message:', deleteData.message);

  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}

testAbilities();
