const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    quantity:    { type: Number, required: true, default: 0 },
    category:    { type: String, required: true, enum: ['Electronics', 'Clothing', 'Food', 'Furniture', 'Sports', 'Books', 'Other'] },
    price:       { type: Number, required: true, default: 0 },
    status:      { type: String, enum: ['In Stock', 'Low Stock', 'Out of Stock'], default: 'In Stock' },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-set status based on quantity before save
productSchema.pre('save', function (next) {
  if (this.quantity === 0)       this.status = 'Out of Stock';
  else if (this.quantity <= 10)  this.status = 'Low Stock';
  else                           this.status = 'In Stock';
  next();
});

// Also update status on findByIdAndUpdate
productSchema.pre('findOneAndUpdate', function (next) {
  const update = this.getUpdate();
  if (update.quantity !== undefined) {
    if (update.quantity === 0)       update.status = 'Out of Stock';
    else if (update.quantity <= 10)  update.status = 'Low Stock';
    else                             update.status = 'In Stock';
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
