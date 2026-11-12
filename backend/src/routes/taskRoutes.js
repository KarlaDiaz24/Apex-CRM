const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');

// Rutas protegidas para tareas
router.get('/', authMiddleware, taskController.getTasks);
router.post('/', authMiddleware, taskController.createTask);
router.put('/:id', authMiddleware, taskController.updateTask);
router.put('/:id/complete', authMiddleware, taskController.completeTask);
router.delete('/:id', authMiddleware, taskController.deleteTask);

module.exports = router;