const app = require('./app');
const sequelize = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models with database
    // force: false ensures we don't drop tables on restart
    // alter: true updates tables if models change (use with caution in production)
    // await sequelize.sync({ alter: true }); 
    console.log('Database synced (skipped, using migrations).');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); 
  }
};

startServer();
