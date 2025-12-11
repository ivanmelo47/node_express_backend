import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import hpp from 'hpp';
import { globalLimiter } from './middlewares/rateLimiter';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import errorHandler from './handlers/errorHandler';
// @ts-ignore
import responseMiddleware from './middlewares/responseMiddleware';
import path from 'path';

const app = express();

// Trust Proxy (Required for Rate Limiting behind proxies/load balancers)
app.set('trust proxy', 1);

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// Rate Limiting
app.use('/api', globalLimiter);

// Body Parser
app.use(express.json()); // Limit body size if needed: express.json({ limit: '10kb' })
app.use(express.urlencoded({ extended: true }));

// Security: Prevent Parameter Pollution
app.use(hpp());

app.use(responseMiddleware);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the API Mijo' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error Handler
app.use(errorHandler);

export default app;
