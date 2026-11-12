const express = require('express');
const router = express.Router();
const dealController = require('../controllers/dealController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas las rutas de deals protegidas por autenticación/roles
router.get('/', authMiddleware, dealController.getDeals);
router.post('/', authMiddleware, dealController.createDeal);
router.put('/:id', authMiddleware, dealController.updateDeal);
router.delete('/:id', authMiddleware, dealController.deleteDeal);

module.exports = router;