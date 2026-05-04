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
  companyName: tenant?.companyName || null,
  plan: tenant?.plan || null,
});

// POST /api/auth/login  — unified login for all roles
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
      if (tenant && !tenant.isActive) return res.status(403).json({ message: 'Your company account is deactivated.' });
      if (tenant && tenant.isFrozen) return res.status(403).json({ message: 'Your company account is frozen. Contact support.' });
    }

    // res.json({ token: signToken(user._id), user: formatUser(user, tenant) });
    if (user.tenantId) {
      await AuditLog.create({
        tenantId: user.tenantId,
        userId: user._id,
        userName: user.fullName,
        action: 'LOGIN',
        module: 'auth',
        detail: `${user.fullName} logged into the system`,
        ip: req.ip,
      }).catch(() => { });
    }

    res.json({ token: signToken(user._id), user: formatUser(user, tenant) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/auth/register  — public company registration (SaaS onboarding)
const register = async (req, res) => {
  try {
    const { companyName, ownerName, email, password, phone, businessType, plan } = req.body;

    if (!companyName || !ownerName || !email || !password)
      return res.status(400).json({ message: 'companyName, ownerName, email, password are required' });

    // Check no existing user with that email
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(409).json({ message: 'Email already registered' });

    // Check no existing tenant with that email
    const existingTenant = await Tenant.findOne({ email });
    if (existingTenant) return res.status(409).json({ message: 'Company email already registered' });

    // Create tenant
    const tenant = new Tenant({ companyName, ownerName, email, phone, businessType, plan: plan || 'trial' });
    tenant.applyPlanLimits();
    await tenant.save();

    // Create company_owner user
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

    const token = signToken(owner._id);
    res.status(201).json({
      message: 'Company registered successfully',
      token,
      user: formatUser(owner, tenant),
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/auth/me  — return current user info
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
