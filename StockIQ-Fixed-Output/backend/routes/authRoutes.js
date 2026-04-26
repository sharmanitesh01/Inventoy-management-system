const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const Admin   = require('../models/Admin');

const signToken = (id) =>
  jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Username and password required' });

    const admin = await Admin.findOne({ username });
    if (!admin)
      return res.status(401).json({ message: 'Invalid credentials' });

    const match = await admin.matchPassword(password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      token: signToken(admin._id),
      user: {
        id:       admin._id,
        username: admin.username,
        email:    admin.email,
        role:     'admin',
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
