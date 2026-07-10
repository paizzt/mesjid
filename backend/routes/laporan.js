const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const { authenticate } = require('../middleware/auth');

// Get laporan keuangan
router.get('/', authenticate, laporanController.getLaporanKeuangan);

module.exports = router;
