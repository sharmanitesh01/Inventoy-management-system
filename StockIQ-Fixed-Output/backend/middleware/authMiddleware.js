const jwt   = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Staff = require('../models/Staff');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id).select('-password');
      if (!admin) return res.status(401).json({ message: 'Admin not found' });
      req.user = admin;
      req.role = 'admin';

    } else if (decoded.role === 'staff') {
      const staff = await Staff.findById(decoded.id).select('-password');
      if (!staff) return res.status(401).json({ message: 'Staff not found' });
      if (!staff.isActive)
        return res.status(403).json({ message: 'Account suspended. Contact admin.' });
      req.user = staff;
      req.role = 'staff';

    } else {
      return res.status(401).json({ message: 'Invalid token role' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.role !== 'admin')
    return res.status(403).json({ message: 'Access denied: Admins only' });
  next();
};

module.exports = { protect, adminOnly };
