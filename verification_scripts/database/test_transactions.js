require('module-alias/register');
require('dotenv').config();
const UserService = require('@/services/UserService');
const User = require('@/models/User');
const fs = require('fs');
const path = require('path');
const db = require('@/config/database');

// Setup alias if not working via module-alias/register in standalone script
// If module-alias in package.json maps '@' to 'src', we need to ensure that works.
// Or we can just use relative paths for simplicity in this temp script if alias fails.
// But let's try to assume alias works or register it manually.
const moduleAlias = require('module-alias');
moduleAlias.addAlias('@', path.join(__dirname, '../../src'));

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
    console.log('--- Starting Transaction Tests ---');
    
    // 1. Test Create
    console.log('\n[TEST 1] Create User');
    const timestamp = Date.now();
    const userData = {
        name: `User_${timestamp}`,
        email: `test_${timestamp}@example.com`,
        password: 'password123',
        roleId: 1 // Assuming role 1 exists, otherwise we might need to fetch a role
    };

    let createdUser;
    try {
        createdUser = await UserService.createUser(userData);
        console.log('User created:', createdUser.id);
    } catch (e) {
        console.error('Create failed:', e);
        process.exit(1);
    }

    // 2. Test Update (Success)
    console.log('\n[TEST 2] Update User (Success)');
    try {
        const updated = await UserService.updateUser(createdUser.id, { name: userData.name + '_UPDATED' });
        console.log('User updated name:', updated.name);
        if (updated.name !== userData.name + '_UPDATED') throw new Error('Update mismatch');
    } catch (e) {
        console.error('Update failed:', e);
    }

    // 3. Test Update with Image Rollback (Safety)
    console.log('\n[TEST 3] Update User Rollback (File Safety)');
    // Create another user to force unique constraint violation
    const user2Data = {
        name: `User2_${timestamp}`,
        email: `test2_${timestamp}@example.com`,
        password: 'password123',
        roleId: 1
    };
    await UserService.createUser(user2Data);

    // Create dummy image for our main user
    const dummyImageName = `test_img_${timestamp}.txt`;
    const dummyImagePath = path.join(__dirname, '../../public/uploads/profiles', dummyImageName);
    const uploadsDir = path.dirname(dummyImagePath);
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    fs.writeFileSync(dummyImagePath, 'dummy content');

    // Update main user to point to this image manually first (to simulate existing state)
    // We can't use UserService.updateUser for this safely without triggering the very logic we want to test? 
    // Actually we can, just update image field.
    await User.update({ image: dummyImageName }, { where: { id: createdUser.id } });
    console.log('Prepared user with image:', dummyImageName);

    // Now try to update email to user2's email (will fail) AND provide a NEW image (which would trigger deletion of old one)
    // We want to verify that because DB update fails, the OLD file is NOT deleted.
    const newImageName = `new_img_${timestamp}.txt`; // "uploaded"
    
    try {
        await UserService.updateUser(createdUser.id, {
            email: user2Data.email, // Conflict!
            image: newImageName
        });
        console.error('ERROR: Update should have failed but succeeded!');
    } catch (e) {
        console.log('Update failed as expected:', e.name); // likely SequelizeUniqueConstraintError
    }

    // Check if old file still exists
    if (fs.existsSync(dummyImagePath)) {
        console.log('SUCCESS: Old image still exists (Rollback worked, file not deleted).');
        fs.unlinkSync(dummyImagePath); // Cleanup
    } else {
        console.error('FAILURE: Old image was deleted despite DB error!');
    }

    // 4. Test Delete
    console.log('\n[TEST 4] Delete User');
    try {
        const result = await UserService.deleteUser(createdUser.id);
        console.log('Delete result:', result);
        const check = await UserService.getUserById(createdUser.id);
        if (check) throw new Error('User still exists');
    } catch (e) {
        console.error('Delete failed:', e);
    }

    console.log('--- Tests Completed ---');
    process.exit(0);
}

runTests();
