const express = require('express');
const authController = require('../../controllers/customer/authController');

const router = express.Router();

//Register a new user
//access Public
router.post('/signup', authController.signup);

//Authenticate user and return token
//access Public
router.post('/login', authController.login);

module.exports = router;
