const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Admin } = require('../models');
const { protect } = require('../middleware/auth');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

// POST /api/auth/login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    admin.lastLogin = new Date();
    await admin.save({ validateBeforeSave: false });
    const token = signToken(admin._id);
    res.json({ token, admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auth/me — protected
router.get('/me', protect, (req, res) => res.json(req.admin));

// POST /api/auth/change-password — protected
router.post('/change-password', protect, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const admin = await Admin.findById(req.admin._id).select('+password');
    if (!(await bcrypt.compare(req.body.currentPassword, admin.password))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    admin.password = await bcrypt.hash(req.body.newPassword, 12);
    await admin.save({ validateBeforeSave: false });
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/setup — create first admin (only if no admins exist)
router.post('/setup', async (req, res) => {
  try {
    const count = await Admin.countDocuments();
    if (count > 0) return res.status(403).json({ error: 'Setup already completed' });
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 12);
    const admin = await Admin.create({ name, email, password: hashed, role: 'superadmin' });
    const token = signToken(admin._id);
    res.status(201).json({ token, admin: { id: admin._id, name: admin.name, email: admin.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
