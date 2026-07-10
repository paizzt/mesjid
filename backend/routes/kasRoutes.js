const express = require('express');
const router = express.Router();
const kasController = require('../controllers/kasController');
const { authenticate, authorize } = require('../middleware/auth');

// Hanya takmir dan bendahara yang bisa mengelola kas
router.use(authenticate);
router.use(authorize(['takmir', 'bendahara', 'admin']));

router.get('/masjid/:masjidId', kasController.getAllKas);
router.post('/masjid/:masjidId', kasController.createKas);
router.put('/:id', kasController.updateKas);
router.delete('/:id', kasController.deleteKas);
router.post('/transfer', kasController.transferKas);

module.exports = router;
