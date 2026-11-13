const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, authMiddleware.verifyRole('admin'), auditController.getAuditLogs);

module.exports = router;
