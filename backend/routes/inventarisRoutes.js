const express = require('express');
const router = express.Router();
const inventarisController = require('../controllers/inventarisController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, inventarisController.getAll);
router.post('/', authenticate, inventarisController.create);
router.put('/:id', authenticate, inventarisController.update);
router.delete('/:id', authenticate, inventarisController.delete);

module.exports = router;
