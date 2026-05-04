const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    index: true,
  },
  name:        { type: String, required: true, trim: true },
  quantity:    { type: Number, required: true, default: 0 },
  category:    { type: String, required: true },
  price:       { type: Number, required: true, default: 0 },
  description: { type: String, default: '' },
  sku:         { type: String, default: '' },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock',
  },
  lowStockThreshold: { type: Number, default: 10 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-set status based on quantity vs threshold
productSchema.pre('save', function (next) {
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= this.lowStockThreshold) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

// Also handle findByIdAndUpdate - use a pre hook for findOneAndUpdate
productSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.quantity !== undefined) {
    const threshold = update.lowStockThreshold || 10;
    if (update.quantity === 0) update.status = 'Out of Stock';
    else if (update.quantity <= threshold) update.status = 'Low Stock';
    else update.status = 'In Stock';
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
