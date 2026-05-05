const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Product = require('../models/Product');
const AuditLog = require('../models/AuditLog');

const getPlatformStats = async (req, res) => {
  try {
    const [totalTenants, activeTenants, totalUsers, totalProducts, recentTenants] = await Promise.all([
      Tenant.countDocuments(),
      Tenant.countDocuments({ isActive: true }),
      User.countDocuments({ role: { $ne: 'platform_owner' } }),
      Product.countDocuments(),
      Tenant.find().sort({ createdAt: -1 }).limit(5).select('companyName isActive createdAt'),
    ]);

    res.json({
      totalTenants,
      activeTenants,
      totalUsers,
      totalProducts,
      recentTenants
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getTenants = async (req, res) => {
  try {
    const tenants = await Tenant.find().sort({ createdAt: -1 });

    const result = await Promise.all(
      tenants.map(async (t) => {
        const userCount = await User.countDocuments({ tenantId: t._id });
        const productCount = await Product.countDocuments({ tenantId: t._id });

        return {
          ...t.toObject(),
          userCount,
          productCount
        };
      })
    );

    res.json(result);

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

const toggleTenant = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

    tenant.isActive = !tenant.isActive;
    await tenant.save();

    res.json({
      message: `Tenant ${tenant.isActive ? 'activated' : 'deactivated'}`,
      isActive: tenant.isActive
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

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

module.exports = { getPlatformStats, getTenants, toggleTenant, deleteTenant };