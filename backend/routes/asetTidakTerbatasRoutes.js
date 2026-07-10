const express = require('express');
const router = express.Router();
const controller = require('../controllers/asetTidakTerbatasController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/saldo', controller.getSaldo);

// Protected routes
router.get('/', authenticate, controller.getAll);
router.post('/', authenticate, controller.create);
router.get('/:id', authenticate, controller.getById);
router.put('/:id', authenticate, controller.update);
router.delete('/:id', authenticate, controller.delete);

module.exports = router;
