const API_URL = 'http://localhost:3000/api';

async function testAuth() {
  try {
    // 1. Register
    console.log('Testing Register...');
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123'
      })
    });
    const registerData = await registerRes.json();
    console.log('Register Status:', registerRes.status);
    console.log('Register Response:', registerData);
    
    if (!registerRes.ok) throw new Error('Register failed');
    const token = registerData.data.token;

    // 2. Login
    console.log('\nTesting Login...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: registerData.data.user.email,
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    console.log('Login Status:', loginRes.status);
    console.log('Login Response:', loginData);

    if (!loginRes.ok) throw new Error('Login failed');

    // 3. Access Protected Route (with token)
    console.log('\nTesting Protected Route (with token)...');
    const protectedRes = await fetch(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Protected Route Status:', protectedRes.status);
    console.log('Protected Route Success:', protectedRes.status === 200 ? 'OK' : 'Failed');

    // 4. Access Protected Route (without token)
    console.log('\nTesting Protected Route (without token)...');
    const unauthorizedRes = await fetch(`${API_URL}/users`);
    console.log('Unauthorized Route Status:', unauthorizedRes.status);
    console.log('Protected Route Blocked (Expected):', unauthorizedRes.status === 401 ? 'OK' : 'Failed');

  } catch (error) {
    console.error('Test Failed:', error.message);
  }
}

testAuth();
