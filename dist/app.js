"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const hpp_1 = __importDefault(require("hpp"));
const rateLimiter_1 = require("./common/middlewares/rateLimiter");
const authRoutes_1 = __importDefault(require("./modules/auth/routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./modules/users/routes/userRoutes"));
const errorHandler_1 = __importDefault(require("./common/handlers/errorHandler"));
// @ts-ignore
const responseMiddleware_1 = __importDefault(require("./common/middlewares/responseMiddleware"));
const ipWhitelist_1 = require("./common/middlewares/ipWhitelist");
const path_1 = __importDefault(require("path"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = __importDefault(require("./config/swagger"));
const app = (0, express_1.default)();
// Trust Proxy (Required for Rate Limiting behind proxies/load balancers)
app.set("trust proxy", 1);
// Middlewares
app.use((0, helmet_1.default)());
// CORS Configuration
const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:4000",
    "https://ivanmelo.com",
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = "The CORS policy for this site does not allow access from the specified Origin.";
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
}));
// IP Whitelisting (Optional: Uncomment to enforce globally)
// app.use(ipWhitelist);
// Note: Activating this locally might block you if your IP isn't in the list (e.g. using local network IP).
// We'll leave it imported but commented out or apply it to specific critical routes if preferred,
// OR we can activate it but ensure we add current IP.
// For now, let's activate it but make sure '::1' and '127.0.0.1' are there (which they are).
app.use(ipWhitelist_1.ipWhitelist);
app.use((0, morgan_1.default)("dev"));
// Rate Limiting
app.use("/api", rateLimiter_1.globalLimiter);
// Body Parser
app.use(express_1.default.json()); // Limit body size if needed: express.json({ limit: '10kb' })
app.use(express_1.default.urlencoded({ extended: true }));
// Security: Prevent Parameter Pollution
app.use((0, hpp_1.default)());
app.use(responseMiddleware_1.default);
// Serve static files
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../public/uploads")));
// Swagger UI (Documentation) - Only in Development
if (process.env.NODE_ENV === "development") {
    app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.default));
    console.log("Swagger UI available at http://localhost:4000/docs");
}
// Routes
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the API Mijo" });
});
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
// Error Handler
app.use(errorHandler_1.default);
exports.default = app;
