const jwt = require('jsonwebtoken');
const { Admin } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized — no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select('-password');
    if (!admin) return res.status(401).json({ error: 'Admin not found' });
    req.admin = admin;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
};

const superAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === 'superadmin') return next();
  return res.status(403).json({ error: 'Superadmin access required' });
};

module.exports = { protect, superAdmin };
