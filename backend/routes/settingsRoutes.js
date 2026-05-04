const express = require('express');
const router  = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, tenantScope, roleGuard } = require('../middleware/authMiddleware');

router.get('/',  protect, tenantScope, getSettings);
router.put('/',  protect, tenantScope, roleGuard('company_owner','company_admin','platform_owner'), updateSettings);

module.exports = router;
