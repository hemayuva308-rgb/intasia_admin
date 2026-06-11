const router = require('express').Router();
const { TeamMember } = require('../models');
const { protect } = require('../middleware/auth');

// GET /api/team — public (active only)
router.get('/', async (req, res) => {
  try {
    const members = await TeamMember.find({ isActive: true }).sort({ order: 1 });
    res.json(members);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Protected routes ───────────────────────────────────────────────────────────
router.use(protect);

// GET /api/team/all — admin (all members)
router.get('/all', async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ order: 1 });
    res.json(members);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/team
router.post('/', async (req, res) => {
  try {
    const member = await TeamMember.create(req.body);
    res.status(201).json(member);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/team/:id
router.put('/:id', async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!member) return res.status(404).json({ error: 'Not found' });
    res.json(member);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PATCH /api/team/:id/toggle — FIX: was missing entirely
router.patch('/:id/toggle', async (req, res) => {
  try {
    const member = await TeamMember.findById(req.params.id);
    if (!member) return res.status(404).json({ error: 'Not found' });
    member.isActive = !member.isActive;
    await member.save();
    res.json(member);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/team/:id
router.delete('/:id', async (req, res) => {
  try {
    await TeamMember.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
