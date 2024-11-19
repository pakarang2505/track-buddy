const express = require('express');
const shipmentController = require('../../controllers/customer/shipmentController');
const router = express.Router();

// Default route for /api/shipments
router.get('/', (req, res) => {
  res.json({ message: 'Shipment API is working. Use /my-shipments to view your shipments.' });
});

// Get shipments with optional status filter
router.get('/my-shipments', shipmentController.getShipments);

module.exports = router;
