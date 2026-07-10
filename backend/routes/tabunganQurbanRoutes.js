const express = require('express');
const router = express.Router();
const tabunganQurbanController = require('../controllers/tabunganQurbanController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, tabunganQurbanController.getAllTabungan);
router.post('/', authenticate, tabunganQurbanController.createTabungan);
router.put('/:id', authenticate, tabunganQurbanController.updateTabungan);
router.delete('/:id', authenticate, tabunganQurbanController.deleteTabungan);

router.post('/setoran', authenticate, tabunganQurbanController.createSetoran);

module.exports = router;
