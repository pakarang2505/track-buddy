const express = require('express');
const profileController = require('../../controllers/shared/profileController');
const { protect } = require('../../middleware/authMiddleware');
const router = express.Router();

// Get profile
router.get('/', protect, profileController.getProfile);

// Edit profile
router.put('/', protect, profileController.editProfile);

module.exports = router;
