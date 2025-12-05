const { Sequelize } = require('sequelize');
const config = require('./src/config/config.js')['development'];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: false
  }
);

async function verifyUsers() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    const users = await sequelize.query(
      'SELECT u.name, u.email, r.name as roleName FROM Users u JOIN Roles r ON u.roleId = r.id',
      { type: Sequelize.QueryTypes.SELECT }
    );

    console.log('Users found:', users);
    
    if (users.length >= 2) {
      console.log('Verification SUCCESS: Users found.');
    } else {
      console.log('Verification FAILED: Users not found.');
    }

  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

verifyUsers();
