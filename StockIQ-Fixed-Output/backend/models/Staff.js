const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const StaffSchema = new mongoose.Schema({
  name:     { type: String, required: [true, 'Name is required'], trim: true },
  username: { type: String, required: [true, 'Username is required'], unique: true, trim: true, lowercase: true },
  email:    { type: String, required: [true, 'Email is required'], unique: true, lowercase: true },
  password: { type: String, required: [true, 'Password is required'], minlength: 6 },
  isActive: { type: Boolean, default: true },
  createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
}, { timestamps: true });

StaffSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

StaffSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model('Staff', StaffSchema);
