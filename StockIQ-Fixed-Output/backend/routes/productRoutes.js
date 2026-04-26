const express  = require('express');
const router   = express.Router();
const Product  = require('../models/Product');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// ─── GET /api/products/stats  ─ Dashboard & Reports rely on this ──────────────
// MUST be declared BEFORE /:id route or Express will match "stats" as an id
router.get('/stats', protect, async (req, res) => {
  try {
    const total      = await Product.countDocuments();
    const inStock    = await Product.countDocuments({ status: 'In Stock' });
    const lowStock   = await Product.countDocuments({ status: 'Low Stock' });
    const outOfStock = await Product.countDocuments({ status: 'Out of Stock' });

    // Category breakdown for pie/bar charts
    const byCategory = await Product.aggregate([
      {
        $group: {
          _id:      '$category',
          count:    { $sum: 1 },
          totalQty: { $sum: '$quantity' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({ total, inStock, lowStock, outOfStock, byCategory });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/products  — admin + staff
router.get('/', protect, async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/products/:id  — admin + staff
router.get('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/products  — admin + staff
router.post('/', protect, async (req, res) => {
  try {
    const { name, quantity, category, price, description } = req.body;
    if (!name || quantity === undefined || !category || !price)
      return res.status(400).json({ message: 'name, quantity, category, price are required' });

    const product = await Product.create({ name, quantity, category, price, description });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/products/:id  — admin + staff
router.put('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, req.body,
      { new: true, runValidators: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// DELETE /api/products/:id  — ADMIN ONLY
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
