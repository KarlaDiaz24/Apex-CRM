const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/register', authMiddleware, authMiddleware.verifyRole('admin'), authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);
router.get('/users', authMiddleware, authMiddleware.verifyRole('admin'), authController.getUsers);
router.put('/users/:id', authMiddleware, authMiddleware.verifyRole('admin'), authController.updateUser);
router.delete('/users/:id', authMiddleware, authMiddleware.verifyRole('admin'), authController.deleteUser);

module.exports = router;
