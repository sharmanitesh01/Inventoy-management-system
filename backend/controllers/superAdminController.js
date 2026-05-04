const Tenant   = require('../models/Tenant');
const User     = require('../models/User');
const Product  = require('../models/Product');
const AuditLog = require('../models/AuditLog');

// GET /api/superadmin/stats  — platform-wide stats
const getPlatformStats = async (req, res) => {
  try {
    const [totalTenants, activeTenants, totalUsers, totalProducts, recentTenants] = await Promise.all([
      Tenant.countDocuments(),
      Tenant.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $ne: 'platform_owner' } }),
      Product.countDocuments(),
      Tenant.find().sort({ createdAt: -1 }).limit(5).select('companyName plan isActive createdAt'),
    ]);

    const byPlan = await Tenant.aggregate([
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);

    res.json({ totalTenants, activeTenants, totalUsers, totalProducts, recentTenants, byPlan });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/superadmin/tenants
const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });
    // Attach user count to each tenant
    const result = await Promise.all(tenants.map(async (t) => {
      const userCount = await User.countDocuments({ tenantId: t._id });
      const productCount = await Product.countDocuments({ tenantId: t._id });
      return { ...t.toObject(), userCount, productCount };
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/superadmin/tenants/:id/toggle
const toggleTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    tenant.isActive = !tenant.isActive;
    await tenant.save();
    res.json({ message: `Tenant ${tenant.isActive ? 'activated' : 'deactivated'}`, isActive: tenant.isActive });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/superadmin/tenants/:id/freeze
const freezeTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    tenant.isFrozen = !tenant.isFrozen;
    await tenant.save();
    res.json({ message: `Tenant ${tenant.isFrozen ? 'frozen' : 'unfrozen'}`, isFrozen: tenant.isFrozen });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PATCH /api/superadmin/tenants/:id/plan
const updatePlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });
    tenant.plan = plan;
    tenant.applyPlanLimits();
    await tenant.save();
    res.json({ message: `Plan updated to ${plan}`, tenant });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/superadmin/tenants/:id
const deleteTenant = async (req, res) => {
  try {
    await Tenant.findByIdAndDelete(req.params.id);
    await User.deleteMany({ tenantId: req.params.id });
    await Product.deleteMany({ tenantId: req.params.id });
    await AuditLog.deleteMany({ tenantId: req.params.id });
    res.json({ message: 'Tenant and all data deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getPlatformStats, getTenants, toggleTenant, freezeTenant, updatePlan, deleteTenant };
