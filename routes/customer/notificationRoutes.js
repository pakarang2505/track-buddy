const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const notificationController = require('../../controllers/customer/notificationController');

const router = express.Router();

// Fetch notifications for the logged-in sender
router.get('/', protect, notificationController.getNotifications);

// Export the router
module.exports = router;
