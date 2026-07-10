const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

// Public routes - no authentication required
router.get('/balance/:masjidId', publicController.getPublicBalance);
router.get('/masjids', publicController.getAllMasjids);
router.get('/masjid/:masjidId', publicController.getMasjidDetail);

module.exports = router;
