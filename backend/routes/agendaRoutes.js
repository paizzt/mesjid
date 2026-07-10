const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, agendaController.getAll);
router.post('/', authenticate, agendaController.create);
router.put('/:id', authenticate, agendaController.update);
router.delete('/:id', authenticate, agendaController.delete);

module.exports = router;
