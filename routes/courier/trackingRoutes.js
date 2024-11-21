const express = require('express');
const trackingController = require('../../controllers/courier/trackingController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

//Update the tracking status of a parcel
router.post('/update-status', trackingController.updateTrackingStatus);

// Route to fetch only basic info
router.get('/info/basic/:trackingId', protect, trackingController.getBasicInfo);

// Route to fetch basic info + journey details
router.get('/info/full/:trackingId', protect, trackingController.getTrackingDetails);

// Route to fetch parcels with "Out for delivery" status
router.get('/out-for-delivery', protect, trackingController.getOutForDeliveryParcels);

module.exports = router;
