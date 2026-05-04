const express  = require('express');
const router   = express.Router();
const AuditLog = require('../models/AuditLog');
const { protect, tenantScope } = require('../middleware/authMiddleware');

router.get('/', protect, tenantScope, async (req, res) => {
  try {
    const logs = await AuditLog.find({ tenantId: req.user.tenantId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
