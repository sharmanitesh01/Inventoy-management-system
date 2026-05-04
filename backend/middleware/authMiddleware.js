const jwt    = require('jsonwebtoken');
const User   = require('../models/User');
const Tenant = require('../models/Tenant');

// ── protect: verify JWT, attach req.user ─────────────────────────────────────
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (!user.isActive) return res.status(403).json({ message: 'Account suspended' });

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

// ── tenantScope: ensures req.user belongs to a live tenant, attaches req.tenant ─
const tenantScope = async (req, res, next) => {
  if (req.user.role === 'platform_owner') return next(); // platform owner skips tenant check

  if (!req.user.tenantId)
    return res.status(403).json({ message: 'No tenant associated with this account' });

  try {
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant)   return res.status(404).json({ message: 'Tenant not found' });
    if (!tenant.isActive) return res.status(403).json({ message: 'Company account is deactivated' });
    if (tenant.isFrozen)  return res.status(403).json({ message: 'Company account is frozen. Contact support.' });

    req.tenant = tenant;
    next();
  } catch {
    return res.status(500).json({ message: 'Server error in tenant validation' });
  }
};

// ── roleGuard: accepts array of allowed roles ─────────────────────────────────
const roleGuard = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: `Access denied. Required roles: ${roles.join(', ')}` });
  next();
};

// ── permissionGuard: checks a specific permission string ─────────────────────
const permissionGuard = (perm) => (req, res, next) => {
  if (!req.user.hasPermission(perm))
    return res.status(403).json({ message: `Permission denied: ${perm}` });
  next();
};

// ── platformOwnerOnly: only platform_owner can access ────────────────────────
const platformOwnerOnly = roleGuard('platform_owner');

// ── companyAdminUp: company_owner or company_admin ───────────────────────────
const companyAdminUp = roleGuard('platform_owner', 'company_owner', 'company_admin');

module.exports = { protect, tenantScope, roleGuard, permissionGuard, platformOwnerOnly, companyAdminUp };
