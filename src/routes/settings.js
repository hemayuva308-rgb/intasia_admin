const router = require('express').Router();
const { Settings, Seo } = require('../models');
const { protect } = require('../middleware/auth');

// All settings routes require admin auth
router.use(protect);

// ── General Settings ──────────────────────────────────────────────────────────

// GET /api/settings — return as flat key-value object (optionally filter by ?group=)
router.get('/', async (req, res) => {
  try {
    const { group } = req.query;
    const filter = group ? { group } : {};
    const settings = await Settings.find(filter);
    const obj = settings.reduce((acc, s) => { acc[s.key] = s.value; return acc; }, {});
    res.json(obj);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/settings — bulk upsert { key: value, ... }
router.put('/', async (req, res) => {
  try {
    const entries = Object.entries(req.body);
    await Promise.all(entries.map(([key, value]) =>
      Settings.findOneAndUpdate({ key }, { key, value }, { upsert: true, new: true })
    ));
    res.json({ message: 'Settings saved' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── SEO Settings ──────────────────────────────────────────────────────────────
// FIX: /seo and /seo/:page must come BEFORE any /:id wildcard (no conflict here
//      since settings has no /:id route, but ordered clearly for maintainability)

// GET /api/settings/seo — all SEO entries
router.get('/seo', async (req, res) => {
  try {
    const seo = await Seo.find();
    res.json(seo);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/settings/seo/:page — upsert SEO for a specific page
router.put('/seo/:page', async (req, res) => {
  try {
    const seo = await Seo.findOneAndUpdate(
      { page: req.params.page },
      { ...req.body, page: req.params.page },
      { upsert: true, new: true }
    );
    res.json(seo);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

module.exports = router;
