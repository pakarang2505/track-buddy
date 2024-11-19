const express = require('express');
const profileController = require('../../controllers/customer/profileController');
const router = express.Router();

// Route to get profile details
router.get('/', profileController.getProfile);

// Route to update profile details
router.put('/', profileController.updateProfile);

module.exports = router;
