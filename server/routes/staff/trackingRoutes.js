const express = require('express');
const trackingController = require('../../controllers/staff/trackingController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// Update the tracking status for a parcel (handles both "Arrived" and "Unsuccessful" cases)
router.post('/update-status', protect, trackingController.updateTrackingStatus);

// Route to fetch only basic info
router.get('/info/basic/:trackingId', protect, trackingController.getBasicInfo);

// Route to fetch basic info + journey details
router.get('/info/full/:trackingId', protect, trackingController.getTrackingDetails);


module.exports = router;
