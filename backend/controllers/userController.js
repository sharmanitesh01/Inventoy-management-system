const User     = require('../models/User');
const Tenant   = require('../models/Tenant');
const AuditLog = require('../models/AuditLog');

const log = (req, action, detail) =>
  AuditLog.create({
    tenantId: req.user.tenantId,
    userId:   req.user._id,
    userName: req.user.fullName,
    action, module: 'user', detail, ip: req.ip,
  }).catch(() => {});

// GET /api/users  — list all users in this tenant
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ tenantId: req.user.tenantId })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/users  — create a user inside tenant
const createUser = async (req, res) => {
  try {
    // Check tenant user limit
    const count = await User.countDocuments({ tenantId: req.user.tenantId });
    const tenant = await Tenant.findById(req.user.tenantId);
    if (tenant && count >= tenant.maxUsers)
      return res.status(403).json({ message: `User limit reached (${tenant.maxUsers}). Upgrade your plan.` });

    const { fullName, username, email, password, phone, role, permissions } = req.body;
    if (!fullName || !username || !email || !password)
      return res.status(400).json({ message: 'fullName, username, email, password are required' });

    // Prevent creating roles higher than your own
    const hierarchy = { platform_owner: 5, company_owner: 4, company_admin: 3, manager: 2, staff: 1 };
    if (hierarchy[role] >= hierarchy[req.user.role])
      return res.status(403).json({ message: 'Cannot create user with equal or higher role' });

    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(409).json({ message: 'Username or email already in use' });

    const user = await User.create({
      tenantId: req.user.tenantId,
      fullName, username, email, password, phone,
      role: role || 'staff',
      permissions: permissions || [],
      createdBy: req.user._id,
    });

    log(req, 'CREATE', `Created user: ${fullName} (${role})`);
    res.status(201).json({ message: 'User created', user: { ...user.toObject(), password: undefined } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PATCH /api/users/:id/toggle  — suspend / activate
const toggleUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'company_owner') return res.status(403).json({ message: 'Cannot suspend company owner' });

    user.isActive = !user.isActive;
    await user.save();

    log(req, 'UPDATE', `${user.isActive ? 'Activated' : 'Suspended'} user: ${user.fullName}`);
    res.json({ message: `User ${user.isActive ? 'activated' : 'suspended'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'company_owner') return res.status(403).json({ message: 'Cannot delete company owner' });

    log(req, 'DELETE', `Deleted user: ${user.fullName}`);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getUsers, createUser, toggleUser, deleteUser };
