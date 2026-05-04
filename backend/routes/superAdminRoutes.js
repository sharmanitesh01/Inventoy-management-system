const express = require('express');
const router  = express.Router();
const {
  getPlatformStats, getTenants, toggleTenant, freezeTenant, updatePlan, deleteTenant
} = require('../controllers/superAdminController');
const { protect, platformOwnerOnly } = require('../middleware/authMiddleware');

router.use(protect, platformOwnerOnly);

router.get('/stats',                  getPlatformStats);
router.get('/tenants',                getTenants);
router.patch('/tenants/:id/toggle',   toggleTenant);
router.patch('/tenants/:id/freeze',   freezeTenant);
router.patch('/tenants/:id/plan',     updatePlan);
router.delete('/tenants/:id',         deleteTenant);

module.exports = router;
