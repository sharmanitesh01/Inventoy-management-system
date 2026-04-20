const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const Staff   = require('../models/Staff');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ─── Helper: sign a JWT for staff ────────────────────────────────────────────
const signToken = (id) =>
  jwt.sign({ id, role: 'staff' }, process.env.JWT_SECRET, { expiresIn: '8h' });

// ─── POST /api/staff/login  (public) ─────────────────────────────────────────
// Staff members log in here (separate from admin login)
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Username and password required' });

    const staff = await Staff.findOne({ username });
    if (!staff)
      return res.status(401).json({ message: 'Invalid credentials' });

    if (!staff.isActive)
      return res.status(403).json({ message: 'Account suspended. Contact admin.' });

    const match = await staff.matchPassword(password);
    if (!match)
      return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      token: signToken(staff._id),
      user: {
        id:       staff._id,
        name:     staff.name,
        username: staff.username,
        email:    staff.email,
        role:     'staff',
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ─── All routes below require admin ──────────────────────────────────────────

// GET /api/staff  — list all staff accounts
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const staffList = await Staff.find()
      .select('-password')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 });
    res.json(staffList);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/staff  — admin creates a staff account
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await Staff.findOne({ $or: [{ username }, { email }] });
    if (exists)
      return res.status(409).json({ message: 'Username or email already in use' });

    const staff = await Staff.create({
      name,
      username,
      email,
      password,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: 'Staff account created',
      staff: {
        id:       staff._id,
        name:     staff.name,
        username: staff.username,
        email:    staff.email,
        isActive: staff.isActive,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PATCH /api/staff/:id/toggle  — admin activates or suspends a staff account
router.patch('/:id/toggle', protect, adminOnly, async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff)
      return res.status(404).json({ message: 'Staff not found' });

    staff.isActive = !staff.isActive;
    await staff.save();

    res.json({
      message: `Staff account ${staff.isActive ? 'activated' : 'suspended'}`,
      isActive: staff.isActive,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/staff/:id  — admin permanently deletes a staff account
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff)
      return res.status(404).json({ message: 'Staff not found' });

    res.json({ message: 'Staff account deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
