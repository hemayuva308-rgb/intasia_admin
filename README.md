# Intasia Backend — Fixed & Production-Ready

## What was fixed

| # | File | Issue | Fix |
|---|------|-------|-----|
| 1 | `.env` | Gmail App Password had spaces (`wbpj gdes hcxo nbwo`) — nodemailer rejects spaces in SMTP passwords | Removed spaces → `wbpjgdeshcxonbwo` |
| 2 | `.env` | `FRONTEND_URL=http://localhost:3000` in production config | Set to `https://intasia.in` |
| 3 | `src/server.js` | CORS only allowed `process.env.FRONTEND_URL` + hardcoded localhost origins — production domain `intasia.in` and `www.intasia.in` were missing | Added all production + development origins with a dynamic callback |
| 4 | `src/utils/upload.js` | `destination` only read `req.query.folder` — reels route never set this query param so videos landed in `uploads/general/` not `uploads/reels/` | Added `req._uploadFolder` check (set by route middleware) as first priority |
| 5 | `src/routes/reels.js` | `POST /api/reels` called `upload.single('video')` without setting `folder=reels` anywhere → wrong upload path | Added `setReelFolder` middleware that sets `req._uploadFolder = 'reels'` before multer runs |
| 6 | `src/routes/pricing.js` | `GET /all` was declared **after** `router.use(protect)` — a public `GET /all` call would hit the protect middleware and 401. Also potential ambiguity with `/:id` | Confirmed `/all` is after `protect` (it's admin-only, correct), added ordering comment |
| 7 | `src/routes/services.js` | `GET /:slug` was declared after `router.use(protect)` meaning the public slug lookup required auth | Moved `GET /:slug` before `router.use(protect)` |
| 8 | `src/utils/seed.js` | Only 5 services seeded; frontend has **14** services. Slugs didn't match the `*-projects.html` filenames. Admin password was weak (`Admin@123`) | Seeded all 14 services with slugs matching frontend HTML pages; admin password updated to `Intasia@Admin2026` |
| 9 | `src/routes/reels.js` | No toggle (isActive) route existed | Added `PATCH /:id/toggle` |

---

## Directory structure

```
intasia-fixed/
├── .env                          ← ✅ Fixed SMTP + CORS URL
├── package.json
├── admin/
│   ├── index.html
│   └── admin.js
└── src/
    ├── server.js                 ← ✅ Fixed CORS
    ├── config/
    │   └── db.js
    ├── middleware/
    │   └── auth.js
    ├── models/
    │   └── index.js
    ├── routes/
    │   ├── auth.js
    │   ├── bookings.js
    │   ├── contacts.js
    │   ├── dashboard.js
    │   ├── media.js              ← ✅ Minor cleanup
    │   ├── pricing.js            ← ✅ Route order fixed
    │   ├── projects.js
    │   ├── reels.js              ← ✅ Upload folder + toggle route
    │   ├── services.js           ← ✅ Public slug route fixed
    │   ├── settings.js           ← ✅ SEO route ordering clarified
    │   ├── team.js
    │   └── testimonials.js
    └── utils/
        ├── email.js
        ├── seed.js               ← ✅ All 14 services + new admin password
        └── upload.js             ← ✅ req._uploadFolder support
```

---

## Service slugs (14 total)

| Frontend service name   | Slug               | Projects page                        |
|-------------------------|--------------------|--------------------------------------|
| SEO • AEO • GEO         | `seo-aeo-geo`      | seo-projects.html                    |
| AI Automations          | `ai-automation`    | ai-automation-projects.html          |
| Digital Marketing       | `digital-marketing`| digital-marketing-projects.html      |
| Content Optimization    | `content-optimization` | content-optimization-projects.html |
| Brand Growth Strategy   | `brand-strategy`   | brand-strategy-projects.html         |
| Brand Storytelling      | `brand-storytelling` | brand-storytelling-projects.html   |
| Social Media Marketing  | `social-media`     | social-media-projects.html           |
| Video Editing           | `video-editing`    | video-editing-projects.html          |
| Logo & Poster Design    | `design`           | design-projects.html                 |
| Email Marketing         | `email-marketing`  | email-marketing-projects.html        |
| Portfolio Website       | `portfolio-website`| portfolio-website-projects.html      |
| Premium Website         | `premium-website`  | premium-website-projects.html        |
| E-Commerce Website      | `ecommerce`        | ecommerce-projects.html              |
| Collaborative Calls     | `consulting`       | consulting-projects.html             |

---

## Deployment steps

### 1. Install dependencies
```bash
npm install
```

### 2. Configure `.env`
Edit `.env` and verify:
- `MONGO_URI` points to your MongoDB instance
- `EMAIL_PASS` is your Gmail App Password (no spaces)
- `FRONTEND_URL` is your production domain

> **Gmail App Password**: Google Account → Security → 2-Step Verification → App passwords → Generate for "Mail"

### 3. Seed the database
```bash
npm run seed
```
Admin credentials after seed:
- **Email**: `admin@intasia.in`
- **Password**: `Intasia@Admin2026`

### 4. Start the server
```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

### 5. Admin panel
Visit: `http://your-server:5000/admin`

---

## Frontend `script.js` note

The frontend `API_BASE` automatically switches between local and production:
```js
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5000'
  : 'https://api.intasia.in';   // ← must match your deployed backend domain
```
Make sure your backend is deployed at `api.intasia.in` **or** update this line in `script.js` to match your actual backend URL.

---

## API quick reference

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/login` | ✗ | Admin login |
| GET | `/api/auth/me` | ✓ | Current admin info |
| GET | `/api/services` | ✗ | All active services |
| GET | `/api/services/:slug` | ✗ | Single service by slug |
| GET | `/api/projects?category=&featured=true` | ✗ | Projects (filterable) |
| GET | `/api/pricing?cycle=monthly` | ✗ | Pricing plans |
| GET | `/api/team` | ✗ | Team members |
| GET | `/api/testimonials` | ✗ | Testimonials |
| GET | `/api/reels` | ✗ | Active reels |
| POST | `/api/contacts` | ✗ | Submit contact form |
| POST | `/api/bookings` | ✗ | Submit booking |
| GET | `/api/dashboard/stats` | ✓ | Dashboard stats |
| GET | `/api/dashboard/recent` | ✓ | Recent contacts & bookings |
| POST | `/api/media/upload?folder=reels` | ✓ | Upload files |
| GET | `/api/health` | ✗ | Health check |
