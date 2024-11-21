const express = require('express');
const trackingController = require('../../controllers/admin/trackingController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// Apply the `protect` middleware
router.use(protect);

// Fetch basic info of a parcel by tracking_id
router.get('/basic/:trackingId', trackingController.getBasicInfo);

// Fetch basic info + journey details of a parcel by tracking_id
router.get('/full/:trackingId', trackingController.getBasicAndJourneyInfo);

module.exports = router;
