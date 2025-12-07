const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const hpp = require('hpp');
const { globalLimiter } = require('./middlewares/rateLimiter');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./handlers/errorHandler');
const responseMiddleware = require('./middlewares/responseMiddleware');
const path = require('path');

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
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API Mijo' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Error Handler
app.use(errorHandler);

module.exports = app;
