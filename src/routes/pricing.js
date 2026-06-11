const router = require('express').Router();
const { PricingPlan } = require('../models');
const { protect } = require('../middleware/auth');

// ── Public routes ──────────────────────────────────────────────────────────────

// GET /api/pricing — public (filter by ?cycle=monthly|yearly)
router.get('/', async (req, res) => {
  try {
    const { cycle } = req.query;
    const filter = { isActive: true };
    if (cycle) filter.billingCycle = cycle;
    const plans = await PricingPlan.find(filter).sort({ order: 1 });
    res.json(plans);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Protected routes ───────────────────────────────────────────────────────────
router.use(protect);

// GET /api/pricing/all — admin (all plans, both cycles)
// IMPORTANT: this must be declared before /:id so Express doesn't treat "all" as an id
router.get('/all', async (req, res) => {
  try {
    const plans = await PricingPlan.find().sort({ billingCycle: 1, order: 1 });
    res.json(plans);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/pricing
router.post('/', async (req, res) => {
  try {
    const plan = await PricingPlan.create(req.body);
    res.status(201).json(plan);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/pricing/:id
router.put('/:id', async (req, res) => {
  try {
    const plan = await PricingPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!plan) return res.status(404).json({ error: 'Not found' });
    res.json(plan);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// DELETE /api/pricing/:id
router.delete('/:id', async (req, res) => {
  try {
    await PricingPlan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
