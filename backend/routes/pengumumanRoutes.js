const express = require('express');
const router = express.Router();
const pengumumanController = require('../controllers/pengumumanController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, pengumumanController.getAll);
router.post('/', authenticate, pengumumanController.create);
router.put('/:id', authenticate, pengumumanController.update);
router.delete('/:id', authenticate, pengumumanController.delete);

module.exports = router;
