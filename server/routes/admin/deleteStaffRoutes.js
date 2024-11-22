const express = require('express');
const { protect } = require('../../middleware/authMiddleware');
const deleteStaffController = require('../../controllers/admin/deleteStaffController');

const router = express.Router();

// Middleware for protecting routes
router.use(protect);

// Fetch all staff
router.get('/', deleteStaffController.getAllStaff);

// Delete a staff member
router.delete('/:staffId', deleteStaffController.deleteStaff);

//deleteStaff/search?search=Hol
router.get('/search', deleteStaffController.searchStaff);

module.exports = router;
