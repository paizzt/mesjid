const express = require('express');
const router = express.Router();
const kategoriController = require('../controllers/kategoriController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.get('/', kategoriController.getAll);
router.get('/:id', kategoriController.getById);

// Protected routes - any authenticated user can create/update kategori
router.post('/', authenticate, kategoriController.create);
router.put('/:id', authenticate, kategoriController.update);
router.delete('/:id', authenticate, kategoriController.delete);
router.delete('/:id/hard', authenticate, kategoriController.hardDelete);

module.exports = router;
