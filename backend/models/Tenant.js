const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  ownerName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: '' },
  businessType: { type: String, default: 'Retail' },
  logo: { type: String, default: '' },
  gstNumber: { type: String, default: '' },
  address: { type: String, default: '' },

  isActive: { type: Boolean, default: true }

}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);