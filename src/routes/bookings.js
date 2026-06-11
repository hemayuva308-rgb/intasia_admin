const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { Booking } = require('../models');
const { protect } = require('../middleware/auth');
const { notifyAdmin, replyToUser } = require('../utils/email');

// POST /api/bookings — public
router.post('/', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('service').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const booking = await Booking.create({ ...req.body, ipAddress: req.ip });

    await notifyAdmin({
      subject: `🗓️ New Booking from ${booking.name} — ${booking.service}`,
      html: `
        <h2>New Booking / Enquiry</h2>
        <p><strong>Name:</strong> ${booking.name}</p>
        <p><strong>Email:</strong> ${booking.email}</p>
        <p><strong>Phone:</strong> ${booking.phone || 'N/A'}</p>
        <p><strong>Service:</strong> ${booking.service}</p>
        <p><strong>Plan:</strong> ${booking.plan || 'N/A'}</p>
        <p><strong>Budget:</strong> ${booking.budget || 'N/A'}</p>
        <p><strong>Timeline:</strong> ${booking.timeline || 'N/A'}</p>
        <p><strong>Message:</strong><br>${booking.message || 'N/A'}</p>
        <p><a href="${process.env.FRONTEND_URL}/admin/bookings/${booking._id}">View in Admin Panel →</a></p>
      `,
    }).catch(console.error);

    res.status(201).json({ message: 'Booking received. Our team will contact you within 24 hours.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use(protect);

// GET /api/bookings
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const bookings = await Booking.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit));
    const total = await Booking.countDocuments(filter);
    res.json({ bookings, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/bookings/:id/reply
router.patch('/:id/reply', async (req, res) => {
  try {
    const { replyText } = req.body;
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Not found' });

    await replyToUser({
      to: booking.email,
      subject: `Re: Your enquiry with Intasia`,
      html: `<p>Hi ${booking.name},</p><p>${replyText}</p><br><p>— Intasia Team</p>`,
    });

    booking.status = 'replied';
    booking.adminReply = replyText;
    booking.repliedAt = new Date();
    await booking.save();
    res.json({ message: 'Reply sent', booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/bookings/:id
router.delete('/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
