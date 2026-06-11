const router = require('express').Router();
const { Testimonial } = require('../models');
const { protect } = require('../middleware/auth');

// GET /api/testimonials — public (active only)
router.get('/', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ isActive: true }).sort({ order: 1 });
    res.json(testimonials);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Protected routes ───────────────────────────────────────────────────────────
router.use(protect);

// GET /api/testimonials/all — admin (all, including inactive)
router.get('/all', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ order: 1 });
    res.json(testimonials);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/testimonials
router.post('/', async (req, res) => {
  try {
    const t = await Testimonial.create(req.body);
    res.status(201).json(t);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/testimonials/:id
router.put('/:id', async (req, res) => {
  try {
    const t = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ error: 'Not found' });
    res.json(t);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PATCH /api/testimonials/:id/toggle — FIX: was missing entirely
router.patch('/:id/toggle', async (req, res) => {
  try {
    const t = await Testimonial.findById(req.params.id);
    if (!t) return res.status(404).json({ error: 'Not found' });
    t.isActive = !t.isActive;
    await t.save();
    res.json(t);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/testimonials/:id
router.delete('/:id', async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
