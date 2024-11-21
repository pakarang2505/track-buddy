const express = require('express');
const shipmentController = require('../../controllers/staff/shipmentController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

//Create a new shipment
router.post('/create', protect, shipmentController.createShipment);

module.exports = router;
