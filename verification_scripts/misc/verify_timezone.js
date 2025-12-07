const sequelize = require('../../src/config/database');
const moment = require('moment-timezone');
require('dotenv').config();

async function test() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const results = await sequelize.query("SELECT @@session.time_zone as session_timezone, @@global.time_zone as global_timezone, NOW() as now, UTC_TIMESTAMP() as utc", {
            type: sequelize.QueryTypes.SELECT
        });
        const dbTime = results[0];
        console.log('Database Session Info:', dbTime);

        const appTimezone = process.env.APP_TIMEZONE;
        const offset = moment.tz(appTimezone).format('Z');
        console.log(`App Timezone: ${appTimezone}`);
        console.log(`Expected Offset: ${offset}`);

        console.log('--- Verification ---');
        console.log(`Session Timezone in DB: ${dbTime.session_timezone}`);
        
        if (dbTime.session_timezone === offset) {
            console.log('SUCCESS: Database session timezone matches expected offset.');
        } else {
             // Sometimes it might be SYSTEM or named, but let's see. 
             // If we passed offset, it should likely be the offset.
             console.log('WARNING: Database session timezone might not match exactly if it is using named timezone or SYSTEM.');
        }

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

test();
