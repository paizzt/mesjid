const express = require('express');
const router = express.Router();
const qurbanController = require('../controllers/qurbanController');
const { authenticate } = require('../middleware/auth');

router.get('/hewan', authenticate, qurbanController.getAllHewan);
router.post('/hewan', authenticate, qurbanController.createHewan);
router.put('/hewan/:id', authenticate, qurbanController.updateHewan);
router.delete('/hewan/:id', authenticate, qurbanController.deleteHewan);

router.post('/peserta', authenticate, qurbanController.createPeserta);
router.delete('/peserta/:id', authenticate, qurbanController.deletePeserta);

module.exports = router;
