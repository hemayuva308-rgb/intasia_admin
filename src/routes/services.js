const router = require('express').Router();
const { Service } = require('../models');
const { protect } = require('../middleware/auth');

/* ── Slug helper ── */
function makeSlug(title, suffix = '') {
  const base = title.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return suffix ? `${base}-${suffix}` : base;
}

// ── Public routes ──────────────────────────────────────────────────────────────

// GET /api/services — public (active only)
router.get('/', async (req, res) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ order: 1 });
    res.json(services);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/services/:slug — public (must be before protect)
router.get('/:slug', async (req, res) => {
  try {
    // Don't match MongoDB ObjectId-looking strings — those are admin /:id calls
    if (/^[a-f\d]{24}$/i.test(req.params.slug)) {
      return res.status(404).json({ error: 'Not found' });
    }
    // Don't match the admin sub-path
    if (req.params.slug === 'admin') {
      return res.status(404).json({ error: 'Not found' });
    }
    const service = await Service.findOne({ slug: req.params.slug });
    if (!service) return res.status(404).json({ error: 'Not found' });
    res.json(service);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Protected routes ───────────────────────────────────────────────────────────
router.use(protect);

// GET /api/services/admin/all — admin sees ALL services (active + inactive)
router.get('/admin/all', async (req, res) => {
  try {
    const services = await Service.find().sort({ order: 1 });
    res.json(services);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/services — auto-generate slug with timestamp suffix to avoid collisions
router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    // Auto-generate slug from title if empty; add timestamp suffix to guarantee uniqueness
    if (!body.slug && body.title) {
      body.slug = makeSlug(body.title, Date.now().toString(36));
    }
    const service = await Service.create(body);
    res.status(201).json(service);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/services/:id
router.put('/:id', async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.slug && body.title) {
      body.slug = makeSlug(body.title);
    }
    const service = await Service.findByIdAndUpdate(
      req.params.id, body, { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ error: 'Not found' });
    res.json(service);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PATCH /api/services/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ error: 'Not found' });
    service.isActive = !service.isActive;
    await service.save();
    res.json(service);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/services/:id
router.delete('/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
