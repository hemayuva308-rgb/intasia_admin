const router = require('express').Router();
const { Project } = require('../models');
const { protect } = require('../middleware/auth');

// GET /api/projects — public (active only, filterable)
router.get('/', async (req, res) => {
  try {
    const { category, featured, selected } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (selected === 'true') filter.isSelected = true;
    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/projects/:slug — public (must be before protect)
router.get('/:slug', async (req, res) => {
  try {
    if (/^[a-f\d]{24}$/i.test(req.params.slug)) {
      return res.status(404).json({ error: 'Not found' });
    }
    // Don't match 'admin' — that is handled by the protected /admin/all route
    if (req.params.slug === 'admin') {
      return res.status(404).json({ error: 'Not found' });
    }
    const project = await Project.findOne({ slug: req.params.slug });
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Protected routes ───────────────────────────────────────────────────────────
router.use(protect);

// GET /api/projects/admin/all — admin sees ALL projects
router.get('/admin/all', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    const projects = await Project.find(filter).sort({ order: 1, createdAt: -1 });
    res.json(projects);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/projects
router.post('/', async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.slug && body.title) {
      body.slug = body.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-') +
        '-' + Date.now().toString(36);
    }
    const project = await Project.create(body);
    res.status(201).json(project);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
  try {
    const body = { ...req.body };
    if (!body.slug && body.title) {
      body.slug = body.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
    }
    const project = await Project.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
    if (!project) return res.status(404).json({ error: 'Not found' });
    res.json(project);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PATCH /api/projects/:id/toggle — FIX: toggle isActive (was missing)
router.patch('/:id/toggle', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    project.isActive = !project.isActive;
    await project.save();
    res.json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/projects/:id/toggle-featured
router.patch('/:id/toggle-featured', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    project.isFeatured = !project.isFeatured;
    await project.save();
    res.json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/projects/:id/toggle-selected
router.patch('/:id/toggle-selected', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    project.isSelected = !project.isSelected;
    await project.save();
    res.json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
