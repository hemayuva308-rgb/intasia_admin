const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const { Contact } = require('../models');
const { protect } = require('../middleware/auth');
const { notifyAdmin, replyToUser } = require('../utils/email');

// POST /api/contacts  — public (form submission)
router.post('/', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('message').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const contact = await Contact.create({
      ...req.body,
      ipAddress: req.ip,
    });

    // Notify admin by email
    await notifyAdmin({
      subject: `📩 New Contact from ${contact.name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contact.name}</p>
        <p><strong>Email:</strong> ${contact.email}</p>
        <p><strong>Phone:</strong> ${contact.phone || 'N/A'}</p>
        <p><strong>Message:</strong><br>${contact.message}</p>
        <p><a href="${process.env.FRONTEND_URL}/admin/contacts/${contact._id}">View in Admin Panel →</a></p>
      `,
    }).catch(console.error);

    res.status(201).json({ message: 'Message received. We will get back to you soon.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// All routes below require admin auth
router.use(protect);

// GET /api/contacts
router.get('/', async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Contact.countDocuments(filter);
    res.json({ contacts, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/contacts/:id
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Not found' });
    if (contact.status === 'unread') await Contact.findByIdAndUpdate(req.params.id, { status: 'read' });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/contacts/:id/reply
router.patch('/:id/reply', async (req, res) => {
  try {
    const { replyText } = req.body;
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ error: 'Not found' });

    await replyToUser({
      to: contact.email,
      subject: `Re: Your message to Intasia`,
      html: `<p>Hi ${contact.name},</p><p>${replyText}</p><br><p>— Intasia Team</p>`,
    });

    contact.status = 'replied';
    contact.adminReply = replyText;
    contact.repliedAt = new Date();
    await contact.save();
    res.json({ message: 'Reply sent', contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/contacts/:id/mark-read
router.patch('/:id/mark-read', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { status: 'read' }, { new: true });
    res.json(contact);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/contacts/:id
router.delete('/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
