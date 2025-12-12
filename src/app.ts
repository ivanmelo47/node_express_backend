import express, { Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import hpp from "hpp";
import { globalLimiter } from "./common/middlewares/rateLimiter";
import authRoutes from "./modules/auth/routes/authRoutes";
import userRoutes from "./modules/users/routes/userRoutes";
import errorHandler from "./common/handlers/errorHandler";
// @ts-ignore
import responseMiddleware from "./common/middlewares/responseMiddleware";
import { ipWhitelist } from "./common/middlewares/ipWhitelist";
import path from "path";

const app = express();

// Trust Proxy (Required for Rate Limiting behind proxies/load balancers)
app.set("trust proxy", 1);

// Middlewares
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4000",
  "https://ivanmelo.com",
];
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

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Welcome to the API Mijo" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Error Handler
app.use(errorHandler);

export default app;
