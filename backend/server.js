const express      = require('express');
const dotenv       = require('dotenv');
const cors         = require('cors');
const helmet       = require('helmet');
const rateLimit    = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

app.set('trust proxy', 1);

// ── Security middleware ────────────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
// app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiter: 100 requests per 15 minutes per IP
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests, slow down.' });
app.use('/api/', limiter);

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/products',    require('./routes/productRoutes'));
app.use('/api/users',       require('./routes/userRoutes'));
app.use('/api/settings',    require('./routes/settingsRoutes'));
app.use('/api/audit',       require('./routes/auditRoutes'));
app.use('/api/superadmin',  require('./routes/superAdminRoutes'));

app.get('/', (req, res) => res.json({ message: '🚀 StockIQ Cloud API v2.0' }));

// ── Central error handler ─────────────────────────────────────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
