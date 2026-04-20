const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

// Generate a JWT token for the admin
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token valid for 30 days
  });
};

// POST /api/auth/login
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find admin by username in database
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if password matches
    const isMatch = await admin.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Send back token and admin info
    res.json({
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// POST /api/auth/register (Only for first-time setup)
const registerAdmin = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Check if admin already exists
    const exists = await Admin.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Create new admin (password will be hashed automatically by model)
    const admin = await Admin.create({ username, password, email });

    res.status(201).json({
      _id: admin._id,
      username: admin.username,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { loginAdmin, registerAdmin };
