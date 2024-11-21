const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const staffAuthController = require('../../controllers/shared/authController');

const router = express.Router();

//Staff signup access public
router.post('/signup', staffAuthController.signup);

//Staff login access public
router.post('/login', staffAuthController.login);

//Staff logout
router.post('/logout', protect, staffAuthController.logout);

module.exports = router;
