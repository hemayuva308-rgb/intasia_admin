const router = require('express').Router();
const { Reel } = require('../models');
const { protect } = require('../middleware/auth');
const upload = require('../utils/upload');

const setReelFolder = (req, res, next) => {
  req._uploadFolder = 'reels';
  next();
};

// GET /api/reels — public
router.get('/', async (req, res) => {
  try {
    const reels = await Reel.find({ isActive: true }).sort({ order: 1 });
    res.json(reels);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.use(protect);

// GET /api/reels/all — admin
router.get('/all', async (req, res) => {
  try {
    const reels = await Reel.find().sort({ order: 1 });
    res.json(reels);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/reels
// FIX: support BOTH JSON (videoUrl string) AND multipart file upload
// Admin sends JSON with videoUrl → use express.json parsed body directly
// If file is uploaded → use multer
router.post('/', (req, res, next) => {
  const ct = req.headers['content-type'] || '';
  if (ct.includes('multipart/form-data')) {
    // File upload path — run multer
    setReelFolder(req, res, () => upload.single('video')(req, res, next));
  } else {
    // JSON path — body already parsed by express.json, skip multer
    next();
  }
}, async (req, res) => {
  try {
    const videoUrl = req.file
      ? `/uploads/reels/${req.file.filename}`
      : req.body.videoUrl;

    if (!videoUrl) return res.status(400).json({ error: 'videoUrl is required' });

    const reel = await Reel.create({
      title:     req.body.title || '',
      videoUrl,
      thumbnail: req.body.thumbnail || '',
      order:     Number(req.body.order) || 0,
    });
    res.status(201).json(reel);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// PATCH /api/reels/:id/toggle
router.patch('/:id/toggle', async (req, res) => {
  try {
    const reel = await Reel.findById(req.params.id);
    if (!reel) return res.status(404).json({ error: 'Not found' });
    reel.isActive = !reel.isActive;
    await reel.save();
    res.json(reel);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/reels/:id/reorder
router.patch('/:id/reorder', async (req, res) => {
  try {
    const reel = await Reel.findByIdAndUpdate(
      req.params.id, { order: req.body.order }, { new: true }
    );
    res.json(reel);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/reels/:id
router.delete('/:id', async (req, res) => {
  try {
    await Reel.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
