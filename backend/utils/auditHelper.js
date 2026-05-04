const AuditLog = require('../models/AuditLog');

const createAuditLog = async ({
  tenantId,
  userId,
  userName,
  action,
  module,
  detail = '',
  oldValue = null,
  newValue = null,
  ip = '',
}) => {
  try {
    if (!tenantId) return;

    await AuditLog.create({
      tenantId,
      userId,
      userName,
      action,
      module,
      detail,
      oldValue,
      newValue,
      ip,
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

module.exports = createAuditLog;