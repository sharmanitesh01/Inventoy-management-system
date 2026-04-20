const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define what an Admin looks like in the database
const adminSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true, // No two admins with same username
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: 'admin@stockiq.com',
    },
    role: {
      type: String,
      default: 'admin',
    },
  },
  {
    timestamps: true,
  }
);

// Before saving admin, hash (encrypt) the password
adminSchema.pre('save', async function (next) {
  // Only hash if password was changed
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10); // Generate random salt
  this.password = await bcrypt.hash(this.password, salt); // Hash password
  next();
});

// Method to compare login password with stored hashed password
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
