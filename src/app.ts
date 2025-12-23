import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import hpp from "hpp";
import cookieParser from 'cookie-parser';
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger";

import { globalLimiter } from "./common/middlewares/rateLimiter";
import authRoutes from "./modules/auth/routes/authRoutes";
import userRoutes from "./modules/users/routes/userRoutes";
import systemRoutes from "./modules/system/routes/systemRoutes";
import errorHandler from "./common/handlers/errorHandler";
// @ts-ignore
import responseMiddleware from "./common/middlewares/responseMiddleware";
import { ipWhitelist } from "./common/middlewares/ipWhitelist";

const app = express();

// Trust Proxy (Required for Rate Limiting behind proxies/load balancers)
app.set("trust proxy", 1);

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(",")
  : ["http://localhost:3000", "http://localhost:4000", "https://ivanmelo.com"];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
  })
);

// IP Whitelisting (Optional: Uncomment to enforce globally)
// app.use(ipWhitelist);
// Note: Activating this locally might block you if your IP isn't in the list (e.g. using local network IP).
// We'll leave it imported but commented out or apply it to specific critical routes if preferred,
// OR we can activate it but ensure we add current IP.
// For now, let's activate it but make sure '::1' and '127.0.0.1' are there (which they are).
app.use(ipWhitelist);

import fs from 'fs';

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Log to file
const accessLogStream = fs.createWriteStream(path.join(logsDir, 'system.log'), { flags: 'a' });

app.use(morgan("combined", { stream: accessLogStream }));
app.use(morgan("dev"));

// Rate Limiting
app.use("/api", globalLimiter);

// Body Parser
app.use(express.json()); // Limit body size if needed: express.json({ limit: '10kb' })
app.use(express.urlencoded({ extended: true }));

// Security: Prevent Parameter Pollution
app.use(hpp());

app.use(responseMiddleware);

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));
app.use("/public", express.static(path.join(__dirname, "../public")));

// Serve Module Public Assets
// in dist/app.js, __dirname is dist/. in src/app.ts, __dirname is src/.
// The structure modules/system/public is preserved in both.
app.use("/public/modules/system", express.static(path.join(__dirname, "modules/system/public")));
app.use("/public/modules/reports", express.static(path.join(__dirname, "modules/reports/public")));

// Swagger UI (Documentation) - Only in Development
if (process.env.NODE_ENV === "development") {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log("Swagger UI available at http://localhost:4000/docs");
}

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the API Mijo" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/system", systemRoutes);
import reportsRoutes from "./modules/reports/routes/reportsRoutes";
app.use("/api/reports", reportsRoutes);

// Error Handler
app.use(errorHandler);

export default app;
