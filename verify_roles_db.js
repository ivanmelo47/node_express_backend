require('module-alias/register');
const User = require('@/models/User');
const Role = require('@/models/Role');
// But loading models might require DB connection setup which is async.
// Let's try to use the API for everything except promotion, which we'll do via a separate internal function if possible, 
// or just rely on the fact that we can require the models.

// Actually, requiring models directly in a script that runs via `node` should work if we handle the async connection.

const API_URL = 'http://localhost:3000/api';

async function verifyRoles() {
  try {
    // 1. Register a standard user
    const userEmail = `user${Date.now()}@example.com`;
    console.log(`Registering User (${userEmail})...`);
    const userRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Standard User', email: userEmail, password: 'password123' })
    });
    const userData = await userRes.json();
    
    if (!userRes.ok) {
        console.error('Register failed:', userData);
        return;
    }
    console.log('User Registered. Token:', userData.data.token ? 'Yes' : 'No');

    // 2. Verify User Role (via abilities or behavior)
    // Try to delete (should fail)
    const userToken = userData.data.token;
    const deleteRes = await fetch(`${API_URL}/users/1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${userToken}` }
    });
    console.log('User Delete Access:', deleteRes.status === 403 ? 'Forbidden (Correct)' : `Unexpected ${deleteRes.status}`);

    // 3. Register an Admin Candidate
    const adminEmail = `admin${Date.now()}@example.com`;
    console.log(`\nRegistering Admin Candidate (${adminEmail})...`);
    const adminRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Admin Candidate', email: adminEmail, password: 'password123' })
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.data.token;

    // 4. Promote to Admin (Direct DB Access)
    console.log('Promoting user to admin via DB...');
    // We need to run this in a way that has access to models. 
    // Since this script is running in the same env, we can try to import.
    // However, we need to wait for connection.
    
    // Dynamic import to avoid top-level await issues if not supported, though Node 22 supports it.
    const User = require('./src/models/User');
    const Role = require('./src/models/Role');
    
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    const userToPromote = await User.findOne({ where: { email: adminEmail } });
    
    if (adminRole && userToPromote) {
        userToPromote.roleId = adminRole.id;
        await userToPromote.save();
        console.log('User promoted to admin.');
    } else {
        console.error('Could not find user or role to promote.');
    }

    // 5. Verify Admin Access
    // We need to re-login to get a new token with updated abilities?
    // OR does the token check the user's CURRENT role in the DB?
    // The `authMiddleware` fetches the user from the DB using the token.
    // The `roleMiddleware` checks `req.user.Role`.
    // So the change should be immediate for the *Role* check.
    // BUT the *Abilities* are stored in the token at creation time.
    // So `abilityMiddleware` will still fail if it checks the token's abilities.
    // `roleMiddleware` checks the user's role from DB.
    // `userRoutes` checks BOTH.
    
    // So we MUST re-login to get a new token with updated abilities (since authController assigns abilities at login).
    console.log('Logging in as Admin to get new token...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: 'password123' })
    });
    const loginData = await loginRes.json();
    const newAdminToken = loginData.data.token;

    // 6. Try to delete (should succeed now)
    // Note: We need a valid ID to delete. Let's try to delete the first user we created.
    // We need that user's ID.
    const targetUserId = userData.data.user.id;
    console.log(`Admin deleting User ID ${targetUserId}...`);
    
    const adminDeleteRes = await fetch(`${API_URL}/users/${targetUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${newAdminToken}` }
    });
    console.log('Admin Delete Access:', adminDeleteRes.status === 200 ? 'Success (Correct)' : `Failed ${adminDeleteRes.status}`);
    
  } catch (error) {
    console.error('Verification Error:', error);
  }
}

verifyRoles();
