const router = require('express').Router();
const path   = require('path');
const fs     = require('fs');
const { Media } = require('../models');
const { protect } = require('../middleware/auth');
const upload = require('../utils/upload');

// All media routes require admin auth
router.use(protect);

// GET /api/media — list media (filter by ?folder=, paginated)
router.get('/', async (req, res) => {
  try {
    const { folder, page = 1, limit = 30 } = req.query;
    const filter = folder ? { folder } : {};
    const media = await Media.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('uploadedBy', 'name');
    const total = await Media.countDocuments(filter);
    res.json({ media, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/media/upload — upload up to 10 files
// Pass ?folder=<name> to control the destination sub-folder (defaults to 'general')
router.post('/upload', upload.array('files', 10), async (req, res) => {
  try {
    const folder = req.query.folder || 'general';
    const saved = await Promise.all(req.files.map(file =>
      Media.create({
        filename:     file.filename,
        originalName: file.originalname,
        url:          `/uploads/${folder}/${file.filename}`,
        mimetype:     file.mimetype,
        size:         file.size,
        folder,
        uploadedBy:   req.admin._id,
      })
    ));
    res.status(201).json(saved);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// DELETE /api/media/:id
router.delete('/:id', async (req, res) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) return res.status(404).json({ error: 'Not found' });

    // Remove file from disk
    const filePath = path.join(__dirname, '../../', media.url);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await media.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
