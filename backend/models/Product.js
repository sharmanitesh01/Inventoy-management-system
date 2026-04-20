const mongoose = require('mongoose');

// Define what a Product looks like in the database
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Must have a name
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ['Electronics', 'Clothing', 'Food', 'Furniture', 'Sports', 'Books', 'Other'],
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      // Auto-calculated based on quantity
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
    },
    description: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true, // Auto adds createdAt and updatedAt
  }
);

// Before saving, auto-set status based on quantity
productSchema.pre('save', function (next) {
  if (this.quantity === 0) {
    this.status = 'Out of Stock';
  } else if (this.quantity <= 10) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
