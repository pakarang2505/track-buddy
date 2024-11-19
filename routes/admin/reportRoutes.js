const express = require('express');
const reportController = require('../../controllers/admin/reportController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// Route to get parcel counts by date
router.get('/counts', protect, reportController.getParcelCountsByDate);

// Route to get parcels by status and date
router.get('/parcels', protect, reportController.getParcelsByStatusAndDate);

// Route to get all unsuccessful parcels
router.get('/unsuccessful', protect, reportController.getUnsuccessfulParcels);

// Route to update tracking status
router.put('/update-status', protect, reportController.updateTrackingStatus);

// Route to get all distributions for dropdown with optional search
router.get('/distributions', protect, reportController.getAllDistributions);

module.exports = router;
