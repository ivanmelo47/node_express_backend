const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');
const moduleAlias = require('module-alias');
moduleAlias.addAlias('@', path.join(__dirname, '../../src'));

const API_URL = 'http://localhost:4000/api';
const UPLOAD_DIR = path.join(__dirname, '../../public/uploads/profiles');

async function verifyImageReplacement() {
  try {
    console.log('--- Setting up Admin ---');
    const adminEmail = `admin${Date.now()}@example.com`;
    await axios.post(`${API_URL}/auth/register`, { 
        name: 'Admin Replacer', 
        email: adminEmail, 
        password: 'password123' 
    });
    
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
    const token = loginRes.data.data.token;

    console.log('\n--- Step 1: Upload Initial Image ---');
    const image1Path = path.join(__dirname, 'image1.jpg');
    fs.writeFileSync(image1Path, 'image 1 content');

    const formData1 = new FormData();
    formData1.append('name', 'User With Image 1');
    formData1.append('image', fs.createReadStream(image1Path), { filename: 'image1.jpg', contentType: 'image/jpeg' });

    const res1 = await axios.put(`${API_URL}/users/${adminUser.id}`, formData1, {
        headers: { Authorization: `Bearer ${token}`, ...formData1.getHeaders() }
    });
    
    const image1Filename = res1.data.data.image;
    console.log('Image 1 Filename:', image1Filename);
    
    if (!fs.existsSync(path.join(UPLOAD_DIR, image1Filename))) {
        throw new Error('Image 1 file not found on server!');
    }
    console.log('Image 1 exists on server.');

    console.log('\n--- Step 2: Replace with New Image ---');
    const image2Path = path.join(__dirname, 'image2.jpg');
    fs.writeFileSync(image2Path, 'image 2 content');

    const formData2 = new FormData();
    formData2.append('name', 'User With Image 2');
    formData2.append('image', fs.createReadStream(image2Path), { filename: 'image2.jpg', contentType: 'image/jpeg' });

    const res2 = await axios.put(`${API_URL}/users/${adminUser.id}`, formData2, {
        headers: { Authorization: `Bearer ${token}`, ...formData2.getHeaders() }
    });

    const image2Filename = res2.data.data.image;
    console.log('Image 2 Filename:', image2Filename);

    if (!fs.existsSync(path.join(UPLOAD_DIR, image2Filename))) {
        throw new Error('Image 2 file not found on server!');
    }
    console.log('Image 2 exists on server.');

    if (fs.existsSync(path.join(UPLOAD_DIR, image1Filename))) {
        console.error('FAILURE: Image 1 file still exists!');
    } else {
        console.log('SUCCESS: Image 1 file was deleted.');
    }

    console.log('\n--- Step 3: Update without Image (Preservation) ---');
    const res3 = await axios.put(`${API_URL}/users/${adminUser.id}`, { name: 'User Updated No Image' }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    
    const image3Filename = res3.data.data.image;
    console.log('Image after update (should be same as 2):', image3Filename);

    if (image3Filename === image2Filename && fs.existsSync(path.join(UPLOAD_DIR, image2Filename))) {
        console.log('SUCCESS: Image 2 preserved.');
    } else {
        console.error('FAILURE: Image 2 not preserved correctly.');
    }

    // Cleanup
    if (fs.existsSync(image1Path)) fs.unlinkSync(image1Path);
    if (fs.existsSync(image2Path)) fs.unlinkSync(image2Path);

  } catch (error) {
    console.error('Verification Error:', error.response ? error.response.data : error.message);
  }
}

verifyImageReplacement();
