const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/', authMiddleware, clientController.getClients);
router.get('/deleted', authMiddleware, clientController.getDeletedClients);
router.post('/', authMiddleware, clientController.createClient);
router.put('/:id', authMiddleware, clientController.updateClient);
router.delete('/:id', authMiddleware, clientController.deleteClient);
router.put('/restore/:id', authMiddleware, clientController.restoreClient);

module.exports = router;