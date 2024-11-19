const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const staffAuthController = require('../../controllers/shared/authController');
const router = express.Router();

router.post('/signup', staffAuthController.signup);
router.post('/login', staffAuthController.login);

//protect middleware is applied to ensure that
//only authenticated users (those currently logged in) can log out.
router.post('/logout', protect, staffAuthController.logout);

module.exports = router;
