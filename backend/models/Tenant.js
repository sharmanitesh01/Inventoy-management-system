const mongoose = require('mongoose');

// A Tenant = one registered company on the platform
const tenantSchema = new mongoose.Schema({
  companyName:  { type: String, required: true, trim: true },
  ownerName:    { type: String, required: true, trim: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  phone:        { type: String, default: '' },
  businessType: { type: String, default: 'Retail' },
  logo:         { type: String, default: '' },
  gstNumber:    { type: String, default: '' },
  address:      { type: String, default: '' },

  // Subscription
  plan: {
    type: String,
    enum: ['trial', 'basic', 'pro', 'enterprise'],
    default: 'trial',
  },
  planExpiresAt: { type: Date, default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }, // 14-day trial
  maxUsers:    { type: Number, default: 3 },   // trial: 3, basic: 10, pro: 50, enterprise: unlimited
  maxProducts: { type: Number, default: 100 }, // trial: 100

  isActive: { type: Boolean, default: true },
  isFrozen: { type: Boolean, default: false },

}, { timestamps: true });

// Plan limits helper
tenantSchema.methods.applyPlanLimits = function () {
  const limits = {
    trial:      { maxUsers: 3,    maxProducts: 100 },
    basic:      { maxUsers: 10,   maxProducts: 500 },
    pro:        { maxUsers: 50,   maxProducts: 5000 },
    enterprise: { maxUsers: 9999, maxProducts: 999999 },
  };
  const l = limits[this.plan] || limits.trial;
  this.maxUsers    = l.maxUsers;
  this.maxProducts = l.maxProducts;
};

module.exports = mongoose.model('Tenant', tenantSchema);
