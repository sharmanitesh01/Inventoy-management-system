const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// Unified User model replaces separate Admin + Staff models
const userSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null, // null only for platform_owner
  },

  fullName: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true, lowercase: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  phone:    { type: String, default: '' },

  role: {
    type: String,
    enum: ['platform_owner', 'company_owner', 'company_admin', 'manager', 'staff'],
    default: 'staff',
  },

  // Fine-grained permissions
  permissions: {
    type: [String],
    default: [], // e.g. ['products.view', 'products.create', 'staff.view']
  },

  isActive:  { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

}, { timestamps: true });

// Auto-assign default permissions based on role
userSchema.pre('save', function (next) {
  if (!this.isModified('role') && !this.isNew) return next();

  const defaults = {
    platform_owner: ['*'], // all permissions
    company_owner:  ['products.*', 'staff.*', 'reports.*', 'settings.*', 'inventory.*'],
    company_admin:  ['products.*', 'staff.*', 'reports.*', 'inventory.*'],
    manager:        ['products.view', 'products.create', 'products.edit', 'inventory.*', 'reports.view'],
    staff:          ['products.view', 'products.create', 'products.edit', 'inventory.view'],
  };

  if (this.permissions.length === 0) {
    this.permissions = defaults[this.role] || defaults.staff;
  }
  next();
});

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

// Check a single permission (supports wildcard like 'products.*')
userSchema.methods.hasPermission = function (perm) {
  if (this.permissions.includes('*')) return true;
  if (this.permissions.includes(perm)) return true;
  // Check wildcard namespace: if perm is 'products.create', check 'products.*'
  const ns = perm.split('.')[0];
  return this.permissions.includes(`${ns}.*`);
};

module.exports = mongoose.model('User', userSchema);
