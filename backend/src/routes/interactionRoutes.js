const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas protegidas para interacciones
router.get('/', authMiddleware, interactionController.getInteractions);
router.post('/', authMiddleware, interactionController.createInteraction);
router.delete('/:id', authMiddleware, interactionController.deleteInteraction);

module.exports = router;