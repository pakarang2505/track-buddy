const express = require('express');
const trackingController = require('../../controllers/customer/trackingController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// Apply the `protect` middleware to secure all routes
router.use(protect);

// Default route to check API availability
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Tracking API is working. Use /track/:trackingId or /basic/:trackingId.' });
});

// Apply the `protect` middleware to secure sensitive routes
router.get('/basic/:trackingId', trackingController.getBasicParcelInfo); 
router.get('/track/:trackingId', trackingController.getTrackingInfo); 

module.exports = router;
