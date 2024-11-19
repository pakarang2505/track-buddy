const express = require('express');
const trackingController = require('../../controllers/customer/trackingController');
const router = express.Router();

// Default route for /api/tracking
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Tracking API is working. Use /track/:trackingId to track parcels.' });
});

// Route to get tracking information for a specific parcel
router.get('/track/:trackingId', trackingController.getTrackingInfo);

module.exports = router;
