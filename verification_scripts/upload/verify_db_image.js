require('module-alias/register');
require('dotenv').config();
const UserService = require('@/services/UserService');
const ImageService = require('@/services/ImageService');
const User = require('@/models/User');
const path = require('path');
const sharp = require('sharp');
const db = require('@/config/database');

const moduleAlias = require('module-alias');
// Since this is in a subdirectory, pointing @ to ../../src
moduleAlias.addAlias('@', path.join(__dirname, '../../src'));

async function verifyDbColumn() {
    console.log('--- Verifying DB Image Column Format ---');
    const uploadPath = path.join(__dirname, '../../public/uploads/profiles');

    // 1. Create dummy buffer
    const buffer = await sharp({
        create: { width: 10, height: 10, channels: 4, background: {r:0,g:0,b:0,alpha:0} }
    }).png().toBuffer();

    // 2. Process image manually to simulate controller
    const baseName = 'db_verify_' + Date.now();
    const result = await ImageService.processProfileImage(buffer, uploadPath, baseName);
    
    // 3. Create User with this baseName (simulating controller logic)
    // In controller: updateData.image = imageResult.baseName;
    const userData = {
        name: 'DbVerifyUser',
        email: `dbtest_${Date.now()}@example.com`,
        password: '123',
        image: result.baseName // This is what gets passed to User.create/update
    };

    const user = await UserService.createUser(userData);
    
    // 4. Fetch raw from DB to be checking strictly
    const rawUser = await User.findByPk(user.id);
    
    console.log(`\n[CHECK] Image field in DB: '${rawUser.image}'`);
    
    const hasExtension = rawUser.image.includes('.');
    if (!hasExtension && rawUser.image === result.baseName) {
        console.log('SUCCESS: DB stored ONLY the filename (no extension).');
    } else {
        console.error(`FAILURE: DB stored '${rawUser.image}' which seems incorrect.`);
    }

    // Cleanup
    await UserService.deleteUser(user.id);
    process.exit(0);
}

verifyDbColumn();
