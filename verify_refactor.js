const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
require('module-alias/register');

const API_URL = 'http://localhost:4000/api';

async function verifyImageUpload() {
  try {
    console.log('--- Setting up Admin ---');
    const adminEmail = `admin${Date.now()}@example.com`;
    const adminRes = await axios.post(`${API_URL}/auth/register`, { 
        name: 'Admin Uploader', 
        email: adminEmail, 
        password: 'password123' 
    });
    const adminToken = adminRes.data.data.token;
    
    // Promote to admin
    const Role = require('@/models/Role');
    const User = require('@/models/User');
    const adminRole = await Role.findOne({ where: { name: 'admin' } });
    const adminUser = await User.findOne({ where: { email: adminEmail } });
    if (adminUser && adminRole) {
        adminUser.roleId = adminRole.id;
        await adminUser.save();
    }
    
    // Re-login
    const loginRes = await axios.post(`${API_URL}/auth/login`, { 
        email: adminEmail, 
        password: 'password123' 
    });
    const newAdminToken = loginRes.data.data.token;

    console.log('\n--- Uploading Image ---');
    const imagePath = path.join(__dirname, 'test_image_refactor.jpg');
    fs.writeFileSync(imagePath, 'dummy image content refactor');

    const formData = new FormData();
    formData.append('name', 'Updated Name Refactor');
    formData.append('image', fs.createReadStream(imagePath), {
        filename: 'test_image_refactor.jpg',
        contentType: 'image/jpeg',
    });

    try {
        const updateRes = await axios.put(`${API_URL}/users/${adminUser.id}`, formData, {
            headers: {
                Authorization: `Bearer ${newAdminToken}`,
                ...formData.getHeaders()
            }
        });

        console.log('Update Status:', updateRes.status);
        console.log('Update Response:', JSON.stringify(updateRes.data, null, 2));

        const userImage = updateRes.data.data.image;
        console.log('User Image:', userImage);

        if (userImage) {
            console.log('Verification PASSED: Image uploaded.');
        } else {
            console.log('Verification FAILED: Image field missing.');
        }

    } catch (error) {
        console.error('Update Request Failed:', error.response ? error.response.data : error.message);
    }

    // Cleanup
    if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);

  } catch (error) {
    console.error('Verification Error:', error);
  }
}

verifyImageUpload();
