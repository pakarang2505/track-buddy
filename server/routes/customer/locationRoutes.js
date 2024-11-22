const express = require('express');
const locationController = require('../../controllers/customer/locationController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

//Default route to check API availability
router.get('/', (req, res) => {
  res.json({ message: 'Location API is working. Use /all or /search for more options.' });
});

//Fetch all distribution centers
router.get('/all', locationController.getAllDistributions);

//Search for distributions by name, district, or postal code
//search?query=
router.get('/search', locationController.searchDistributions);

module.exports = router;
