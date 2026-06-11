const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { Contact, Booking, Project, Service, Testimonial } = require('../models');

router.use(protect);

// GET /api/dashboard/stats
router.get('/stats', async (req, res) => {
  try {
    const [
      totalContacts,
      unreadContacts,
      totalBookings,
      pendingBookings,
      totalProjects,
      totalServices,
      totalTestimonials,
    ] = await Promise.all([
      Contact.countDocuments(),
      Contact.countDocuments({ status: 'unread' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Project.countDocuments({ isActive: true }),
      Service.countDocuments({ isActive: true }),
      Testimonial.countDocuments({ isActive: true }),
    ]);

    res.json({
      totalContacts,
      unreadContacts,
      totalBookings,
      pendingBookings,
      totalProjects,
      totalServices,
      totalTestimonials,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/dashboard/recent
router.get('/recent', async (req, res) => {
  try {
    const [recentContacts, recentBookings] = await Promise.all([
      Contact.find().sort({ createdAt: -1 }).limit(5).select('name email status createdAt'),
      Booking.find().sort({ createdAt: -1 }).limit(5).select('name email service status createdAt'),
    ]);
    res.json({ recentContacts, recentBookings });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
