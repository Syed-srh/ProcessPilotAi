import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes';
import healthRoutes from './routes/healthRoutes';
import workflowRoutes from './routes/workflowRoutes';
import approvalRoutes from './routes/approvalRoutes';
import notificationRoutes from './routes/notificationRoutes';
import executionRoutes from './routes/executionRoutes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

const app = express();

// Security headers
app.use(helmet());

// CORS config
const clientUrlSetting = env.CLIENT_URL || '*';
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        clientUrlSetting === '*' ||
        clientUrlSetting.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost')
      ) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      message: 'Too many auth attempts from this IP, please try again later.',
      statusCode: 429,
    },
  },
});

// Root welcome route
app.get('/', (req, res) => {
  res.json({
    name: 'ProcessPilot AI Backend API',
    status: 'online',
    health: '/api/health',
    message: 'ProcessPilot AI API engine active. Access the user interface via your Vercel frontend URL.',
  });
});

// Routes
app.use('/api', healthRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/approvals', approvalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/executions', executionRoutes);

// Central error handler
app.use(errorHandler);

export default app;
