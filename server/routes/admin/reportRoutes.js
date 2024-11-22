const express = require('express');
const reportController = require('../../controllers/admin/reportController');
const { protect } = require('../../middleware/authMiddleware');

const router = express.Router();

// Apply middleware to protect all routes
router.use(protect);

//Get parcel counts by date
//counts?date=2024-11-21
router.get('/counts', reportController.getParcelCountsByDate);

//Get parcels filtered by status and date
//parcels?date=2024-11-21&status=Unsuccessful
//parcels?date=2024-11-21&status=Delivered
router.get('/parcels', reportController.getParcelsByStatusAndDate);

//Get all unsuccessful parcels
router.get('/unsuccessful', reportController.getUnsuccessfulParcels);

//Update the tracking status of a parcel
router.put('/update-status', reportController.updateTrackingStatus);

//Get all distributions for dropdown with optional search
//distributions?search=thai
router.get('/distributions', reportController.getAllDistributions);

module.exports = router;
