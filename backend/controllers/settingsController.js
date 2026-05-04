const Tenant = require('../models/Tenant');
const createAuditLog = require('../utils/auditHelper');

// GET /api/settings
const getSettings = async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.user.tenantId);
    if (!tenant) return res.status(404).json({ message: 'Company not found' });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/settings
// const updateSettings = async (req, res) => {
//   try {
//     const { companyName, ownerName, phone, businessType, logo, gstNumber, address } = req.body;
//     const tenant = await Tenant.findByIdAndUpdate(
//       req.user.tenantId,
//       { companyName, ownerName, phone, businessType, logo, gstNumber, address },
//       { new: true, runValidators: true }
//     );
//     res.json({ message: 'Settings updated', tenant });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// };

const updateSettings = async (req, res) => {
  try {
    const { companyName, ownerName, phone, businessType, logo, gstNumber, address } = req.body;

    const oldTenant = await Tenant.findById(req.user.tenantId);

    const tenant = await Tenant.findByIdAndUpdate(
      req.user.tenantId,
      { companyName, ownerName, phone, businessType, logo, gstNumber, address },
      { new: true, runValidators: true }
    );

    await createAuditLog({
      tenantId: req.user.tenantId,
      userId: req.user._id,
      userName: req.user.fullName,
      action: 'UPDATE',
      module: 'settings',
      detail: `${req.user.fullName} updated company settings`,
      oldValue: oldTenant,
      newValue: tenant,
      ip: req.ip,
    });

    res.json({ message: 'Settings updated', tenant });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getSettings, updateSettings };
