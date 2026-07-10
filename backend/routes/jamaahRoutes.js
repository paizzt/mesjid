const express = require('express');
const router = express.Router();
const jamaahController = require('../controllers/jamaahController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, jamaahController.getAllJamaah);
router.post('/', authenticate, jamaahController.createJamaah);
router.put('/:id', authenticate, jamaahController.updateJamaah);
router.delete('/:id', authenticate, jamaahController.deleteJamaah);

module.exports = router;
