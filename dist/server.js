"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("module-alias/register");
const dotenv_1 = __importDefault(require("dotenv"));
const module_alias_1 = __importDefault(require("module-alias"));
const path_1 = __importDefault(require("path"));
// Alias is registered via module-alias/register for normal execution, 
// but we might want to register it explicitly if paths are complex.
// For now, depending on tsconfig-paths for dev.
module_alias_1.default.addAlias('@', path_1.default.join(__dirname));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const database_1 = __importDefault(require("./config/database"));
const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        await database_1.default.authenticate();
        console.log('Database connection established successfully.');
        // Sync models with database
        // force: false ensures we don't drop tables on restart
        // alter: true updates tables if models change (use with caution in production)
        // await sequelize.sync({ alter: true }); 
        console.log('Database synced (skipped, using migrations).');
        app_1.default.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};
startServer();
