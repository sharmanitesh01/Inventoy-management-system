const Product  = require('../models/Product');
const AuditLog = require('../models/AuditLog');

const log = (req, action, detail, oldVal = null, newVal = null) =>
  AuditLog.create({
    tenantId: req.user.tenantId,
    userId:   req.user._id,
    userName: req.user.fullName,
    action, module: 'product', detail, oldValue: oldVal, newValue: newVal,
    ip: req.ip,
  }).catch(() => {});

// GET /api/products/stats
const getStats = async (req, res) => {
  try {
    const tid = req.user.tenantId;
    const [total, inStock, lowStock, outOfStock, byCategory] = await Promise.all([
      Product.countDocuments({ tenantId: tid }),
      Product.countDocuments({ tenantId: tid, status: 'In Stock' }),
      Product.countDocuments({ tenantId: tid, status: 'Low Stock' }),
      Product.countDocuments({ tenantId: tid, status: 'Out of Stock' }),
      Product.aggregate([
        { $match: { tenantId: tid } },
        { $group: { _id: '$category', count: { $sum: 1 }, totalQty: { $sum: '$quantity' } } },
        { $sort: { count: -1 } },
      ]),
    ]);
    res.json({ total, inStock, lowStock, outOfStock, byCategory });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const { search, category, status } = req.query;
    const filter = { tenantId: req.user.tenantId };
    if (search)   filter.name = { $regex: search, $options: 'i' };
    if (category) filter.category = category;
    if (status)   filter.status = status;

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// POST /api/products
const createProduct = async (req, res) => {
  try {
    // Check tenant product limit
    // const count = await Product.countDocuments({ tenantId: req.user.tenantId });
    // if (req.tenant && count >= req.tenant.maxProducts)
    //   return res.status(403).json({ message: `Product limit reached (${req.tenant.maxProducts}). Upgrade your plan.` });

    const { name, quantity, category, price, description, sku, lowStockThreshold } = req.body;
    if (!name || quantity === undefined || !category || !price)
      return res.status(400).json({ message: 'name, quantity, category, price are required' });

    const product = await Product.create({
      tenantId: req.user.tenantId,
      name, quantity, category, price, description, sku,
      lowStockThreshold: lowStockThreshold || 10,
      createdBy: req.user._id,
    });

    log(req, 'CREATE', `Added product: ${name}`, null, product.toObject());
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const old = product.toObject();
    const fields = ['name', 'quantity', 'category', 'price', 'description', 'sku', 'lowStockThreshold'];
    fields.forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
    await product.save();

    log(req, 'UPDATE', `Updated product: ${product.name}`, old, product.toObject());
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    log(req, 'DELETE', `Deleted product: ${product.name}`, product.toObject());
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getStats, getProducts, createProduct, updateProduct, deleteProduct };
