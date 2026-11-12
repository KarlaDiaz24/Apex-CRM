const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');
const authMiddleware = require('../middlewares/authMiddleware');

// Solo lectura de logs (protegido)
router.get('/', authMiddleware, auditController.getAuditLogs);

module.exports = router;