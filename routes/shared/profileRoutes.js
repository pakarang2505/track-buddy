const express = require('express');
const profileController = require('../../controllers/shared/profileController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

//Get profile details for the authenticated staff member
router.get('/', protect, profileController.getProfile);

//Update profile details for the authenticated staff member
router.put('/', protect, profileController.editProfile);

module.exports = router;
