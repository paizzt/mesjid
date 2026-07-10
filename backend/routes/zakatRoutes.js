const express = require('express');
const router = express.Router();
const zakatController = require('../controllers/zakatController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, zakatController.getAllZakat);
router.post('/', authenticate, zakatController.createZakat);
router.put('/:id', authenticate, zakatController.updateZakat);
router.delete('/:id', authenticate, zakatController.deleteZakat);

module.exports = router;
