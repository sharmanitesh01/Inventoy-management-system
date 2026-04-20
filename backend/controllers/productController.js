const Product = require('../models/Product');

// GET /api/products - Get all products
const getProducts = async (req, res) => {
  try {
    // Fetch all products, newest first
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// POST /api/products - Add a new product
const createProduct = async (req, res) => {
  try {
    const { name, quantity, category, price, description } = req.body;

    // Create new product in database
    const product = await Product.create({
      name,
      quantity,
      category,
      price,
      description,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// PUT /api/products/:id - Update a product
const updateProduct = async (req, res) => {
  try {
    // Find product by ID
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    const { name, quantity, category, price, description } = req.body;
    product.name = name || product.name;
    product.quantity = quantity !== undefined ? quantity : product.quantity;
    product.category = category || product.category;
    product.price = price !== undefined ? price : product.price;
    product.description = description || product.description;

    // Save will trigger the pre-save hook to auto-update status
    const updated = await product.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// DELETE /api/products/:id - Delete a product
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// GET /api/products/stats - Get dashboard statistics
const getStats = async (req, res) => {
  try {
    const total = await Product.countDocuments();
    const lowStock = await Product.countDocuments({ status: 'Low Stock' });
    const outOfStock = await Product.countDocuments({ status: 'Out of Stock' });
    const inStock = await Product.countDocuments({ status: 'In Stock' });

    // Get products grouped by category
    const byCategory = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } },
    ]);

    res.json({ total, lowStock, outOfStock, inStock, byCategory });
  } catch (error) {
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = { getProducts, createProduct, updateProduct, deleteProduct, getStats };
