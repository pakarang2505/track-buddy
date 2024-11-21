const express = require('express');
const profileController = require('../../controllers/customer/profileController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// Apply the `protect` middleware to secure all routes
router.use(protect);

//Fetch profile details for the logged-in sender
router.get('/', profileController.getProfile);

//Update profile details for the logged-in sender
router.put('/', profileController.updateProfile);

module.exports = router;
