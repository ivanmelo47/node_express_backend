const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
// require('module-alias/register'); // Might fail in subfolder if package.json not found?
const moduleAlias = require('module-alias');
moduleAlias.addAlias('@', path.join(__dirname, '../../src'));

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
    if (adminUser) {
        if (adminRole) adminUser.roleId = adminRole.id;
        adminUser.confirmed = true;
        adminUser.status = true; // Ensure active status
        await adminUser.save();
    }
    
    // Re-login
    const loginRes = await axios.post(`${API_URL}/auth/login`, { 
        email: adminEmail, 
        password: 'password123' 
    });
    const newAdminToken = loginRes.data.data.token;

    const sharp = require('sharp');
    console.log('\n--- Uploading Image ---');
    const imagePath = path.join(__dirname, 'test_image.jpg');
    
    // Create valid 1x1 pixel image
    await sharp({
        create: { width: 1, height: 1, channels: 4, background: { r: 255, g: 0, b: 0, alpha: 1 } }
    })
    .jpeg()
    .toFile(imagePath);

    const formData = new FormData();
    formData.append('name', 'Updated Name');
    formData.append('image', fs.createReadStream(imagePath), {
        filename: 'test_image.jpg',
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
