
const express = require('express');
const locationController = require('../../controllers/customer/locationController');
const router = express.Router();

// Default route for /api/location
router.get('/', (req, res) => {
    res.json({ message: 'Location API is working. Use /find to search for distribution centers.' });
  });
  
// Get all distributions
router.get('/all', locationController.getAllDistributions);

// Search distributions by name, district, or postal code
router.get('/search', locationController.searchDistributions);

module.exports = router;
