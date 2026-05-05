const express = require('express');
const router = express.Router();

const {
  getPlatformStats,
  getTenants,
  toggleTenant,
  deleteTenant
} = require('../controllers/superAdminController');

const { protect, platformOwnerOnly } = require('../middleware/authMiddleware');

router.use(protect, platformOwnerOnly);

router.get('/stats', getPlatformStats);
router.get('/tenants', getTenants);
router.patch('/tenants/:id/toggle', toggleTenant);
router.delete('/tenants/:id', deleteTenant);

module.exports = router;