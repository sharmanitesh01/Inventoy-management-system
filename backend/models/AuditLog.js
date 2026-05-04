const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  action:   { type: String, required: true }, // e.g. 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
  module:   { type: String, required: true }, // e.g. 'product', 'staff', 'auth'
  detail:   { type: String, default: '' },    // human-readable description
  oldValue: { type: mongoose.Schema.Types.Mixed, default: null },
  newValue: { type: mongoose.Schema.Types.Mixed, default: null },
  ip:       { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
