const express = require('express');
const router  = express.Router();
const { getUsers, createUser, toggleUser, deleteUser } = require('../controllers/userController');
const { protect, tenantScope, companyAdminUp } = require('../middleware/authMiddleware');

router.use(protect, tenantScope, companyAdminUp);

router.get('/',              getUsers);
router.post('/',             createUser);
router.patch('/:id/toggle',  toggleUser);
router.delete('/:id',        deleteUser);

module.exports = router;
