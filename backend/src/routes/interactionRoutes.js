const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, interactionController.getInteractions);
router.post('/', authMiddleware, interactionController.createInteraction);
router.put('/:id', authMiddleware, interactionController.updateInteraction);
router.delete('/:id', authMiddleware, interactionController.deleteInteraction);

module.exports = router;
