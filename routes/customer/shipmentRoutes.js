const express = require('express');
const shipmentController = require('../../controllers/customer/shipmentController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// Apply the `protect` middleware to secure all routes
router.use(protect);

//Default route to check API availability
router.get('/', (req, res) => {
  res.json({ message: 'Shipment API is working. Use /my-shipments to view your shipments.' });
});

//Fetch shipments for the logged-in sender with an optional status filter
//my-shipments?status=in-progress
//my-shipments?status=unsuccessful
//my-shipments?status=delivered
//my-shipments
router.get('/my-shipments', shipmentController.getShipments);

module.exports = router;
