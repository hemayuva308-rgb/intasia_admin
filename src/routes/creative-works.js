const router = require('express').Router();
const { CreativeWork } = require('../models');
const { protect } = require('../middleware/auth');

// GET /api/creative-works — public (active only, filterable by category)
router.get('/', async (req, res) => {
  try {
    const { category, featured } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    const works = await CreativeWork.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(works);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Protected routes ───────────────────────────────────────────────────────────
router.use(protect);

// GET /api/creative-works/all — admin (all works)
router.get('/all', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const works = await CreativeWork.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(works);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/creative-works
router.post('/', async (req, res) => {
  try {
    const work = await CreativeWork.create(req.body);
    res.status(201).json(work);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/creative-works/:id
router.put('/:id', async (req, res) => {
  try {
    const work = await CreativeWork.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!work) return res.status(404).json({ error: 'Not found' });
    res.json(work);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PATCH /api/creative-works/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const work = await CreativeWork.findById(req.params.id);
    if (!work) return res.status(404).json({ error: 'Not found' });
    work.isActive = !work.isActive;
    await work.save();
    res.json(work);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/creative-works/:id/toggle-featured
router.patch('/:id/toggle-featured', async (req, res) => {
  try {
    const work = await CreativeWork.findById(req.params.id);
    if (!work) return res.status(404).json({ error: 'Not found' });
    work.isFeatured = !work.isFeatured;
    await work.save();
    res.json(work);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/creative-works/:id
router.delete('/:id', async (req, res) => {
  try {
    await CreativeWork.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
