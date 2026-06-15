require('dotenv').config();
const express = require('express');
const helmet  = require('helmet');
const cors    = require('cors');
const rateLimit = require('express-rate-limit');
const path    = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect Database
connectDB();

// ── Security Middleware ──────────────────────────────────────────────────────

 app.use((req, res, next) => {
  if (req.path.startsWith('/admin')) {
    return helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc:  ["'self'", "'unsafe-inline'", "https://intasia-com.vercel.app"], // Vercel URL சேர்த்தாச்சு
          scriptSrcAttr: ["'unsafe-inline'"],
          styleSrc:   ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
          fontSrc:    ["'self'", "https://fonts.gstatic.com"],
          imgSrc:     ["'self'", "data:", "blob:", "*"],
          connectSrc: ["'self'", "http://127.0.0.1:5000", "https://intasia-com.vercel.app", "https://api.intasia.in"],
        },
      },
    })(req, res, next);
  }
  return helmet({ crossOriginEmbedderPolicy: false })(req, res, next);
});

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://127.0.0.1:5500',           // Local dev — Live Server
  'http://127.0.0.1:5501',           // Live Server alternate port
  'http://localhost:5500',
  'http://localhost:5501',
  'http://localhost:3000',            // React dev server (if any)
  'https://intasia.in',
  'https://www.intasia.in',
  'https://api.intasia.in',
  'https://intasia-com.vercel.app',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));

// ── Rate Limiting ─────────────────────────────────────────────────────────────
// General API limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // FIX: increased from 100 to 300 — admin panel makes many requests per page load
  message: { error: 'Too many requests, please try again later.' },
});
// Auth limiter (login/setup) — keep strict
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many auth attempts, please try again later.' },
});
app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/setup', authLimiter);

// ── Body Parser ───────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Static Files ──────────────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Admin Panel ───────────────────────────────────────────────────────────────
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.get('/admin', (req, res) =>
  res.sendFile(path.join(__dirname, '../admin/index.html'))
);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/contacts',       require('./routes/contacts'));
app.use('/api/bookings',       require('./routes/bookings'));
app.use('/api/services',       require('./routes/services'));
app.use('/api/projects',       require('./routes/projects'));
app.use('/api/testimonials',   require('./routes/testimonials'));
app.use('/api/pricing',        require('./routes/pricing'));
app.use('/api/team',           require('./routes/team'));
app.use('/api/reels',          require('./routes/reels'));
app.use('/api/creative-works', require('./routes/creative-works')); // NEW
app.use('/api/media',          require('./routes/media'));
app.use('/api/settings',       require('./routes/settings'));
app.use('/api/dashboard',      require('./routes/dashboard'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date() })
);

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Intasia backend running on port ${PORT}`));