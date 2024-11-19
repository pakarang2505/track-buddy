const express = require('express');
const trackingController = require('../../controllers/courier/trackingController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.post('/update-status', protect, trackingController.updateTrackingStatus);

module.exports = router;
