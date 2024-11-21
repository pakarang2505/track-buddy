const express = require('express');
const notificationController = require('../../controllers/customer/notificationController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// Apply the `protect` middleware to secure this route
router.use(protect);

// Fetch the list of notifications (Delivered and Unsuccessful parcels)
router.get('/', notificationController.getNotifications);

// Fetch detailed information (Basic Info + Journey) for a specific parcel
router.get('/:trackingId', notificationController.getNotificationDetails);

module.exports = router;
