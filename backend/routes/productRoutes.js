const express = require('express');
const router  = express.Router();
const { getStats, getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/productController');
const { protect, tenantScope, permissionGuard, roleGuard } = require('../middleware/authMiddleware');

router.use(protect, tenantScope);

router.get('/stats', permissionGuard('products.view'), getStats);
router.get('/',      permissionGuard('products.view'), getProducts);
router.post('/',     permissionGuard('products.create'), createProduct);
router.put('/:id',   permissionGuard('products.edit'),   updateProduct);
router.delete('/:id',roleGuard('platform_owner','company_owner','company_admin'), deleteProduct);

module.exports = router;
