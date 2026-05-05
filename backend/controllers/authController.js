const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const AuditLog = require('../models/AuditLog');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '8h' });

const formatUser = (user, tenant = null) => ({
  id: user._id,
  fullName: user.fullName,
  username: user.username,
  email: user.email,
  role: user.role,
  permissions: user.permissions,
  tenantId: user.tenantId,
  companyName: tenant?.companyName || null
});

// LOGIN
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ message: 'Username and password required' });

    const user = await User.findOne({ username });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    if (!user.isActive) return res.status(403).json({ message: 'Account suspended. Contact your admin.' });

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    let tenant = null;
    if (user.tenantId) {
      tenant = await Tenant.findById(user.tenantId);
      if (tenant && !tenant.isActive)
        return res.status(403).json({ message: 'Your company account is deactivated.' });
    }

    if (user.tenantId) {
      await AuditLog.create({
        tenantId: user.tenantId,
        userId: user._id,
        userName: user.fullName,
        action: 'LOGIN',
        module: 'auth',
        detail: `${user.fullName} logged into the system`,
        ip: req.ip,
      }).catch(() => {});
    }

    res.json({
      token: signToken(user._id),
      user: formatUser(user, tenant)
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// REGISTER COMPANY
const register = async (req, res) => {
  try {
    const { companyName, ownerName, email, password, phone, businessType } = req.body;

    if (!companyName || !ownerName || !email || !password)
      return res.status(400).json({ message: 'companyName, ownerName, email, password are required' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'Email already registered' });

    const existingTenant = await Tenant.findOne({ email });
    if (existingTenant) return res.status(409).json({ message: 'Company email already registered' });

    const tenant = await Tenant.create({
      companyName,
      ownerName,
      email,
      phone,
      businessType
    });

    const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '_' + Date.now().toString().slice(-4);

    const owner = await User.create({
      tenantId: tenant._id,
      fullName: ownerName,
      username,
      email,
      password,
      phone,
      role: 'company_owner',
    });

    res.status(201).json({
      message: 'Company registered successfully',
      token: signToken(owner._id),
      user: formatUser(owner, tenant)
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// CURRENT USER
const getMe = async (req, res) => {
  try {
    let tenant = null;
    if (req.user.tenantId) tenant = await Tenant.findById(req.user.tenantId);
    res.json(formatUser(req.user, tenant));
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, register, getMe };